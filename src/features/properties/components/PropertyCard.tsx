import { Link } from 'react-router';
import { Card } from '@components/ui/card';
import type { PropertySummary, PropertyStage } from '@app-types/property.types';
import { formatDistanceToNow } from 'date-fns';

interface PropertyCardProps {
  property: PropertySummary;
}

const STAGE_STYLES: Record<PropertyStage, { bg: string; text: string }> = {
  None: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  Finding: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  Evaluating: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  Negotiating: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
  Diligence: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  Closing: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  Rehabbing: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  Leasing: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
  Selling: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
};

export function PropertyCard({ property }: PropertyCardProps) {
  const stageStyle = STAGE_STYLES[property.stage] || STAGE_STYLES.None;
  const lastUpdateDate = new Date(property.lastUpdate);

  return (
    <Link to={`/properties/${property.id}`}>
      <Card>
        <div className="group cursor-pointer">
          {/* Property Image */}
          <div className="mb-4 overflow-hidden rounded-lg aspect-[3/2]">
            <img
              src={property.photoUrl || '/images/cards/card-01.jpg'}
              alt={property.address}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Property Info */}
          <div>
            <h3 className="mb-1 font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
              {property.address}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>

          {/* Stage, Evaluations, and Date Row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${stageStyle.bg} ${stageStyle.text}`}
              >
                {property.stage}
              </span>
              {property.evaluationCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {property.evaluationCount} eval{property.evaluationCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <p>{formatDistanceToNow(lastUpdateDate, { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
