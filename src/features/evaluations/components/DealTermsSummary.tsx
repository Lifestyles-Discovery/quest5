import { useState } from 'react';
import { EditableField } from '@/components/form/EditableField';
import { formatCurrency } from '@/utils/formatters';
import { ChevronDownIcon } from '@/icons';
import type { DealTermInputs } from '@app-types/evaluation.types';

interface DealTermsSummaryProps {
  dealTerms: DealTermInputs;
  onChange: (field: keyof DealTermInputs, value: number) => void;
  defaultExpanded?: boolean;
}

export default function DealTermsSummary({
  dealTerms,
  onChange,
  defaultExpanded = false,
}: DealTermsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-3">
          <ChevronDownIcon
            className={`size-5 text-gray-400 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Terms
          </h3>
        </div>

        {/* Inline summary when collapsed */}
        {!isExpanded && (
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
            <span>
              <span className="text-gray-400">Purchase:</span>{' '}
              {formatCurrency(dealTerms.purchasePrice)}
            </span>
            <span className="hidden sm:inline">
              <span className="text-gray-400">Rent:</span>{' '}
              {formatCurrency(dealTerms.rent)}/mo
            </span>
            <span className="hidden md:inline">
              <span className="text-gray-400">Repairs:</span>{' '}
              {formatCurrency(dealTerms.repairsMakeReady)}
            </span>
            <span className="hidden lg:inline">
              <span className="text-gray-400">Value:</span>{' '}
              {formatCurrency(dealTerms.estimatedMarketValue)}
            </span>
          </div>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="space-y-6">
            {/* The Numbers */}
            <Section title="Property Values">
              <EditableField
                label="Purchase Price"
                value={dealTerms.purchasePrice}
                format="currency"
                onSave={(v) => onChange('purchasePrice', v as number)}
                size="sm"
              />
              <EditableField
                label="Market Value"
                value={dealTerms.estimatedMarketValue}
                format="currency"
                onSave={(v) => onChange('estimatedMarketValue', v as number)}
                size="sm"
              />
              <EditableField
                label="Appraised Value"
                value={dealTerms.estimatedAppraisedValue}
                format="currency"
                onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
                size="sm"
              />
              <EditableField
                label="Seller Credit"
                value={dealTerms.sellerContribution}
                format="currency"
                onSave={(v) => onChange('sellerContribution', v as number)}
                size="sm"
              />
            </Section>

            {/* Costs */}
            <Section title="Closing Costs">
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
              <EditableField
                label="Repairs"
                value={dealTerms.repairsMakeReady}
                format="currency"
                onSave={(v) => onChange('repairsMakeReady', v as number)}
                size="sm"
              />
            </Section>

            {/* Ongoing Expenses */}
            <Section title="Annual Expenses">
              <EditableField
                label="Property Tax"
                value={dealTerms.propertyTaxAnnual}
                format="currency"
                onSave={(v) => onChange('propertyTaxAnnual', v as number)}
                size="sm"
              />
              <EditableField
                label="Insurance"
                value={dealTerms.propertyInsuranceAnnual}
                format="currency"
                onSave={(v) => onChange('propertyInsuranceAnnual', v as number)}
                size="sm"
              />
              <EditableField
                label="HOA"
                value={dealTerms.hoaAnnual}
                format="currency"
                onSave={(v) => onChange('hoaAnnual', v as number)}
                size="sm"
              />
              <EditableField
                label="Misc (Monthly)"
                value={dealTerms.miscellaneousMonthly}
                format="currency"
                onSave={(v) => onChange('miscellaneousMonthly', v as number)}
                size="sm"
              />
            </Section>

            {/* Income */}
            <Section title="Income">
              <EditableField
                label="Monthly Rent"
                value={dealTerms.rent}
                format="currency"
                onSave={(v) => onChange('rent', v as number)}
                size="sm"
              />
              <EditableField
                label="Max Refi Cashback"
                value={dealTerms.maxRefiCashback}
                format="currency"
                onSave={(v) => onChange('maxRefiCashback', v as number)}
                size="sm"
              />
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
