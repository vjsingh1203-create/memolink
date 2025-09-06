
import Link from 'next/link';
export default function Home(){
  return (
    <div className="container">
      <h1>MemoLink</h1>
      <p>Send memos & toolbox talks by email and capture read/sign-off records.</p>
      <p><Link className="btn" href="/admin">Open Admin</Link></p>
      <div className="card">
        <h3>Includes</h3>
        <ul>
          <li>Staff CSV upload → Supabase</li>
          <li>Memo file upload (PDF/Word/PPT) → Storage</li>
          <li>Assignments → per-user magic links (+ email via SendGrid)</li>
          <li>Read & Sign page (token)</li>
          <li>CSV export endpoint for audits</li>
        </ul>
      </div>
    </div>
  )
}
