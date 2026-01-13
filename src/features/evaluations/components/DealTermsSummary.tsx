import { EditableField } from '@/components/form/EditableField';
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          The Deal
        </h2>
        <div className={`grid grid-cols-2 gap-4 ${showHardMoney ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <EditableField
            label="Purchase Price"
            value={dealTerms.purchasePrice}
            format="currency"
            onSave={(v) => onChange('purchasePrice', v as number)}
            size="xl"
          />
          <EditableField
            label="Market Value"
            value={dealTerms.estimatedMarketValue}
            format="currency"
            onSave={(v) => onChange('estimatedMarketValue', v as number)}
            hint={saleCompValue ? `From sale comps: ${formatCurrency(saleCompValue)}` : 'From your sale comps'}
            size="xl"
          />
          {showHardMoney && (
            <EditableField
              label="Hard Appraised Value"
              value={dealTerms.estimatedAppraisedValue}
              format="currency"
              onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
              hint="For hard money LTV"
              size="xl"
            />
          )}
          <EditableField
            label="Monthly Rent"
            value={dealTerms.rent}
            format="currency"
            onSave={(v) => onChange('rent', v as number)}
            hint={rentCompValue ? `From rent comps: ${formatCurrency(rentCompValue)}/mo` : 'From your rent comps'}
            size="xl"
          />
          <EditableField
            label="Repairs"
            value={dealTerms.repairsMakeReady}
            format="currency"
            onSave={(v) => onChange('repairsMakeReady', v as number)}
            size="xl"
          />
        </div>
      </div>

      {/* Secondary: Costs & adjustments */}
      <div
        className="border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/50"
        data-expandable-content="true"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Property-specific (change every deal) */}
          <EditableField
            label="Property Tax"
            value={dealTerms.propertyTaxAnnual}
            format="currency"
            suffix="/yr"
            onSave={(v) => onChange('propertyTaxAnnual', v as number)}
            size="sm"
            hint="From county records or listing"
          />
          <EditableField
            label="Insurance"
            value={dealTerms.propertyInsuranceAnnual}
            format="currency"
            suffix="/yr"
            onSave={(v) => onChange('propertyInsuranceAnnual', v as number)}
            size="sm"
            hint="~0.5% of value annually"
          />
          <EditableField
            label="HOA"
            value={dealTerms.hoaAnnual}
            format="currency"
            suffix="/yr"
            onSave={(v) => onChange('hoaAnnual', v as number)}
            size="sm"
            hint="From listing, $0 if none"
          />

          {/* Deal-specific (change sometimes) */}
          <EditableField
            label="Seller Credit"
            value={dealTerms.sellerContribution}
            format="currency"
            onSave={(v) => onChange('sellerContribution', v as number)}
            size="sm"
            hint="Negotiated closing cost credit"
          />
          {!showHardMoney && (
            <EditableField
              label="Hard Appraised Value"
              value={dealTerms.estimatedAppraisedValue}
              format="currency"
              onSave={(v) => onChange('estimatedAppraisedValue', v as number)}
              size="sm"
              hint="For hard money. Use Market Value if unknown"
            />
          )}
          <EditableField
            label="Max Refi Cashback"
            value={dealTerms.maxRefiCashback}
            format="currency"
            onSave={(v) => onChange('maxRefiCashback', v as number)}
            size="sm"
            hint="Limits cash-out on refinance"
          />

          {/* Investor defaults (rarely change) */}
          <EditableField
            label="Misc Monthly"
            value={dealTerms.miscellaneousMonthly}
            format="currency"
            suffix="/mo"
            onSave={(v) => onChange('miscellaneousMonthly', v as number)}
            size="sm"
            hint="Maintenance, lawn, reserves"
          />
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
        </div>
      </div>
    </div>
  );
}
