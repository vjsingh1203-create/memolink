
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
  try {
    const { assignment_target_id, signed_name } = req.body || {};
    if (!assignment_target_id || !signed_name) return res.status(400).json({ ok:false, error:'Missing fields' });

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const ua = (req.headers['user-agent'] || '').toString();

    const { error: e1 } = await supabaseAdmin.from('acknowledgements').insert({
      assignment_target_id, signed_name, ip_addr: ip, user_agent: ua
    });
    if (e1) return res.status(500).json({ ok:false, error: e1.message });

    await supabaseAdmin.from('assignment_targets').update({ status:'acknowledged' }).eq('id', assignment_target_id);

    res.status(200).json({ ok:true });
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'Error' });
  }
}
