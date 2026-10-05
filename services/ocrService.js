const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

/**
 * Performs local OCR using Tesseract.js and extracts structured bill data.
 * @param {string} filePath - Local filesystem path to the uploaded bill file.
 * @returns {Promise<{ rawOcrText: string, parsedOcrData: Object }>}
 */
const processBillOCR = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    console.log(`Starting Tesseract OCR on file: ${filePath}`);
    
    // Perform OCR recognition locally using tesseract.js
    const result = await Tesseract.recognize(filePath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });

    const rawOcrText = result && result.data ? result.data.text : '';
    console.log('--- OCR RAW TEXT EXCERPT ---');
    console.log(rawOcrText.substring(0, 300));

    // Parse useful data from raw text using regex and keyword heuristics
    const parsedOcrData = parseRawBillText(rawOcrText);

    return {
      rawOcrText,
      parsedOcrData,
    };
  } catch (error) {
    console.error('OCR Processing Error:', error.message);
    return {
      rawOcrText: 'OCR extraction failed or unsupported file format for OCR.',
      parsedOcrData: {
        invoiceNumber: '',
        purchaseDate: '',
        customerName: '',
        productName: '',
        brand: '',
        modelNumber: '',
        serialNumber: '',
        totalAmount: '',
      },
    };
  }
};

/**
 * Heuristic & regex parser for extracted bill text.
 * @param {string} text
 */
function parseRawBillText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let invoiceNumber = '';
  let purchaseDate = '';
  let customerName = '';
  let productName = '';
  let brand = '';
  let modelNumber = '';
  let serialNumber = '';
  let totalAmount = '';

  // 1. Invoice Number Extraction
  const invMatch = text.match(/(?:Invoice|Bill|Inv|Tax Invoice|Receipt|Ref)[\s\w#.-]*[:#-]?\s*([A-Z0-9/-]{3,20})/i);
  if (invMatch) {
    invoiceNumber = invMatch[1];
  }

  // 2. Purchase Date Extraction (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, Month DD, YYYY)
  const dateMatch = text.match(/(?:Date|Dated|Bill Date|Purchase Date)[\s:]*([0-3]?\d[./-][0-1]?\d[./-]\d{2,4}|\d{4}[./-][0-1]?\d[./-][0-3]?\d)/i);
  if (dateMatch) {
    purchaseDate = dateMatch[1];
  } else {
    // Generic date pattern search
    const genDateMatch = text.match(/\b([0-3]?\d[./-][0-1]?\d[./-](?:20)?\d{2})\b/);
    if (genDateMatch) {
      purchaseDate = genDateMatch[1];
    }
  }

  // Normalize date format if needed
  if (purchaseDate) {
    purchaseDate = normalizeDateString(purchaseDate);
  }

  // 3. Amount Extraction
  const amountMatch = text.match(/(?:Total|Grand Total|Net Amount|Amount Payable|Rs\.?|INR)[\s:]*([₹\d,]+(?:\.\d{2})?)/i);
  if (amountMatch) {
    totalAmount = amountMatch[1].replace(/[^0-9.]/g, '');
  }

  // 4. Model Number & Serial Number
  const modelMatch = text.match(/(?:Model|Model No|Item Code|Part No)[\s:]*([A-Z0-9-]{3,20})/i);
  if (modelMatch) {
    modelNumber = modelMatch[1];
  }

  const serialMatch = text.match(/(?:Serial|Sl No|S\/N|Serial No)[\s:]*([A-Z0-9-]{5,25})/i);
  if (serialMatch) {
    serialNumber = serialMatch[1];
  }

  // 5. Brand Identification
  const knownBrands = ['Samsung', 'LG', 'Whirlpool', 'Sony', 'Panasonic', 'Godrej', 'Haier', 'Voltas', 'Daikin', 'Blue Star', 'IFB', 'Bosch', 'Philips', 'Bajaj', 'Havells'];
  for (const b of knownBrands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(text)) {
      brand = b;
      break;
    }
  }

  // 6. Customer Name
  const custMatch = text.match(/(?:Customer|Name|Billed To|Client)[\s:]+([A-Za-z\s]{3,30})/i);
  if (custMatch) {
    customerName = custMatch[1].trim();
  }

  return {
    invoiceNumber,
    purchaseDate,
    customerName,
    productName,
    brand,
    modelNumber,
    serialNumber,
    totalAmount,
  };
}

function normalizeDateString(dateStr) {
  try {
    const parts = dateStr.split(/[./-]/);
    if (parts.length === 3) {
      let day, month, year;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1].padStart(2, '0');
        day = parts[2].padStart(2, '0');
      } else {
        // DD-MM-YYYY
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      }
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // return as is if parsing fails
  }
  return dateStr;
}

module.exports = { processBillOCR };
