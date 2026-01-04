import { pdf } from '@react-pdf/renderer';
import { EvaluationPDF } from './EvaluationPDF';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';

/**
 * Generate a PDF blob from an evaluation and property.
 * Uses @react-pdf/renderer for client-side PDF generation.
 */
export async function generateEvaluationPDF(
  evaluation: Evaluation,
  property: Property
): Promise<Blob> {
  const document = EvaluationPDF({ evaluation, property });
  const blob = await pdf(document).toBlob();
  return blob;
}

/**
 * Generate a PDF and trigger download.
 */
export async function downloadEvaluationPDF(
  evaluation: Evaluation,
  property: Property,
  filename?: string
): Promise<void> {
  const blob = await generateEvaluationPDF(evaluation, property);

  // Create download filename
  const defaultFilename = `${property.address.replace(/[^a-zA-Z0-9]/g, '_')}_evaluation.pdf`;
  const downloadFilename = filename || defaultFilename;

  // Create download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
