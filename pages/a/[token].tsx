
import { GetServerSideProps } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { useState } from 'react';

type Props = {
  ok: boolean;
  error?: string;
  memo?: any;
  assignment_target_id?: string;
}

export default function Reader({ ok, error, memo, assignment_target_id }: Props){
  const [signedName, setSignedName] = useState('');
  const [status, setStatus] = useState('');

  if (!ok) return <div className="container"><p>{error}</p></div>;

  const ack = async () => {
    setStatus('Submitting...');
    const res = await fetch('/api/ack', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ assignment_target_id, signed_name: signedName })
    });
    const j = await res.json();
    setStatus(j.ok ? 'Acknowledged. Thank you.' : ('Error: ' + j.error));
  };

  return (
    <div className="container">
      <h1>{memo.title}</h1>
      <p>Due: {memo.due}</p>
      <div className="card">
        <p>File: <a href={memo.file_url} target="_blank" rel="noreferrer">Open document</a></p>
      </div>
      <div className="card">
        <h3>Acknowledgement</h3>
        <label>Your name (signature)<input value={signedName} onChange={e=>setSignedName(e.target.value)} /></label>
        <button className="btn" onClick={ack}>Acknowledge</button>
        <p>{status}</p>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { props: { ok:false, error:'Server not configured. Ask admin to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' } };
  }
  const token = ctx.params?.token as string;
  if (!token) return { props: { ok:false, error:'Missing token' } };

  const { data: link, error: e1 } = await supabaseAdmin
    .from('assignment_links')
    .select('id, assignment_target_id, memo_id')
    .eq('token', token)
    .single();

  if (e1 || !link) return { props: { ok:false, error:'Invalid or expired link' } };

  const { data: memo, error: e2 } = await supabaseAdmin
    .from('memos')
    .select('id, title, due, file_url')
    .eq('id', link.memo_id)
    .single();

  if (e2 || !memo) return { props: { ok:false, error:'Memo not found' } };

  return { props: { ok:true, memo, assignment_target_id: link.assignment_target_id } };
};
