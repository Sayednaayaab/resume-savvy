// API endpoint for extracting text from files
// Handles PDF, DOCX, and TXT files

const formidable = require('formidable');
const mammoth = require('mammoth');
const pdfjsLib = require('pdfjs-dist');

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.min.js');

async function extractTextFromFile(file) {
  const fileType = file.mimetype;
  const fileName = file.originalFilename.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const data = require('fs').readFileSync(file.filepath);
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str || '').join(' ');
        text += pageText + ' ';
      }

      const extractedText = text.trim();
      if (!extractedText) {
        throw new Error('No text content found in PDF. The PDF might be image-based or corrupted.');
      }

      return extractedText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    try {
      const data = require('fs').readFileSync(file.filepath);
      const result = await mammoth.extractRawText({ buffer: data });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw new Error('Failed to extract text from DOCX file.');
    }
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    try {
      return require('fs').readFileSync(file.filepath, 'utf-8');
    } catch (error) {
      console.error('Error extracting text from TXT:', error);
      throw new Error('Failed to extract text from TXT file.');
    }
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const text = await extractTextFromFile(file);
    
    return res.status(200).json({ text });
  } catch (error) {
    console.error('Error in extract-text API:', error);
    return res.status(500).json({ 
      error: 'Failed to extract text from file',
      message: error.message 
    });
  }
};
