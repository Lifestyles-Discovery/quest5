import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportPdfOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Generate a PDF from an HTML element
 * @param elementId - The ID of the element to capture
 * @param options - Export options including filename and header text
 */
export async function generatePdf(
  elementId: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  console.log('[PDF Export] Starting PDF generation for element:', elementId);

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  console.log('[PDF Export] Element found, dimensions:', element.scrollWidth, 'x', element.scrollHeight);

  const { filename = 'evaluation.pdf', title, subtitle } = options;

  // Store original styles to restore later
  const originalOverflow = element.style.overflow;
  const originalHeight = element.style.height;

  // Temporarily expand element to full height for capture
  element.style.overflow = 'visible';
  element.style.height = 'auto';

  // Add print class to hide interactive elements
  element.classList.add('printing');

  try {
    console.log('[PDF Export] Capturing canvas with html2canvas...');

    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true, // Enable html2canvas logging for debugging
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      // Fix oklch colors that html2canvas doesn't support
      onclone: (clonedDoc) => {
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const computed = window.getComputedStyle(htmlEl);

          // Override any oklch colors with fallback values
          if (computed.color.includes('oklch')) {
            htmlEl.style.color = '#344054';
          }
          if (computed.backgroundColor.includes('oklch')) {
            htmlEl.style.backgroundColor = '#ffffff';
          }
          if (computed.borderColor.includes('oklch')) {
            htmlEl.style.borderColor = '#e4e7ec';
          }
        });
      },
    });

    console.log('[PDF Export] Canvas captured, size:', canvas.width, 'x', canvas.height);

    // Calculate dimensions for PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const headerHeight = title ? 20 : 0;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add header if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 10, 15);

      if (subtitle) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(subtitle, 10, 22);
        pdf.setTextColor(0, 0, 0);
      }
    }

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png');

    // Calculate content position and available height
    const contentY = headerHeight + 5;
    const availableHeight = pageHeight - contentY - 10; // Leave margin at bottom

    // Handle multi-page content
    let heightLeft = imgHeight;
    let position = contentY;
    let pageNum = 1;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= availableHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pageNum++;

      // Add page number footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${pageNum}`, imgWidth / 2, pageHeight - 5, {
        align: 'center',
      });
      pdf.setTextColor(0, 0, 0);

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add page number to first page
    pdf.setPage(1);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page 1 of ${pageNum}`, imgWidth - 10, pageHeight - 5, {
      align: 'right',
    });

    // Save the PDF
    console.log('[PDF Export] Saving PDF as:', filename);

    // Try using blob download as fallback
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    console.log('[PDF Export] PDF download triggered successfully');
  } finally {
    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.height = originalHeight;
    element.classList.remove('printing');
  }
}

/**
 * Generate filename for evaluation PDF
 */
export function generateEvaluationFilename(address?: string): string {
  const date = new Date().toISOString().split('T')[0];
  const cleanAddress = address
    ? address.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    : 'evaluation';
  return `${cleanAddress}-${date}.pdf`;
}
