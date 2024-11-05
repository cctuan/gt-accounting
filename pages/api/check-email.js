// pages/api/check-email.js
import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    // List unread emails in the inbox
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });

    const messages = response.data.messages || [];
    const pdfAttachments = [];

    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const subject = email.data.payload.headers.find(header => header.name === 'Subject')?.value || '';
      
      // Apply your subject rule
      if (subject.includes('Your Rule')) {
        // Look for PDF attachments
        const parts = email.data.payload.parts || [];
        for (const part of parts) {
          if (part.filename.endsWith('.pdf')) {
            const attachment = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: message.id,
              id: part.body.attachmentId,
            });
            pdfAttachments.push({
              filename: part.filename,
              data: attachment.data.data,
            });
          }
        }
      }
    }

    res.status(200).json({ pdfAttachments });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
}
