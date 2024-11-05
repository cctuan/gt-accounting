import { parseImagesIntoBill } from '@/lib/imageParser';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Images, settings } = req.body;

    if (!Array.isArray(base64Images) || base64Images.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty base64Images array' });
    }

    // 使用 imageParser 的邏輯來解析帳單，並傳入所有設定
    const billStatement = await parseImagesIntoBill(base64Images, settings);

    res.status(200).json(billStatement);
  } catch (error) {
    console.error('Error analyzing bill:', error);
    res.status(500).json({ 
      error: 'Failed to analyze bill',
      details: error.message 
    });
  }
}