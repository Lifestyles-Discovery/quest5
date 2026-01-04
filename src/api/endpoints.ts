/**
 * API Endpoints for Liberator API
 * Organized by feature area
 */

export const ENDPOINTS = {
  // Authentication
  auth: {
    signIn: 'sessions',
    getSession: (sessionKey: string) => `sessions/${sessionKey}`,
    createSharedSession: (guid: string, editKey: string) =>
      `sessions/sharing/${guid}/${editKey}`,
    createSubscription: 'auth/subscription',
    reactivateSubscription: (userId: string) =>
      `auth/subscription/${userId}/reactivate`,
  },

  // Properties
  properties: {
    list: 'properties',
    get: (propertyId: string) => `properties/${propertyId}`,
    createByAddress: (address: string, city: string, state: string, zip: string) =>
      `properties/${encodeURIComponent(address)}/${encodeURIComponent(city)}/${state}/${zip}`,
    createByMls: (mlsMarket: string, mlsNumber: string) =>
      `properties/${mlsMarket}/${mlsNumber}`,
    updateStage: (propertyId: string, stage: string) =>
      `properties/${propertyId}/activities/${stage}`,
  },

  // Evaluations
  evaluations: {
    create: (propertyId: string) => `properties/${propertyId}/evaluations`,
    delete: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}`,
    copy: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/copy`,
    updateSaleComps: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/salecomps`,
    updateRentComps: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/rentcomps`,
    updateCalculator: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/calculator`,
    updateNotes: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/notes`,
    includeSaleComp: (propertyId: string, evaluationId: string, saleCompId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/salecomps/${saleCompId}`,
    includeRentComp: (propertyId: string, evaluationId: string, rentCompId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/rentcomps/${rentCompId}`,
    getSearchTypes: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/searchTypes`,
    updateAttributes: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/attributes`,
    // PDF endpoints
    createPdf: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/pdf`,
    getPdfUrl: (propertyId: string, evaluationId: string, sessionKey: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/sessions/${sessionKey}/url`,
    emailEvaluation: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/email`,
    // Legacy Quest4 endpoint (keep for backward compatibility)
    shareEvaluation: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/share`,
    // Quest5 sharing endpoints (GET, POST, DELETE)
    sharing: (propertyId: string, evaluationId: string) =>
      `properties/${propertyId}/evaluations/${evaluationId}/sharing`,
  },

  // Notes
  notes: {
    listAll: 'properties/notes',
    create: (propertyId: string) => `properties/${propertyId}/notes`,
    update: (propertyId: string, noteId: string) =>
      `properties/${propertyId}/notes/${noteId}`,
    delete: (propertyId: string, noteId: string) =>
      `properties/${propertyId}/notes/${noteId}`,
  },

  // Connections
  connections: {
    list: (userId: string) => `users/${userId}/connections`,
    create: (userId: string) => `users/${userId}/connections`,
    update: (userId: string, connectionId: string) =>
      `users/${userId}/connections/${connectionId}`,
    addToProperty: (propertyId: string, connectionId: string) =>
      `properties/${propertyId}/connections/${connectionId}`,
    removeFromProperty: (propertyId: string, connectionId: string) =>
      `properties/${propertyId}/connections/${connectionId}`,
  },

  // Documents
  documents: {
    presignedUrl: (propertyId: string) => `properties/${propertyId}/presignedurl`,
    register: (propertyId: string) => `properties/${propertyId}/document`,
    getUrl: (propertyId: string, documentId: string) =>
      `properties/${propertyId}/documents/${documentId}/url`,
    delete: (propertyId: string, documentId: string) =>
      `properties/${propertyId}/documents/${documentId}`,
    updateName: (propertyId: string, documentId: string) =>
      `properties/${propertyId}/documents/${documentId}`,
  },

  // Users
  users: {
    update: (userId: string) => `users/${userId}`,
    updatePreferences: (userId: string) => `users/${userId}/preferences`,
    resetPreferences: (userId: string) => `users/${userId}/preferences/reset`,
    forgotPassword: (userId: string) => `users/${userId}/password/forgot`,
    getRights: (userId: string) => `users/${userId}/rights`,
    updateRights: (userId: string) => `users/${userId}/rights`,
  },

  // Admin
  admin: {
    getAllUsers: 'admin/users',
    createUser: 'admin/users',
    getEvaluationUsage: 'admin/evaluationusage',
    getMlsMarkets: 'helpers/mlsMarkets',
    getStates: 'helpers/states',
    getDefaultPreferences: 'admin/preferences',
    updateDashboardSettings: 'admin/dashboard/settings',
  },

  // Search
  search: {
    fprAnalysis: 'search/fpr-analysis',
    forSales: 'forsales',
    forSalesHistory: (maxCount: number) => `forsales/history/${maxCount}`,
    investmentAssessment: 'search/investment-assessment',
    aiAnalysis: 'search/ai-investment-analysis',
    createPropertyWithEvaluation: 'search/create-property-with-evaluation',
  },

  // Helpers
  helpers: {
    mlsMarkets: 'helpers/mlsMarkets',
    states: 'helpers/states',
  },

  // Utilities
  version: 'version',
} as const;
