// pages/api/check-email.js
import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { bank } = req.query;
  if (!bank) {
    return res.status(400).json({ error: 'Bank parameter is required' });
  }

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
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread subject:"${bank}" subject:"信用卡" subject:"帳單"`,
    });

    const messages = response.data.messages || [];
    const emailResults = [];

    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
      const subject = email.data.payload.headers.find(header => header.name === 'Subject')?.value || '';
      
      const attachments = [];
      const parts = email.data.payload.parts || [];
      
      for (const part of parts) {
        if (part.filename.endsWith('.pdf')) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: message.id,
            id: part.body.attachmentId,
          });
          attachments.push({
            filename: part.filename,
            data: attachment.data.data,
          });
        }
      }

      emailResults.push({
        title: subject,
        attachments
      });
    }

    res.status(200).json({ 
      emails: emailResults
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
}
