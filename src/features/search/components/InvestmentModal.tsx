import { useState, useEffect } from 'react';
import { useInvestmentAssessment, useAiAnalysis } from '@/hooks/api/useSearch';
import type { RankedProperty, AiAnalysisResponse } from '@app-types/search.types';

interface InvestmentModalProps {
  property: RankedProperty;
  onClose: () => void;
  onEvaluate: () => void;
  isEvaluating?: boolean;
}

type ViewTab = 'overview' | 'street' | 'satellite' | 'neighborhood' | 'ai';

export default function InvestmentModal({
  property,
  onClose,
  onEvaluate,
  isEvaluating,
}: InvestmentModalProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResponse | null>(null);

  const { data: assessment, isLoading: isLoadingAssessment } = useInvestmentAssessment(
    property.id
  );

  const aiAnalysisMutation = useAiAnalysis();

  // Auto-trigger AI analysis when assessment loads
  useEffect(() => {
    if (assessment && !aiAnalysis && !aiAnalysisMutation.isPending) {
      aiAnalysisMutation.mutate(assessment, {
        onSuccess: (data) => setAiAnalysis(data),
      });
    }
  }, [assessment, aiAnalysis, aiAnalysisMutation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const modalClass = isFullscreen
    ? 'fixed inset-0 z-50'
    : 'fixed inset-4 z-50 md:inset-8 lg:inset-16';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`${modalClass} flex flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {property.address}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {isFullscreen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['overview', 'street', 'satellite', 'neighborhood', 'ai'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'ai' ? 'AI Analysis' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoadingAssessment ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Loading property assessment...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Property Details */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Property Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Listed Price</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(property.priceListed)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Beds / Baths</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {property.beds} / {property.baths}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Square Feet</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {property.sqft.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {property.yearBuilt}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Days on Market</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {property.daysOnMarket}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">FPR Score</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {property.relativeFpr.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rehab Estimate */}
                  {assessment?.rehabEstimate && (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Rehab Estimate
                      </h3>
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(assessment.rehabEstimate.totalEstimatedCost)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Based on {assessment.rehabEstimate.calculationMethod}
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <p className="text-gray-600 dark:text-gray-400">
                            Property Age: {assessment.rehabEstimate.propertyAgeInYears} years
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Cost per Sqft: ${assessment.rehabEstimate.costPerSqFt.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photo Gallery */}
                  {assessment?.imageGallery?.mlsPhotos && assessment.imageGallery.mlsPhotos.length > 0 && (
                    <div className="lg:col-span-2">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Photos
                      </h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {assessment.imageGallery.mlsPhotos.slice(0, 8).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Property photo ${index + 1}`}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {assessment?.propertyDetails?.description && (
                    <div className="lg:col-span-2">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {assessment.propertyDetails.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Street View Tab */}
              {activeTab === 'street' && assessment?.googleMapsData && (
                <div className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img
                      src={assessment.googleMapsData.propertyStreetViewUrl}
                      alt="Street View"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {assessment.googleMapsData.additionalStreetViewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {assessment.googleMapsData.additionalStreetViewUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Additional view ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Satellite Tab */}
              {activeTab === 'satellite' && assessment?.googleMapsData && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={assessment.googleMapsData.propertySatelliteViewUrl}
                    alt="Satellite View"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Neighborhood Tab */}
              {activeTab === 'neighborhood' && assessment?.googleMapsData && (
                <div className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img
                      src={assessment.googleMapsData.neighborhoodSatelliteViewUrl}
                      alt="Neighborhood View"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {assessment.googleMapsData.surroundingAreaStreetViewUrls.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Surrounding Area
                      </h4>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {assessment.googleMapsData.surroundingAreaStreetViewUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Surrounding area ${index + 1}`}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* AI Analysis Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  {aiAnalysisMutation.isPending ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                          Generating AI analysis...
                        </p>
                      </div>
                    </div>
                  ) : aiAnalysis ? (
                    <>
                      {/* Key Insights */}
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Key Insights
                        </h3>
                        <ul className="space-y-2">
                          {aiAnalysis.keyInsights.map((insight, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                            >
                              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Investment Suitability */}
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Investment Suitability
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                          {aiAnalysis.investmentSuitability.investmentSummary}
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                            <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">
                              Pros
                            </h4>
                            <ul className="space-y-1">
                              {aiAnalysis.investmentSuitability.investmentPros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                            <h4 className="mb-2 font-medium text-red-800 dark:text-red-200">
                              Cons
                            </h4>
                            <ul className="space-y-1">
                              {aiAnalysis.investmentSuitability.investmentCons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Rehab Assessment */}
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Rehab Assessment
                        </h3>
                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(aiAnalysis.rehabAssessment.estimatedTotalRehabCost)}
                          </p>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {aiAnalysis.rehabAssessment.rehabAssessmentSummary}
                          </p>
                          {aiAnalysis.rehabAssessment.potentialIssues.length > 0 && (
                            <div className="mt-4">
                              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                                Potential Issues
                              </h4>
                              <div className="space-y-2">
                                {aiAnalysis.rehabAssessment.potentialIssues.map((issue, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between rounded bg-white p-2 dark:bg-gray-800"
                                  >
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {issue.category}
                                      </span>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {issue.description}
                                      </p>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(issue.estimatedCost)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Neighborhood Evaluation */}
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Neighborhood Evaluation
                        </h3>
                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                              Class {aiAnalysis.neighborhoodEvaluation.neighborhoodClass}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                aiAnalysis.neighborhoodEvaluation.isStable
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {aiAnalysis.neighborhoodEvaluation.isStable ? 'Stable' : 'Transitional'}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {aiAnalysis.neighborhoodEvaluation.neighborhoodSummary}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <p>AI analysis not available.</p>
                      <p className="text-sm">Assessment data required to generate analysis.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={onEvaluate}
            disabled={isEvaluating}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Create Evaluation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
