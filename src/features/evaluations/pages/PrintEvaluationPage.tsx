import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import type { Evaluation } from '@app-types/evaluation.types';
import type { Property } from '@app-types/property.types';
import { baseURL } from '@/api/client';
import { formatCurrency, formatPercent } from '@/utils/formatters';

/**
 * Print-optimized evaluation page for Restpack PDF generation
 *
 * URL: /properties/:propertyId/evaluations/:evaluationId/sessions/:sessionKey
 *
 * This page:
 * - Uses sessionKey from URL for API auth (no login required)
 * - Renders a clean, print-optimized view
 * - Adds .page_finished element when ready (Restpack trigger)
 * - Light theme only, all sections expanded
 */
export default function PrintEvaluationPage() {
  const { propertyId, evaluationId, sessionKey } = useParams<{
    propertyId: string;
    evaluationId: string;
    sessionKey: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!propertyId || !evaluationId || !sessionKey) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      try {
        // Create axios instance with sessionKey header
        const client = axios.create({
          baseURL,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            sessionKey: sessionKey,
          },
        });

        // Fetch property (includes evaluations)
        const response = await client.get<Property>(`properties/${propertyId}`);
        const prop = response.data;

        // Find the evaluation
        const eval_ = prop.evaluations?.find((e) => e.id === evaluationId);
        if (!eval_) {
          throw new Error('Evaluation not found');
        }

        setProperty(prop);
        setEvaluation(eval_);
      } catch (err) {
        console.error('Failed to load evaluation:', err);
        setError('Unable to load evaluation');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [propertyId, evaluationId, sessionKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <p className="text-gray-600">Loading evaluation...</p>
      </div>
    );
  }

  if (error || !property || !evaluation) {
    return (
      <div className="min-h-screen bg-white p-8">
        <p className="text-red-600">{error || 'Failed to load'}</p>
      </div>
    );
  }

  const calculator = evaluation.calculator;
  const saleComps = evaluation.saleCompGroup?.saleComps || [];
  const rentComps = evaluation.rentCompGroup?.rentComps || [];
  const includedSaleComps = saleComps.filter((c) => c.include);
  const includedRentComps = rentComps.filter((c) => c.include);

  return (
    <div className="min-h-screen bg-white text-gray-900 print-page">
      {/* Main content */}
      <div className="mx-auto max-w-[1100px] space-y-6 p-6">

        {/* Property Header */}
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
          <p className="text-gray-600">{property.city}, {property.state} {property.zip}</p>
          {evaluation.name && (
            <p className="mt-1 text-sm font-medium text-gray-500">{evaluation.name}</p>
          )}
        </header>

        {/* Property Attributes */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Property Attributes</h2>
          <div className="grid grid-cols-6 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Beds</p>
              <p className="font-medium">{evaluation.beds ?? '-'} beds</p>
            </div>
            <div>
              <p className="text-gray-500">Baths</p>
              <p className="font-medium">{evaluation.baths ?? '-'} baths</p>
            </div>
            <div>
              <p className="text-gray-500">Garage</p>
              <p className="font-medium">{evaluation.garage ?? '-'} car</p>
            </div>
            <div>
              <p className="text-gray-500">Sqft</p>
              <p className="font-medium">{evaluation.sqft?.toLocaleString() ?? '-'} sqft</p>
            </div>
            <div>
              <p className="text-gray-500">Year Built</p>
              <p className="font-medium">{evaluation.yearBuilt ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">List Price</p>
              <p className="font-medium">{formatCurrency(evaluation.listPrice || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Subdivision</p>
              <p className="font-medium">{evaluation.subdivision || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">County</p>
              <p className="font-medium">{evaluation.county || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Taxes/Year</p>
              <p className="font-medium">{formatCurrency(calculator?.dealTermInputs?.propertyTaxAnnual || 0)}/yr</p>
            </div>
            <div>
              <p className="text-gray-500">HOA/Year</p>
              <p className="font-medium">{formatCurrency(calculator?.dealTermInputs?.hoaAnnual || 0)}/yr</p>
            </div>
          </div>
        </section>

        {/* Sale Comps */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Sale Comps</h2>
          {evaluation.saleCompGroup && (
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(evaluation.saleCompGroup.calculatedValue)}
            </p>
          )}
          <p className="mb-4 text-sm text-gray-500">
            {includedSaleComps.length} of {saleComps.length} included
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Include</th>
                <th className="pb-2">Address</th>
                <th className="pb-2">Subdivision</th>
                <th className="pb-2 text-right">Sold</th>
                <th className="pb-2 text-right">$/Sqft</th>
                <th className="pb-2 text-center">Bd/Ba/Gar</th>
                <th className="pb-2 text-right">Sqft</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {saleComps.map((comp) => (
                <tr key={comp.id} className={`border-b ${!comp.include ? 'opacity-50' : ''}`}>
                  <td className="py-2">{comp.include ? '✓' : ''}</td>
                  <td className="py-2">
                    <p className="font-medium">{comp.street}</p>
                    <p className="text-xs text-gray-500">{comp.city}, {comp.state}</p>
                  </td>
                  <td className="py-2">{comp.subdivision}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(comp.priceSold)}</td>
                  <td className="py-2 text-right">${Math.round(comp.pricePerSqft)}</td>
                  <td className="py-2 text-center">{comp.beds}/{comp.baths}/{comp.garage}</td>
                  <td className="py-2 text-right">{comp.sqft?.toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-500">
                    {comp.dateSold ? new Date(comp.dateSold).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {evaluation.saleCompGroup && includedSaleComps.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Avg $/Sqft: <span className="font-medium">${Math.round(evaluation.saleCompGroup.averagePricePerSqft)}</span>
              {' × '}Subject Sqft: <span className="font-medium">{evaluation.sqft?.toLocaleString()}</span>
              {' = '}<span className="font-semibold text-green-600">{formatCurrency(evaluation.saleCompGroup.calculatedValue)}</span>
            </p>
          )}
        </section>

        {/* Rent Comps */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Rent Comps</h2>
          {evaluation.rentCompGroup && (
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(evaluation.rentCompGroup.calculatedValue)}/mo
            </p>
          )}
          <p className="mb-4 text-sm text-gray-500">
            {includedRentComps.length} of {rentComps.length} included
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Include</th>
                <th className="pb-2">Address</th>
                <th className="pb-2">Subdivision</th>
                <th className="pb-2 text-right">Rent</th>
                <th className="pb-2 text-right">$/Sqft</th>
                <th className="pb-2 text-center">Bd/Ba/Gar</th>
                <th className="pb-2 text-right">Sqft</th>
                <th className="pb-2 text-right">DOM</th>
              </tr>
            </thead>
            <tbody>
              {rentComps.map((comp) => (
                <tr key={comp.id} className={`border-b ${!comp.include ? 'opacity-50' : ''}`}>
                  <td className="py-2">{comp.include ? '✓' : ''}</td>
                  <td className="py-2">
                    <p className="font-medium">{comp.street}</p>
                    <p className="text-xs text-gray-500">{comp.city}, {comp.state}</p>
                  </td>
                  <td className="py-2">{comp.subdivision}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(comp.priceSold)}</td>
                  <td className="py-2 text-right">${comp.pricePerSqft?.toFixed(2)}</td>
                  <td className="py-2 text-center">{comp.beds}/{comp.baths}/{comp.garage}</td>
                  <td className="py-2 text-right">{comp.sqft?.toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-500">{comp.daysOnMarket ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {evaluation.rentCompGroup && includedRentComps.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Avg $/Sqft: <span className="font-medium">${evaluation.rentCompGroup.averagePricePerSqft?.toFixed(2)}</span>
              {' × '}Subject Sqft: <span className="font-medium">{evaluation.sqft?.toLocaleString()}</span>
              {' = '}<span className="font-semibold text-green-600">{formatCurrency(evaluation.rentCompGroup.calculatedValue)}/mo</span>
            </p>
          )}
        </section>

        {/* Deal Terms */}
        {calculator && (
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">Cash Flow Calculator</h2>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Purchase Price</p>
                <p className="text-xl font-bold">{formatCurrency(calculator.dealTermInputs?.purchasePrice || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Market Value</p>
                <p className="text-xl font-bold">{formatCurrency(calculator.dealTermInputs?.estimatedMarketValue || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Monthly Rent</p>
                <p className="text-xl font-bold">{formatCurrency(calculator.dealTermInputs?.rent || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Repairs</p>
                <p className="text-xl font-bold">{formatCurrency(calculator.dealTermInputs?.repairsMakeReady || 0)}</p>
              </div>
            </div>

            {/* Costs & Adjustments */}
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase">Costs & Adjustments</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Property Tax</p>
                  <p className="font-medium">{formatCurrency(calculator.dealTermInputs?.propertyTaxAnnual || 0)}/yr</p>
                </div>
                <div>
                  <p className="text-gray-500">Insurance</p>
                  <p className="font-medium">{formatCurrency(calculator.dealTermInputs?.propertyInsuranceAnnual || 0)}/yr</p>
                </div>
                <div>
                  <p className="text-gray-500">HOA</p>
                  <p className="font-medium">{formatCurrency(calculator.dealTermInputs?.hoaAnnual || 0)}/yr</p>
                </div>
                <div>
                  <p className="text-gray-500">Seller Credit</p>
                  <p className="font-medium">{formatCurrency(calculator.dealTermInputs?.sellerContribution || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Misc Monthly</p>
                  <p className="font-medium">{formatCurrency(calculator.dealTermInputs?.miscellaneousMonthly || 0)}/mo</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Calculator Results */}
        {calculator && (
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-2 gap-8">
              {/* Conventional */}
              {calculator.conventionalInputs?.show && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Conventional</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Equity Capture</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(calculator.conventionalUnrealizedCapitalGain || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Cashflow</p>
                      <p className={`text-2xl font-bold ${(calculator.conventionalAnnualCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(calculator.conventionalAnnualCashFlow || 0)}/yr
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Return on Equity</p>
                      <p className="text-lg font-semibold">{formatPercent(calculator.conventionalReturnOnCapitalGainPercent || 0, 1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cash-on-Cash Return</p>
                      <p className={`text-lg font-semibold ${(calculator.conventionalCashOnCashReturnPercent || 0) >= 8 ? 'text-green-600' : ''}`}>
                        {formatPercent(calculator.conventionalCashOnCashReturnPercent || 0, 1)}
                      </p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cash Needed</span>
                        <span className="font-semibold">{formatCurrency(calculator.conventionalCashOutOfPocketTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monthly Cashflow</span>
                        <span className={`font-semibold ${(calculator.conventionalTotalCashflowMonthly || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(calculator.conventionalTotalCashflowMonthly || 0)}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Terms */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Loan Terms</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Down Payment:</span> {calculator.conventionalInputs.downPaymentPercent}%</div>
                      <div><span className="text-gray-500">Interest Rate:</span> {calculator.conventionalInputs.interestRatePercent}%</div>
                      <div><span className="text-gray-500">Loan Term:</span> {calculator.conventionalInputs.loanTermInYears} years</div>
                      <div><span className="text-gray-500">Lender Fees:</span> {formatCurrency(calculator.conventionalInputs.lenderAndTitleFees || 0)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hard Money */}
              {calculator.hardMoneyInputs?.show && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Hard Money / BRRRR</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Equity Capture</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(calculator.hardUnrealizedCapitalGain || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Cashflow</p>
                      <p className={`text-2xl font-bold ${(calculator.hardAnnualCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(calculator.hardAnnualCashFlow || 0)}/yr
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Return on Equity</p>
                      <p className="text-lg font-semibold">{formatPercent(calculator.hardReturnOnCapitalGainPercent || 0, 1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cash-on-Cash Return</p>
                      <p className={`text-lg font-semibold ${(calculator.hardCashOnCashReturnPercent || 0) >= 8 ? 'text-green-600' : ''}`}>
                        {formatPercent(calculator.hardCashOnCashReturnPercent || 0, 1)}
                      </p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cash Needed</span>
                        <span className="font-semibold">{formatCurrency(calculator.hardCashOutOfPocketTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monthly Cashflow</span>
                        <span className={`font-semibold ${(calculator.hardTotalCashflowMonthly || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(calculator.hardTotalCashflowMonthly || 0)}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Terms */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Hard Money Loan</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">LTV:</span> {calculator.hardMoneyInputs.hardLoanToValuePercent}%</div>
                      <div><span className="text-gray-500">Interest Rate:</span> {calculator.hardMoneyInputs.hardInterestRate}%</div>
                      <div><span className="text-gray-500">Months to Refi:</span> {calculator.hardMoneyInputs.hardMonthsToRefinance}</div>
                      <div><span className="text-gray-500">Lender Fees:</span> {formatCurrency(calculator.hardMoneyInputs.hardLenderAndTitleFees || 0)}</div>
                    </div>
                    <h4 className="mt-3 mb-2 text-xs font-medium uppercase text-gray-500">Refinance</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">LTV:</span> {calculator.hardMoneyInputs.refinanceLoanToValuePercent}%</div>
                      <div><span className="text-gray-500">Interest Rate:</span> {calculator.hardMoneyInputs.refinanceInterestRatePercent}%</div>
                      <div><span className="text-gray-500">Loan Term:</span> {calculator.hardMoneyInputs.refinanceLoanTermInYears} years</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {evaluation.notes && (
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold">Notes</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: evaluation.notes }}
            />
          </section>
        )}
      </div>

      {/* Restpack trigger - signals page is ready for capture */}
      <div className="page_finished" />
    </div>
  );
}
