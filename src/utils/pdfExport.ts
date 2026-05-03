export async function exportToPDF(elementId: string, filename: string = 'resume.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Use native print dialog which allows "Save as PDF".
  // This avoids html2canvas parsing errors with tailwind v4 colors (oklch)
  // and produces a high-quality, text-selectable vector PDF ideal for ATS.
  
  const originalTitle = document.title;
  document.title = filename.replace('.pdf', '');
  
  window.print();
  
  setTimeout(() => {
    document.title = originalTitle;
  }, 500);
}
