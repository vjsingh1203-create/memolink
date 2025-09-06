
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function toCSV(rows:any[]){
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v:any)=>(''+(v??'')).replace(/"/g,'""');
  const lines = [headers.join(',')].concat(rows.map(r=>headers.map(h=>`"${escape(r[h])}"`).join(',')));
  return lines.join('\n');
}

export default async function handler(req: any, res: any) {
  try {
    const memoId = req.query.memoId as string;
    const { data: rows, error } = await supabaseAdmin
      .rpc('report_acknowledgements', { p_memo_id: memoId });
    if (error) throw error;

    const csv = toCSV(rows||[]);
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition',`attachment; filename="memolink_report_${memoId}.csv"`);
    res.status(200).send(csv);
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'Error' });
  }
}
