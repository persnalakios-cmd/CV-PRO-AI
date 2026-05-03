import { PDFDocument } from 'pdf-lib';

export const fileToBase64 = async (file: File): Promise<string> => {
  // If it's a PDF, keep only the first two pages to avoid token limits
  if (file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      if (pageCount > 2) {
        const newPdf = await PDFDocument.create();
        const [page1, page2] = await newPdf.copyPages(pdfDoc, [0, 1]);
        newPdf.addPage(page1);
        if (page2) newPdf.addPage(page2);
        
        const newPdfBytes = await newPdf.saveAsBase64();
        return newPdfBytes;
      }
    } catch (e) {
      console.warn("Could not slice PDF, falling back to full PDF", e);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the prefix "data:...;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
