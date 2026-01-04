import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/api/client';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import type { Evaluation, SaleComp, RentComp } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';

/**
 * Public page for viewing shared evaluations
 * Professional, investor-focused presentation
 *
 * URL patterns:
 * - /share/:propertyId/:evaluationId/:guid (view only)
 * - /share/:propertyId/:evaluationId/:guid/:editKey (edit access - not currently implemented)
 */
export default function SharedEvaluationPage() {
  const { propertyId, evaluationId, guid } = useParams<{
    propertyId: string;
    evaluationId: string;
    guid: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    async function loadSharedEvaluation() {
      if (!propertyId || !evaluationId || !guid) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Create a shared session to access the evaluation
        const session = await authService.createSharedSession(guid, '');
        const sessionKey = session.sessionKey;

        // Fetch the property and evaluation data using the shared session
        const [propertyResponse, evaluationResponse] = await Promise.all([
          apiClient.get<Property>(`properties/${propertyId}`, {
            headers: { sessionKey },
          }),
          apiClient.get<Evaluation>(`properties/${propertyId}/evaluations/${evaluationId}`, {
            headers: { sessionKey },
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
  }, [propertyId, evaluationId, guid]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
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

  const { saleCompGroup, rentCompGroup, calculator } = evaluation;
  const includedSaleComps = saleCompGroup?.saleComps?.filter((c) => c.include) || [];
  const includedRentComps = rentCompGroup?.rentComps?.filter((c) => c.include) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Property Evaluation
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {property.address}
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {property.city}, {property.state} {property.zip}
              </p>
              {evaluation.name && (
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {evaluation.name}
                </p>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                View Only
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Property Attributes */}
          <Section title="Property Attributes">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              <AttributeItem label="Beds" value={evaluation.beds != null ? `${evaluation.beds}` : '-'} />
              <AttributeItem label="Baths" value={evaluation.baths != null ? `${evaluation.baths}` : '-'} />
              <AttributeItem label="Garage" value={evaluation.garage != null ? `${evaluation.garage} car` : '-'} />
              <AttributeItem label="Sqft" value={evaluation.sqft ? formatNumber(evaluation.sqft) : '-'} />
              <AttributeItem label="Year Built" value={evaluation.yearBuilt ? String(evaluation.yearBuilt) : '-'} />
              <AttributeItem label="List Price" value={formatCurrency(evaluation.listPrice)} />
              <AttributeItem label="Subdivision" value={evaluation.subdivision || '-'} />
              <AttributeItem label="County" value={evaluation.county || '-'} />
              <AttributeItem
                label="Taxes/Year"
                value={formatCurrency(calculator?.dealTermInputs?.propertyTaxAnnual)}
              />
              <AttributeItem
                label="HOA/Year"
                value={formatCurrency(calculator?.dealTermInputs?.hoaAnnual)}
              />
            </div>
          </Section>

          {/* Valuation Summary */}
          <Section title="Valuation Summary">
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Sale Comp Value"
                value={formatCurrency(saleCompGroup?.calculatedValue)}
                subtext={`${formatCurrency(saleCompGroup?.averagePricePerSqft)}/sqft avg`}
              />
              <SummaryCard
                label="Monthly Rent"
                value={formatCurrency(rentCompGroup?.calculatedValue)}
                subtext={`${includedRentComps.length} comps analyzed`}
              />
              {calculator?.dealTermInputs?.purchasePrice && (
                <SummaryCard
                  label="Purchase Price"
                  value={formatCurrency(calculator.dealTermInputs.purchasePrice)}
                  subtext={calculator?.dealTermInputs?.estimatedMarketValue
                    ? `Market value: ${formatCurrency(calculator.dealTermInputs.estimatedMarketValue)}`
                    : undefined
                  }
                />
              )}
            </div>
          </Section>

          {/* Sale Comps */}
          {includedSaleComps.length > 0 && (
            <Section title={`Sale Comps (${includedSaleComps.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Address</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">$/SqFt</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">SqFt</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Bd/Ba/Gar</th>
                      <th className="pl-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {includedSaleComps.map((comp, index) => (
                      <SaleCompRow key={comp.id || index} comp={comp} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Rent Comps */}
          {includedRentComps.length > 0 && (
            <Section title={`Rent Comps (${includedRentComps.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Address</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Rent</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">$/SqFt</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">SqFt</th>
                      <th className="pl-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Bd/Ba/Gar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {includedRentComps.map((comp, index) => (
                      <RentCompRow key={comp.id || index} comp={comp} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Calculator Analysis */}
          {calculator && (calculator.conventionalInputs?.show || calculator.hardMoneyInputs?.show) && (
            <Section title="Investment Analysis">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Conventional */}
                {calculator.conventionalInputs?.show && (
                  <AnalysisCard
                    title="Conventional Financing"
                    equityCapture={calculator.conventionalUnrealizedCapitalGain}
                    annualCashflow={calculator.conventionalAnnualCashFlow}
                    monthlyCashflow={calculator.conventionalTotalCashflowMonthly}
                    cashNeeded={calculator.conventionalCashOutOfPocketTotal}
                    returnOnEquity={calculator.conventionalReturnOnCapitalGainPercent}
                    cashOnCash={calculator.conventionalCashOnCashReturnPercent}
                    loanTerms={[
                      { label: 'Down Payment', value: `${calculator.conventionalInputs.downPaymentPercent}%` },
                      { label: 'Interest Rate', value: `${calculator.conventionalInputs.interestRatePercent}%` },
                      { label: 'Loan Term', value: `${calculator.conventionalInputs.loanTermInYears} years` },
                    ]}
                  />
                )}

                {/* Hard Money */}
                {calculator.hardMoneyInputs?.show && (
                  <AnalysisCard
                    title="Hard Money + Refi"
                    equityCapture={calculator.hardUnrealizedCapitalGain}
                    annualCashflow={calculator.hardAnnualCashFlow}
                    monthlyCashflow={calculator.hardTotalCashflowMonthly}
                    cashNeeded={calculator.hardCashOutOfPocketTotal}
                    returnOnEquity={calculator.hardReturnOnCapitalGainPercent}
                    cashOnCash={calculator.hardCashOnCashReturnPercent}
                    loanTerms={[
                      { label: 'Hard Money LTV', value: `${calculator.hardMoneyInputs.hardLoanToValuePercent}%` },
                      { label: 'Hard Money Rate', value: `${calculator.hardMoneyInputs.hardInterestRate}%` },
                      { label: 'Months to Refi', value: `${calculator.hardMoneyInputs.hardMonthsToRefinance}` },
                    ]}
                  />
                )}
              </div>
            </Section>
          )}

          {/* Notes */}
          {evaluation.notes && (
            <Section title="Notes">
              <div
                className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: evaluation.notes }}
              />
            </Section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Quest</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Real Estate Investment Analysis
          </p>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// Subcomponents
// =============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AttributeItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

function SummaryCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtext && <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtext}</p>}
    </div>
  );
}

function SaleCompRow({ comp }: { comp: SaleComp }) {
  return (
    <tr>
      <td className="py-3 pr-4 text-sm text-gray-900 dark:text-white">{comp.street}</td>
      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
        {formatCurrency(comp.priceSold)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
        {formatCurrency(comp.pricePerSqft)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
        {formatNumber(comp.sqft)}
      </td>
      <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
        {comp.beds}/{comp.baths}/{comp.garage}
      </td>
      <td className="pl-4 py-3 text-right text-sm text-gray-500 dark:text-gray-500">
        {comp.dateSold ? new Date(comp.dateSold).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '-'}
      </td>
    </tr>
  );
}

function RentCompRow({ comp }: { comp: RentComp }) {
  return (
    <tr>
      <td className="py-3 pr-4 text-sm text-gray-900 dark:text-white">{comp.street}</td>
      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
        {formatCurrency(comp.priceSold)}/mo
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
        {comp.pricePerSqft ? `$${comp.pricePerSqft.toFixed(2)}` : '-'}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
        {formatNumber(comp.sqft)}
      </td>
      <td className="pl-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
        {comp.beds}/{comp.baths}/{comp.garage}
      </td>
    </tr>
  );
}

interface AnalysisCardProps {
  title: string;
  equityCapture?: number;
  annualCashflow?: number;
  monthlyCashflow?: number;
  cashNeeded?: number;
  returnOnEquity?: number;
  cashOnCash?: number;
  loanTerms: { label: string; value: string }[];
}

function AnalysisCard({
  title,
  equityCapture,
  annualCashflow,
  monthlyCashflow,
  cashNeeded,
  returnOnEquity,
  cashOnCash,
  loanTerms,
}: AnalysisCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h3>

      {/* Key Metrics */}
      <div className="mb-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Equity Capture</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(equityCapture)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Annual Cashflow</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(annualCashflow)}/yr
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Return on Equity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPercent(returnOnEquity, 1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cash-on-Cash</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPercent(cashOnCash, 1)}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="border-t border-gray-100 pt-3 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Cash Needed</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(cashNeeded)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Monthly Cashflow</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(monthlyCashflow)}/mo</span>
        </div>
      </div>

      {/* Loan Terms */}
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Loan Terms</p>
        <div className="grid grid-cols-3 gap-2">
          {loanTerms.map((term) => (
            <div key={term.label} className="text-xs">
              <span className="text-gray-500 dark:text-gray-500">{term.label}: </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{term.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
