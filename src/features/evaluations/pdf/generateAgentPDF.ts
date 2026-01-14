import { pdf } from '@react-pdf/renderer';
import { AgentPDF } from './AgentPDF';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';

/**
 * Generate an Agent PDF blob from an evaluation and property.
 * Uses @react-pdf/renderer for client-side PDF generation.
 */
export async function generateAgentPDF(
  evaluation: Evaluation,
  property: Property
): Promise<Blob> {
  const document = AgentPDF({ evaluation, property });
  const blob = await pdf(document).toBlob();
  return blob;
}

/**
 * Generate an Agent PDF and trigger download.
 */
export async function downloadAgentPDF(
  evaluation: Evaluation,
  property: Property,
  filename?: string
): Promise<void> {
  const blob = await generateAgentPDF(evaluation, property);

  // Create download filename
  const defaultFilename = `${property.address.replace(/[^a-zA-Z0-9]/g, '_')}_investment_analysis.pdf`;
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
