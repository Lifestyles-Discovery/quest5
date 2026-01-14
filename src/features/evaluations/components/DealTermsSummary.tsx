import { EditableField } from '@/components/form/EditableField';
import { InfoIcon } from '@/icons';
import { FieldHelp, useHelpSection } from '@/features/guidance';
import type { DealTermInputs } from '@app-types/evaluation.types';

interface DealTermsSummaryProps {
  dealTerms: DealTermInputs;
  onChange: (field: keyof DealTermInputs, value: number) => void;
  saleCompValue?: number;
  rentCompValue?: number;
  showHardMoney?: boolean;
}

export default function DealTermsSummary({
  dealTerms,
  onChange,
  saleCompValue,
  rentCompValue,
  showHardMoney,
}: DealTermsSummaryProps) {
  const [helpEnabled, toggleHelp] = useHelpSection('deal-terms');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Primary: The 4 numbers that define the deal */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            The Deal
          </h2>
          <button
            onClick={toggleHelp}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              helpEnabled
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            }`}
            title={helpEnabled ? 'Hide help' : 'Show help'}
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </div>
        <div className={`grid grid-cols-2 gap-4 ${showHardMoney ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <div>
            <EditableField
              label="Purchase Price"
              value={dealTerms.purchasePrice}
              format="currency"
              onSave={(v) => onChange('purchasePrice', v as number)}
              size="xl"
            />
            <FieldHelp helpKey="purchasePrice" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="Market Value"
              value={dealTerms.estimatedMarketValue}
              format="currency"
              onSave={(v) => onChange('estimatedMarketValue', v as number)}
              hint={saleCompValue ? `From sale comps: ${formatCurrency(saleCompValue)}` : 'From your sale comps'}
              size="xl"
            />
            <FieldHelp helpKey="estimatedMarketValue" show={helpEnabled} />
          </div>
          {showHardMoney && (
            <div>
              <EditableField
                label="Hard Appraised Value"
                value={dealTerms.estimatedAppraisedValue}
                format="currency"
                onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
                hint="For hard money LTV"
                size="xl"
              />
              <FieldHelp helpKey="estimatedAppraisedValue" show={helpEnabled} />
            </div>
          )}
          <div>
            <EditableField
              label="Monthly Rent"
              value={dealTerms.rent}
              format="currency"
              onSave={(v) => onChange('rent', v as number)}
              hint={rentCompValue ? `From rent comps: ${formatCurrency(rentCompValue)}/mo` : 'From your rent comps'}
              size="xl"
            />
            <FieldHelp helpKey="rent" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="Repairs"
              value={dealTerms.repairsMakeReady}
              format="currency"
              onSave={(v) => onChange('repairsMakeReady', v as number)}
              size="xl"
            />
            <FieldHelp helpKey="repairsMakeReady" show={helpEnabled} />
          </div>
        </div>
      </div>

      {/* Secondary: Costs & adjustments */}
      <div
        className="border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/50"
        data-expandable-content="true"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Property-specific (change every deal) */}
          <div>
            <EditableField
              label="Property Tax"
              value={dealTerms.propertyTaxAnnual}
              format="currency"
              suffix="/yr"
              onSave={(v) => onChange('propertyTaxAnnual', v as number)}
              size="sm"
              hint="From county records or listing"
            />
            <FieldHelp helpKey="propertyTaxAnnual" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="Insurance"
              value={dealTerms.propertyInsuranceAnnual}
              format="currency"
              suffix="/yr"
              onSave={(v) => onChange('propertyInsuranceAnnual', v as number)}
              size="sm"
              hint="~0.5% of value annually"
            />
            <FieldHelp helpKey="propertyInsuranceAnnual" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="HOA"
              value={dealTerms.hoaAnnual}
              format="currency"
              suffix="/yr"
              onSave={(v) => onChange('hoaAnnual', v as number)}
              size="sm"
              hint="From listing, $0 if none"
            />
            <FieldHelp helpKey="hoaAnnual" show={helpEnabled} />
          </div>

          {/* Deal-specific (change sometimes) */}
          <div>
            <EditableField
              label="Seller Credit"
              value={dealTerms.sellerContribution}
              format="currency"
              onSave={(v) => onChange('sellerContribution', v as number)}
              size="sm"
              hint="Negotiated closing cost credit"
            />
            <FieldHelp helpKey="sellerContribution" show={helpEnabled} />
          </div>
          {!showHardMoney && (
            <div>
              <EditableField
                label="Hard Appraised Value"
                value={dealTerms.estimatedAppraisedValue}
                format="currency"
                onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
                size="sm"
                hint="For hard money. Use Market Value if unknown"
              />
              <FieldHelp helpKey="estimatedAppraisedValue" show={helpEnabled} />
            </div>
          )}
          <div>
            <EditableField
              label="Max Refi Cashback"
              value={dealTerms.maxRefiCashback}
              format="currency"
              onSave={(v) => onChange('maxRefiCashback', v as number)}
              size="sm"
              hint="Limits cash-out on refinance"
            />
            <FieldHelp helpKey="maxRefiCashback" show={helpEnabled} />
          </div>

          {/* Investor defaults (rarely change) */}
          <div>
            <EditableField
              label="Misc Monthly"
              value={dealTerms.miscellaneousMonthly}
              format="currency"
              suffix="/mo"
              onSave={(v) => onChange('miscellaneousMonthly', v as number)}
              size="sm"
              hint="Maintenance, lawn, reserves"
            />
            <FieldHelp helpKey="miscMonthly" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="Survey"
              value={dealTerms.survey}
              format="currency"
              onSave={(v) => onChange('survey', v as number)}
              size="sm"
            />
            <FieldHelp helpKey="survey" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="Appraisal"
              value={dealTerms.appraisal}
              format="currency"
              onSave={(v) => onChange('appraisal', v as number)}
              size="sm"
            />
            <FieldHelp helpKey="appraisal" show={helpEnabled} />
          </div>
          <div>
            <EditableField
              label="Inspection"
              value={dealTerms.inspection}
              format="currency"
              onSave={(v) => onChange('inspection', v as number)}
              size="sm"
            />
            <FieldHelp helpKey="inspection" show={helpEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
