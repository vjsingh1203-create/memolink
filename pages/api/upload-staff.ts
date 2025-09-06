
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const buf = Buffer.concat(chunks);
    const text = buf.toString('utf8');
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map(s=>s.trim().toLowerCase());
    const idx = (h:string)=>headers.indexOf(h);
    const rows = lines.slice(1).map(l=>l.split(',')).map(cols=> ({
      email: cols[idx('email')]?.trim(),
      name: cols[idx('name')]?.trim()||'',
      role: cols[idx('role')]?.trim()||'',
      depot: cols[idx('depot')]?.trim()||'',
      team: cols[idx('team')]?.trim()||'',
      phone: cols[idx('phone')]?.trim()||'',
    })).filter(r=>r.email);

    let inserted = 0, updated = 0;
    for (const r of rows){
      const { data: existing } = await supabaseAdmin.from('users_ml').select('id').eq('email', r.email).maybeSingle();
      if (existing){
        await supabaseAdmin.from('users_ml').update(r).eq('id', existing.id);
        updated++;
      } else {
        await supabaseAdmin.from('users_ml').insert(r);
        inserted++;
      }
    }
    res.status(200).json({ ok:true, inserted, updated });
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'Upload failed' });
  }
}
