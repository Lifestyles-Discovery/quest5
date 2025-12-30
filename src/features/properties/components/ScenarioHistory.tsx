import { useCopyEvaluation } from '@hooks/api/useEvaluations';
import type { Property } from '@app-types/property.types';

interface ScenarioHistoryProps {
  property: Property;
  currentEvaluationId: string;
  onScenarioSelect: (evaluationId: string) => void;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * ScenarioHistory - Shows previous evaluations and allows creating new scenarios.
 *
 * - Collapsed by default
 * - "New Scenario" copies current evaluation for what-if analysis
 * - Lists previous evaluations with date and key metrics
 * - Click to switch to a different scenario
 */
export function ScenarioHistory({
  property,
  currentEvaluationId,
  onScenarioSelect,
}: ScenarioHistoryProps) {
  const copyEvaluation = useCopyEvaluation();

  const handleNewScenario = () => {
    copyEvaluation.mutate(
      { propertyId: property.id, evaluationId: currentEvaluationId },
      {
        onSuccess: (newEval) => {
          onScenarioSelect(newEval.id);
        },
      }
    );
  };

  const otherEvaluations = property.evaluations?.filter(
    (e) => e.id !== currentEvaluationId
  );

  // If only one evaluation, just show New Scenario button
  if (!otherEvaluations?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Want to try different assumptions?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create a new scenario to compare different numbers
            </p>
          </div>
          <button
            onClick={handleNewScenario}
            disabled={copyEvaluation.isPending}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {copyEvaluation.isPending ? 'Creating...' : 'New Scenario'}
          </button>
        </div>
      </div>
    );
  }

  // Multiple evaluations - show collapsible history
  return (
    <details className="group rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <summary className="cursor-pointer list-none px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Previous Scenarios
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({otherEvaluations.length})
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNewScenario();
            }}
            disabled={copyEvaluation.isPending}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {copyEvaluation.isPending ? 'Creating...' : '+ New Scenario'}
          </button>
        </div>
      </summary>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="space-y-2">
          {otherEvaluations.map((evaluation) => (
            <button
              key={evaluation.id}
              onClick={() => onScenarioSelect(evaluation.id)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-gray-800"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {evaluation.beds} bed / {evaluation.baths} bath /{' '}
                  {evaluation.sqft?.toLocaleString()} sqft
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(evaluation.created)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {evaluation.listPrice && (
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    ${evaluation.listPrice.toLocaleString()}
                  </span>
                )}
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
