import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
  try {
    const { memoId, staffIds } = req.body;

    if (!memoId || !staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({ ok: false, error: 'Missing memoId or staffIds[]' });
    }

    const inserts = staffIds.map((sid: string) => ({ memo_id: memoId, staff_id: sid }));
    const { error } = await supabaseAdmin.from('assignments').insert(inserts);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error' });
  }
}
