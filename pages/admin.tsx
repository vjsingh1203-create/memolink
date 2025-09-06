
import { useState } from 'react';

export default function Admin() {
  const [csv, setCsv] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [memoFile, setMemoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [memoId, setMemoId] = useState('');
  const [role, setRole] = useState('');
  const [depot, setDepot] = useState('');
  const [links, setLinks] = useState<any[]>([]);

  const [toast, setToast] = useState<{type:'success'|'error'|'info', msg:string}|null>(null);
  const [loading, setLoading] = useState<string>('');
  const pop = (type:'success'|'error'|'info', msg:string)=>{ setToast({type,msg}); setTimeout(()=>setToast(null), 3000); };

  const uploadCsv = async () => {
    if (!csv) { pop('error','Choose a CSV first'); return; }
    setLoading('csv');
    try{
      const body = new FormData();
      body.append('file', csv);
      const res = await fetch('/api/upload-staff', { method:'POST', body });
      const j = await res.json();
      setStatus(`Uploaded ${j.inserted} staff (updated ${j.updated}).`);
      pop('success','Staff uploaded');
    }catch(e:any){ pop('error','Upload failed'); }
    setLoading('');
  };

  const createMemo = async () => {
    if (!memoFile || !title || !due) { pop('error','Fill title, due, and select a file'); return; }
    setLoading('memo');
    try{
      const body = new FormData();
      body.append('file', memoFile);
      body.append('title', title);
      body.append('due', due);
      const res = await fetch('/api/create-memo', { method:'POST', body });
      const j = await res.json();
      setMemoId(j.memoId);
      setStatus(`Created memo: ${j.memoId}`);
      pop('success','Memo created');
    }catch(e:any){ pop('error','Memo creation failed'); }
    setLoading('');
  };

  const assign = async () => {
    if (!memoId) { pop('error','Create a memo first'); return; }
    setLoading('assign');
    try{
      const res = await fetch('/api/assign', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoId, role, depot })
      });
      const j = await res.json();
      setLinks(j.links || []);
      setStatus(`Generated ${j.links?.length || 0} links. Emails attempted: ${j.emailsSent || 0}`);
      pop('success','Links generated');
    }catch(e:any){ pop('error','Assign failed'); }
    setLoading('');
  };

  return (
    <div className="container">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      <h1>Admin</h1>

      <div className="card">
        <h2>1) Upload staff CSV</h2>
        <div className="drop" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault(); setCsv(e.dataTransfer.files?.[0]||null);}}>
          Drag & drop CSV here or choose a file
        </div>
        <input type="file" accept=".csv" onChange={e=>setCsv(e.target.files?.[0]||null)} /> {csv && <p style={{marginTop:8}}>Selected: <strong>{csv.name}</strong></p>} {loading==='csv' && <p>Uploading...</p>}
        <button className="btn" onClick={uploadCsv}>Upload</button>
        <p>{status}</p>
      </div>

      <div className="card">
        <h2>2) Upload memo (PDF/Word/PPT)</h2>
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} /></label>
        <label>Due date<input type="date" value={due} onChange={e=>setDue(e.target.value)} /></label>
        <div className="drop" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault(); setMemoFile(e.dataTransfer.files?.[0]||null);}}>
          Drag & drop memo file (PDF/Word/PPT) or choose a file
        </div>
        <input type="file" onChange={e=>setMemoFile(e.target.files?.[0]||null)} /> {memoFile && <p style={{marginTop:8}}>Selected: <strong>{memoFile.name}</strong></p>} {loading==='memo' && <p>Uploading memo...</p>}
        <button className="btn" onClick={createMemo}>Create Memo</button>
        {memoId && <p>Memo ID: <code>{memoId}</code></p>}
      </div>

      <div className="card">
        <h2>3) Assign & email magic links</h2>
        <label>Filter by role <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g., Driver" /></label>
        <label>Filter by depot <input value={depot} onChange={e=>setDepot(e.target.value)} placeholder="e.g., NSW" /></label>
        {loading==='assign' && <p>Assigning & emailing...</p>}
        <button className="btn" onClick={assign}>Generate links & send emails</button>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Link</th></tr></thead>
          <tbody>{links.map((l,i)=>(<tr key={i}><td>{l.name}</td><td>{l.email}</td><td><a href={l.url} target="_blank">open</a></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
