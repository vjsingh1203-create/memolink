import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  try {
    const contentType = (req.headers['content-type'] || '') as string;
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ ok:false, error:'No boundary' });

    const chunks: Buffer[] = [];
    for await (const ch of req) chunks.push(ch as Buffer);
    const buf = Buffer.concat(chunks);

    // We're going to parse the multipart body in "binary" to keep indices stable
    const str = buf.toString('binary');
    const parts = str.split('--' + boundary).filter(p => p.includes('Content-Disposition'));

    let fileName = '';
    let fileBytes: Buffer | null = null;
    let title = '';
    let due = '';

    for (const part of parts) {
      const [rawHeaders, rawBody] = part.split('\r\n\r\n');
      if (!rawBody) continue;

      // Trim the trailing CRLF from the part body
      const body = rawBody.slice(0, -2); // <-- 'body' is a STRING here

      const mName = /name="([^"]+)"/.exec(rawHeaders);
      const name = mName ? mName[1] : '';
      const mFile = /filename="([^"]+)"/.exec(rawHeaders);

      if (mFile) {
        // It's a file field
        fileName = mFile[1];

        // Find the byte range in the original Buffer that corresponds to this body's string slice
        const bodyBuf = Buffer.from(body, 'binary');
        const start = buf.indexOf(bodyBuf);
        const end = start + bodyBuf.length;
        fileBytes = buf.slice(start, end);
      } else {
        // It's a text field – 'body' is already a string; do NOT call toString on it
        const val = body; // <-- this was the error line before
        if (name === 'title') title = val.trim();
        if (name === 'due') due = val.trim();
      }
    }

    if (!fileBytes || !fileName || !title || !due) {
      return res.status(400).json({ ok:false, error:'Missing fields' });
    }

    const ext = fileName.split('.').pop();
    const key = `memos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload to Supabase Storage (bucket: memolink)
    const { error: e1 } = await supabaseAdmin.storage.from('memolink').upload(key, fileBytes, {
      contentType: 'application/octet-stream',
      upsert: false
    });
    if (e1) return res.status(500).json({ ok:false, error: e1.message });

    const { data: url } = await supabaseAdmin.storage.from('memolink').getPublicUrl(key);

    // Insert memo row
    const { data: inserted, error: e2 } = await supabaseAdmin
      .from('memos')
      .insert({ title, due, file_key: key, file_url: url.publicUrl, version: '1.0' })
      .select('id')
      .single();

    if (e2) return res.status(500).json({ ok:false, error: e2.message });

    return res.status(200).json({ ok:true, memoId: inserted.id, file: key });
  } catch (e: any) {
    return res.status(500).json({ ok:false, error: e?.message || 'Error' });
  }
}

import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  try {
    const boundary = (req.headers['content-type']||'').split('boundary=')[1];
    if (!boundary) return res.status(400).json({ ok:false, error:'No boundary' });

    const chunks: Buffer[] = [];
    for await (const ch of req) chunks.push(ch as Buffer);
    const buf = Buffer.concat(chunks);

    const str = buf.toString('binary');
    const parts = str.split('--' + boundary).filter(p => p.includes('Content-Disposition'));
    let fileName = '', fileBytes: Buffer | null = null, title = '', due='';

    for (const part of parts){
      const [rawHeaders, rawBody] = part.split('\r\n\r\n');
      if (!rawBody) continue;
      const body = rawBody.slice(0, -2);
      const mName = /name="([^"]+)"/.exec(rawHeaders);
      const name = mName ? mName[1] : '';
      const mFile = /filename="([^"]+)"/.exec(rawHeaders);

      if (mFile){
        fileName = mFile[1];
        const start = buf.indexOf(Buffer.from(rawBody, 'binary'));
        const end = start + Buffer.from(body, 'binary').length;
        fileBytes = buf.slice(start, end);
      } else {
        const val = body.toString('utf8');
        if (name === 'title') title = val.trim();
        if (name === 'due') due = val.trim();
      }
    }

    if (!fileBytes || !fileName || !title || !due) return res.status(400).json({ ok:false, error:'Missing fields' });

    const ext = fileName.split('.').pop();
    const key = `memos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: e1 } = await supabaseAdmin.storage.from('memolink').upload(key, fileBytes, {
      contentType: 'application/octet-stream', upsert: false
    });
    if (e1) return res.status(500).json({ ok:false, error: e1.message });

    const { data: url } = await supabaseAdmin.storage.from('memolink').getPublicUrl(key);
    const { data: inserted, error: e2 } = await supabaseAdmin.from('memos').insert({
      title, due, file_key: key, file_url: url.publicUrl, version: '1.0'
    }).select('id').single();

    if (e2) return res.status(500).json({ ok:false, error: e2.message });

    res.status(200).json({ ok:true, memoId: inserted.id, file: key });
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || 'Error' });
  }
}
