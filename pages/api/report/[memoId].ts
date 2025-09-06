import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
  try {
    const { memoId } = req.query;
    if (!memoId) return res.status(400).json({ ok: false, error: 'Missing memoId' });

    const { data, error } = await supabaseAdmin
      .from('acknowledgements')
      .select('staff_id, created_at')
      .eq('memo_id', memoId);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, acknowledgements: data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
}