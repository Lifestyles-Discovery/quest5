import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/api/client';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';

/**
 * Public page for viewing shared evaluations
 *
 * URL patterns:
 * - /share/:propertyId/:evaluationId/:guid (view only)
 * - /share/:propertyId/:evaluationId/:guid/:editKey (edit access)
 *
 * TODO: Verify backend URL format and adjust routes as needed
 */
export default function SharedEvaluationPage() {
  const { propertyId, evaluationId, guid, editKey } = useParams<{
    propertyId: string;
    evaluationId: string;
    guid: string;
    editKey?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const canEdit = !!editKey;

  useEffect(() => {
    async function loadSharedEvaluation() {
      if (!propertyId || !evaluationId || !guid) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Create a shared session to access the evaluation
        // For view-only, pass empty string as editKey
        const session = await authService.createSharedSession(guid, editKey || '');

        // Store the session key temporarily for API calls
        const sessionKey = session.sessionKey;

        // Fetch the property and evaluation data using the shared session
        // TODO: Verify these endpoints work with shared sessions
        const [propertyResponse, evaluationResponse] = await Promise.all([
          apiClient.get<Property>(`properties/${propertyId}`, {
            headers: { sessionKey }
          }),
          apiClient.get<Evaluation>(`properties/${propertyId}/evaluations/${evaluationId}`, {
            headers: { sessionKey }
          }),
        ]);

        setProperty(propertyResponse.data);
        setEvaluation(evaluationResponse.data);
      } catch (err) {
        console.error('Failed to load shared evaluation:', err);
        setError('Unable to load this evaluation. The link may have expired or be invalid.');
      } finally {
        setLoading(false);
      }
    }

    loadSharedEvaluation();
  }, [propertyId, evaluationId, guid, editKey]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/20">
            <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Unable to Load Evaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!evaluation || !property) {
    return null;
  }

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {property.address}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {property.city}, {property.state} {property.zip}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
                  Edit Access
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Shared Evaluation
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Property Details */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Property Details
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Beds</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{evaluation.beds || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Baths</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{evaluation.baths || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Sq Ft</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{evaluation.sqft?.toLocaleString() || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Year Built</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{evaluation.yearBuilt || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">List Price</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(evaluation.listPrice)}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Garage</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{evaluation.garage || '-'}</dd>
              </div>
            </dl>
          </section>

          {/* Valuation Summary */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Valuation Summary
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-700">
                <dt className="text-gray-500 dark:text-gray-400">Sale Comp Value</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(evaluation.saleCompGroup?.calculatedValue)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-700">
                <dt className="text-gray-500 dark:text-gray-400">Monthly Rent</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(evaluation.rentCompGroup?.calculatedValue)}
                </dd>
              </div>
              {evaluation.calculator?.dealTermInputs?.purchasePrice && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Purchase Price</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(evaluation.calculator.dealTermInputs.purchasePrice)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Sale Comps */}
          {evaluation.saleCompGroup?.saleComps && evaluation.saleCompGroup.saleComps.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Sale Comps ({evaluation.saleCompGroup.saleComps.filter((c: { include: boolean }) => c.include).length} included)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 pr-4 text-left font-medium text-gray-500 dark:text-gray-400">Address</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Price</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">$/SqFt</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">SqFt</th>
                      <th className="pl-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.saleCompGroup.saleComps
                      .filter((comp) => comp.include)
                      .map((comp, index) => (
                        <tr key={comp.id || index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 pr-4 text-gray-900 dark:text-white">{comp.street}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(comp.priceSold)}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">${comp.pricePerSqft?.toFixed(0)}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{comp.sqft?.toLocaleString()}</td>
                          <td className="pl-4 py-3 text-right text-gray-500 dark:text-gray-400">
                            {comp.dateSold ? new Date(comp.dateSold).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Rent Comps */}
          {evaluation.rentCompGroup?.rentComps && evaluation.rentCompGroup.rentComps.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Rent Comps ({evaluation.rentCompGroup.rentComps.filter((c: { include: boolean }) => c.include).length} included)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 pr-4 text-left font-medium text-gray-500 dark:text-gray-400">Address</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Rent</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">SqFt</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Beds</th>
                      <th className="pl-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Baths</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.rentCompGroup.rentComps
                      .filter((comp) => comp.include)
                      .map((comp, index) => (
                        <tr key={comp.id || index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 pr-4 text-gray-900 dark:text-white">{comp.street}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(comp.priceSold)}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{comp.sqft?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{comp.beds}</td>
                          <td className="pl-4 py-3 text-right text-gray-900 dark:text-white">{comp.baths}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Notes */}
          {evaluation.notes && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Notes
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: evaluation.notes }}
              />
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Quest
          </p>
        </div>
      </footer>
    </div>
  );
}
