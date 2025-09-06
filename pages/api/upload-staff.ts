import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const config = { api: { bodyParser: true } };

export default async function handler(req: any, res: any) {
  try {
    const { staff } = req.body;

    if (!staff || !Array.isArray(staff)) {
      return res.status(400).json({ ok: false, error: 'Missing staff[]' });
    }

    const { error } = await supabaseAdmin.from('staff').insert(staff);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
}
