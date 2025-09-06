import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
  try {
    const { memoId, staffId } = req.body;

    if (!memoId || !staffId) {
      return res.status(400).json({ ok: false, error: 'Missing memoId or staffId' });
    }

    const { error } = await supabaseAdmin
      .from('acknowledgements')
      .insert({ memo_id: memoId, staff_id: staffId });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
}
