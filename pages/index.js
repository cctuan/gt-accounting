// pages/index.js
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [pdfAttachments, setPdfAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    const response = await fetch('/api/check-email');
    const data = await response.json();
    setPdfAttachments(data.pdfAttachments || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      // Trigger the email-fetching function on login if you want automatic checking
      fetchEmails();
    }
  }, [session]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Email PDF Extractor Service</h1>
      <p>
        This service allows you to automatically check your Gmail inbox for new emails
        that match certain criteria in the subject line. If an email with a PDF attachment
        matches the criteria, the attachment will be available for download here.
      </p>

      {!session ? (
        <div>
          <button onClick={() => signIn('google')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Sign in with Google
          </button>
        </div>
      ) : (
        <div>
          <p>Welcome, {session.user.name}! You are logged in.</p>
          <button onClick={() => signOut()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Sign out
          </button>
          <br /><br />
          <button onClick={fetchEmails} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            {loading ? 'Checking for Emails...' : 'Check for PDF Attachments'}
          </button>
          
          <h2>PDF Attachments</h2>
          {pdfAttachments.length > 0 ? (
            <ul>
              {pdfAttachments.map((attachment, index) => (
                <li key={index}>
                  <a
                    href={`data:application/pdf;base64,${attachment.data}`}
                    download={attachment.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download {attachment.filename}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>{loading ? 'Checking for attachments...' : 'No matching attachments found.'}</p>
          )}
        </div>
      )}
    </div>
  );
}
