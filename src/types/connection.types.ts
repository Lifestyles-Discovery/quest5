/**
 * Connection (Contact) types
 */

export interface Connection {
  id: string;
  type: string; // e.g., "Agent", "Inspector", "Lender", "Contractor"
  name: string;
  email: string;
  phone: string;
  deleted: boolean; // Soft delete/hide
}

export interface ConnectionFormData {
  type: string;
  name: string;
  email: string;
  phone: string;
}

export const CONNECTION_TYPES = [
  'Agent',
  'Inspector',
  'Lender',
  'Contractor',
  'Property Manager',
  'Attorney',
  'Appraiser',
  'Insurance Agent',
  'Title Company',
  'Other',
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];
