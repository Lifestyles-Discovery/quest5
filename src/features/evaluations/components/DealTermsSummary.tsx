import { useState } from 'react';
import { EditableField } from '@/components/form/EditableField';
import { ChevronDownIcon } from '@/icons';
import type { DealTermInputs } from '@app-types/evaluation.types';

interface DealTermsSummaryProps {
  dealTerms: DealTermInputs;
  onChange: (field: keyof DealTermInputs, value: number) => void;
  showHardMoney: boolean;
}

export default function DealTermsSummary({
  dealTerms,
  onChange,
  showHardMoney,
}: DealTermsSummaryProps) {
  const [showDefaults, setShowDefaults] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Primary Zone: This Property */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          This Property
        </h3>

        <div className="grid grid-cols-2 gap-4">
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
            label="Repairs"
            value={dealTerms.repairsMakeReady}
            format="currency"
            onSave={(v) => onChange('repairsMakeReady', v as number)}
          />
          <EditableField
            label="Monthly Rent"
            value={dealTerms.rent}
            format="currency"
            onSave={(v) => onChange('rent', v as number)}
          />
          {showHardMoney && (
            <EditableField
              label="Appraised Value"
              value={dealTerms.estimatedAppraisedValue}
              format="currency"
              onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
            />
          )}
        </div>
      </div>

      {/* Secondary Zone: Costs & Defaults */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowDefaults(!showDefaults)}
          aria-expanded={showDefaults}
          className="flex w-full items-center gap-2 px-6 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
        >
          <ChevronDownIcon
            className={`size-4 transition-transform ${showDefaults ? '' : '-rotate-90'}`}
          />
          <span>Costs & Defaults</span>
          {!showDefaults && (
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              Survey, taxes, insurance, etc.
            </span>
          )}
        </button>

        {showDefaults && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {/* Closing Costs */}
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

              {/* Annual Expenses */}
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
