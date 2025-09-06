
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function MyTasks() {
  const [t, setT] = useState('');
  const [err, setErr] = useState('');
  const r = useRouter();

  const open = () => {
    if (!t.trim()) { setErr('Paste the token from your email.'); return; }
    r.push(`/a/${encodeURIComponent(t.trim())}`);
  };

  return (
    <div className="container">
      <h1>My Tasks</h1>
      <p>Paste the token from your email link to open your memo.</p>
      <div style={{maxWidth:480}} className="card">
        <input
          value={t}
          onChange={e=>{ setT(e.target.value); setErr(''); }}
          placeholder="e.g. 7c9b3b1f..."
          onKeyDown={e=> e.key==='Enter' && open() }
        />
        <div style={{marginTop:12, display:'flex', gap:12}}>
          <button className="btn" onClick={open}>Open</button>
          <button className="btn" onClick={()=>{ setT(''); setErr(''); }}>Clear</button>
        </div>
        {err && <p style={{color:'#b91c1c'}}>{err}</p>}
      </div>
    </div>
  );
}
