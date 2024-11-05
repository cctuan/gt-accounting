import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { parseImagesIntoBill } from '@/lib/imageParser';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  try {
    // 檢查 session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      console.log('No session found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // 確認是 Google 登入
    if (!session.user?.email) {
      console.log('No Google email found');
      return res.status(403).json({ error: 'Must login with Google' });
    }

    // 原有的 parse-bill 邏輯
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { base64Images, settings } = req.body;

    if (!Array.isArray(base64Images) || base64Images.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty base64Images array' });
    }

    // 使用 imageParser 的邏輯來解析帳單，並傳入所有設定
    const billStatement = await parseImagesIntoBill(base64Images, settings);

    res.status(200).json(billStatement);
  } catch (error) {
    console.error('Parse bill error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}