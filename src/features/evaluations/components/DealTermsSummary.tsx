import { useState } from 'react';
import { EditableField } from '@/components/form/EditableField';
import { ChevronDownIcon } from '@/icons';
import type { DealTermInputs } from '@app-types/evaluation.types';

interface DealTermsSummaryProps {
  dealTerms: DealTermInputs;
  onChange: (field: keyof DealTermInputs, value: number) => void;
}

export default function DealTermsSummary({
  dealTerms,
  onChange,
}: DealTermsSummaryProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Primary: The 4 numbers that define the deal */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          The Deal
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <EditableField
            label="Purchase Price"
            value={dealTerms.purchasePrice}
            format="currency"
            onSave={(v) => onChange('purchasePrice', v as number)}
          />
          <EditableField
            label="Market Value"
            value={dealTerms.estimatedMarketValue}
            format="currency"
            onSave={(v) => onChange('estimatedMarketValue', v as number)}
          />
          <EditableField
            label="Monthly Rent"
            value={dealTerms.rent}
            format="currency"
            onSave={(v) => onChange('rent', v as number)}
          />
          <EditableField
            label="Repairs"
            value={dealTerms.repairsMakeReady}
            format="currency"
            onSave={(v) => onChange('repairsMakeReady', v as number)}
          />
        </div>
      </div>

      {/* Secondary: Costs & adjustments */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowMore(!showMore)}
          aria-expanded={showMore}
          className="flex w-full items-center gap-2 px-6 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
        >
          <ChevronDownIcon
            className={`size-4 transition-transform ${showMore ? '' : '-rotate-90'}`}
          />
          <span>Costs & adjustments</span>
        </button>

        {showMore && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {/* Hard money appraisal */}
              <EditableField
                label="Appraised Value"
                value={dealTerms.estimatedAppraisedValue}
                format="currency"
                onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
                size="sm"
              />

              {/* Closing costs */}
              <EditableField
                label="Survey"
                value={dealTerms.survey}
                format="currency"
                onSave={(v) => onChange('survey', v as number)}
                size="sm"
              />
              <EditableField
                label="Appraisal"
                value={dealTerms.appraisal}
                format="currency"
                onSave={(v) => onChange('appraisal', v as number)}
                size="sm"
              />
              <EditableField
                label="Inspection"
                value={dealTerms.inspection}
                format="currency"
                onSave={(v) => onChange('inspection', v as number)}
                size="sm"
              />

              {/* Annual expenses */}
              <EditableField
                label="Property Tax"
                value={dealTerms.propertyTaxAnnual}
                format="currency"
                suffix="/yr"
                onSave={(v) => onChange('propertyTaxAnnual', v as number)}
                size="sm"
              />
              <EditableField
                label="Insurance"
                value={dealTerms.propertyInsuranceAnnual}
                format="currency"
                suffix="/yr"
                onSave={(v) => onChange('propertyInsuranceAnnual', v as number)}
                size="sm"
              />
              <EditableField
                label="HOA"
                value={dealTerms.hoaAnnual}
                format="currency"
                suffix="/yr"
                onSave={(v) => onChange('hoaAnnual', v as number)}
                size="sm"
              />

              {/* Other */}
              <EditableField
                label="Misc Monthly"
                value={dealTerms.miscellaneousMonthly}
                format="currency"
                suffix="/mo"
                onSave={(v) => onChange('miscellaneousMonthly', v as number)}
                size="sm"
              />
              <EditableField
                label="Seller Credit"
                value={dealTerms.sellerContribution}
                format="currency"
                onSave={(v) => onChange('sellerContribution', v as number)}
                size="sm"
              />
              <EditableField
                label="Max Refi Cashback"
                value={dealTerms.maxRefiCashback}
                format="currency"
                onSave={(v) => onChange('maxRefiCashback', v as number)}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
