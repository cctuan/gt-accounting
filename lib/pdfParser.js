let pdfjsLib;
if (typeof window !== 'undefined') {
  // 動態導入 PDF.js，只在瀏覽器環境中執行
  import('pdfjs-dist').then((pdf) => {
    pdfjsLib = pdf;
    // 設定 worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
  });
}

async function convertPDFPageToImage(page, scale = 2.0) {
  try {
    // 設定 viewport
    const viewport = page.getViewport({ scale });
    
    // 創建 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 渲染 PDF 頁面到 canvas
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // 將 canvas 轉換為 base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.95)
      .replace('data:image/jpeg;base64,', '');

    return base64Image;
  } catch (error) {
    console.error('Error converting PDF page to image:', error);
    throw error;
  }
}

export async function parsePDF(base64Data, password = null) {
  // 確保在瀏覽器環境中執行
  if (typeof window === 'undefined') {
    throw new Error('This function can only be used in browser environment');
  }

  // 確保 pdfjsLib 已經載入
  if (!pdfjsLib) {
    throw new Error('PDF.js library not loaded yet');
  }

  try {
    // Convert base64 to Uint8Array
    const pdfData = base64ToUint8Array(base64Data);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      password: password
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const base64Images = [];

    // Extract text from all pages
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const base64Image = await convertPDFPageToImage(page);
      base64Images.push(base64Image);
    }

    return base64Images
  } catch (error) {
    if (error.name === 'PasswordException') {
      throw new Error('PDF is password protected');
    }
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

function base64ToUint8Array(base64) {
  // 將 base64 轉換為標準格式
  const normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  
  // 如果長度不是 4 的倍數，添加適當的填充
  const padding = normalizedBase64.length % 4;
  const paddedBase64 = padding ? normalizedBase64 + '='.repeat(4 - padding) : normalizedBase64;
  
  try {
    const binaryString = window.atob(paddedBase64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (error) {
    console.error('Error converting base64:', error);
    throw new Error('Invalid base64 data');
  }
}
