
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
}

function token() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

export default async function handler(req: any, res: any) {
  try {
    const { memoId, role='', depot='' } = req.body || {};
    if (!memoId) return res.status(400).json({ ok:false, error:'memoId required' });

    const { data: users, error: e1 } = await supabaseAdmin
      .from('users_ml')
      .select('id,name,email,role,depot')
      .ilike('role', role ? `%${role}%` : '%')
      .ilike('depot', depot ? `%${depot}%` : '%');

    if (e1) return res.status(500).json({ ok:false, error: e1.message });

    const { data: memo, error: e2 } = await supabaseAdmin.from('memos').select('id,title,due').eq('id', memoId).single();
    if (e2 || !memo) return res.status(404).json({ ok:false, error:'Memo not found' });

    let emailsSent = 0;
    const links:any[] = [];
    for (const u of (users||[])){
      const tok = token();
      const { data: at } = await supabaseAdmin.from('assignment_targets').insert({
        memo_id: memoId, user_id: u.id, status: 'assigned'
      }).select('id').single();

      await supabaseAdmin.from('assignment_links').insert({
        memo_id: memoId, assignment_target_id: at?.id, token: tok
      });

      const url = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/a/${tok}`;
      links.push({ name: u.name, email: u.email, url });

      if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL){
        try {
          await sgMail.send({
            to: u.email,
            from: process.env.FROM_EMAIL as string,
            subject: `[MemoLink] ${memo.title} (Due ${memo.due})`,
            html: `<p>Hello ${u.name||u.email},</p><p>Please read and acknowledge:</p><p><a href="${url}">Open memo</a></p><p>Due: ${memo.due}</p>`
          });
          emailsSent++;
        } catch {}
      }
    }

    res.status(200).json({ ok:true, links, emailsSent });
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'Error' });
  }
}
