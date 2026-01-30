import { useState, useCallback } from 'react';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useUpdatePreferences, useResetPreferences } from '@hooks/api/useSettings';
import { useMlsMarkets, useStates } from '@hooks/api/useAdmin';
import { useAuth } from '@context/AuthContext';
import type { UserPreferences } from '@app-types/auth.types';
import { DEFAULT_PREFERENCES } from '@app-types/settings.types';
import { SettingHelp } from './SettingHelp';
import Label from '@components/form/Label';
import AutoSaveInput from '@components/form/input/AutoSaveInput';
import AutoSaveCurrencyInput from '@components/form/input/AutoSaveCurrencyInput';
import AutoSaveSelect from '@components/form/input/AutoSaveSelect';
import AutoSaveCheckbox from '@components/form/input/AutoSaveCheckbox';

export function PreferencesForm() {
  const { user } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const updatePreferences = useUpdatePreferences();
  const resetPreferences = useResetPreferences();
  const { data: mlsMarkets } = useMlsMarkets();
  const { data: states } = useStates();

  // Get preferences with defaults
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...user?.preferences,
  };

  // Save a single field - backend now supports partial updates with nullable types
  const saveField = useCallback(
    async <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => {
      await updatePreferences.mutateAsync({
        userId: user!.id,
        preferences: { [field]: value },
      });
    },
    [updatePreferences, user]
  );

  const handleReset = () => {
    setResetError(null);
    setResetSuccess(false);

    resetPreferences.mutate(
      { userId: user!.id },
      {
        onSuccess: () => {
          setResetSuccess(true);
          setShowResetConfirm(false);
          setTimeout(() => setResetSuccess(false), 3000);
        },
        onError: () => setResetError('Failed to reset preferences'),
      }
    );
  };

  const isResetting = resetPreferences.isPending;

  return (
    <div className="space-y-8">
      {resetError && <Alert variant="error" title="Error" message={resetError} />}
      {resetSuccess && (
        <Alert variant="success" title="Success" message="Preferences reset to defaults" />
      )}

      {/* Location Defaults */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Location Defaults
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>MLS Market</Label>
            <AutoSaveSelect
              value={preferences.mlsMarket}
              onSave={(v) => saveField('mlsMarket', v)}
              disabled={isResetting}
            >
              <option value="">Select market</option>
              {mlsMarkets?.map((m) => (
                <option key={m.acronym} value={m.acronym}>
                  {m.acronym} - {m.description}
                </option>
              ))}
            </AutoSaveSelect>
            <SettingHelp settingKey="mlsMarket" />
          </div>
          <div>
            <Label>State</Label>
            <AutoSaveSelect
              value={preferences.state}
              onSave={(v) => saveField('state', v)}
              disabled={isResetting}
            >
              <option value="">Select state</option>
              {states?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </AutoSaveSelect>
            <SettingHelp settingKey="state" />
          </div>
        </div>
      </section>

      {/* Evaluation Inputs */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Evaluation Inputs
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Sale Comps Sqft +/-</Label>
            <AutoSaveInput
              type="number"
              value={preferences.evaluationSalePlusMinusSqft}
              onSave={(v) => saveField('evaluationSalePlusMinusSqft', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationSalePlusMinusSqft" />
          </div>
          <div>
            <Label>Sale Comps Year Built +/-</Label>
            <AutoSaveInput
              type="number"
              value={preferences.evaluationSalePlusMinusYearBuilt}
              onSave={(v) => saveField('evaluationSalePlusMinusYearBuilt', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationSalePlusMinusYearBuilt" />
          </div>
          <div>
            <Label>Sale Comps Months Closed</Label>
            <AutoSaveInput
              type="number"
              value={preferences.evaluationSaleMonthsClosed}
              onSave={(v) => saveField('evaluationSaleMonthsClosed', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationSaleMonthsClosed" />
          </div>
          <div>
            <Label>Rent Comps Sqft +/-</Label>
            <AutoSaveInput
              type="number"
              value={preferences.evaluationRentPlusMinusSqft}
              onSave={(v) => saveField('evaluationRentPlusMinusSqft', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationRentPlusMinusSqft" />
          </div>
          <div>
            <Label>Rent Comps Year Built +/-</Label>
            <AutoSaveInput
              type="number"
              value={preferences.evaluationRentPlusMinusYearBuilt}
              onSave={(v) => saveField('evaluationRentPlusMinusYearBuilt', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationRentPlusMinusYearBuilt" />
          </div>
          <div>
            <Label>Rent Comps Months Closed</Label>
            <AutoSaveInput
              type="number"
              value={preferences.evaluationRentMonthsClosed}
              onSave={(v) => saveField('evaluationRentMonthsClosed', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationRentMonthsClosed" />
          </div>
          <div>
            <Label>Search Radius (miles)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.evaluationRadius}
              onSave={(v) => saveField('evaluationRadius', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="evaluationRadius" />
          </div>
        </div>
      </section>

      {/* Calculator Defaults */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Calculator Defaults
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <AutoSaveCheckbox
              label="Show Conventional by Default"
              checked={preferences.defaultShowConventional}
              onSave={(v) => saveField('defaultShowConventional', v)}
              disabled={isResetting}
            />
          </div>
          <div>
            <AutoSaveCheckbox
              label="Show Hard Money by Default"
              checked={preferences.defaultShowHardMoney}
              onSave={(v) => saveField('defaultShowHardMoney', v)}
              disabled={isResetting}
            />
          </div>
        </div>
      </section>

      {/* Deal Inputs */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Deal Inputs
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Survey</Label>
            <AutoSaveCurrencyInput
              value={preferences.dealSurvey}
              onSave={(v) => saveField('dealSurvey', v)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealSurvey" />
          </div>
          <div>
            <Label>Appraisal</Label>
            <AutoSaveCurrencyInput
              value={preferences.dealAppraisal}
              onSave={(v) => saveField('dealAppraisal', v)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealAppraisal" />
          </div>
          <div>
            <Label>Inspection</Label>
            <AutoSaveCurrencyInput
              value={preferences.dealInspection}
              onSave={(v) => saveField('dealInspection', v)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealInspection" />
          </div>
          <div>
            <Label>Property Insurance (% of Value)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.dealPropertyInsurancePercentListPrice}
              onSave={(v) => saveField('dealPropertyInsurancePercentListPrice', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealPropertyInsurancePercentListPrice" />
          </div>
          <div>
            <Label>Property Tax (% of Value)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.dealPropertyTaxPercentListPrice}
              onSave={(v) => saveField('dealPropertyTaxPercentListPrice', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealPropertyTaxPercentListPrice" />
          </div>
          <div>
            <Label>Default Repairs</Label>
            <AutoSaveCurrencyInput
              value={preferences.dealRepairs}
              onSave={(v) => saveField('dealRepairs', v)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealRepairs" />
          </div>
          <div>
            <Label>Max Refi Cashback</Label>
            <AutoSaveCurrencyInput
              value={preferences.dealMaxRefiCashback}
              onSave={(v) => saveField('dealMaxRefiCashback', v)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="dealMaxRefiCashback" />
          </div>
        </div>
      </section>

      {/* Conventional Financing */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Conventional Financing
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Down Payment (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.conventionalDownPayment}
              onSave={(v) => saveField('conventionalDownPayment', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="conventionalDownPayment" />
          </div>
          <div>
            <Label>Interest Rate (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.conventionalInterestRate}
              onSave={(v) => saveField('conventionalInterestRate', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="conventionalInterestRate" />
          </div>
          <div>
            <Label>Lender Fees (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.conventionalLenderFeesPercentOfListPrice}
              onSave={(v) => saveField('conventionalLenderFeesPercentOfListPrice', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="conventionalLenderFeesPercentOfListPrice" />
          </div>
          <div>
            <Label>Months Escrow</Label>
            <AutoSaveInput
              type="number"
              value={preferences.conventionalMonthsTaxEscrow}
              onSave={(v) => saveField('conventionalMonthsTaxEscrow', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="conventionalMonthsTaxEscrow" />
          </div>
          <div>
            <Label>Loan Term (years)</Label>
            <AutoSaveInput
              type="number"
              value={preferences.conventionalLoanTermInYears}
              onSave={(v) => saveField('conventionalLoanTermInYears', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="conventionalLoanTermInYears" />
          </div>
        </div>
      </section>

      {/* Hard Money Financing */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Hard Money Financing
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Loan to Value (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.hardLoanToValuePercent}
              onSave={(v) => saveField('hardLoanToValuePercent', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardLoanToValuePercent" />
          </div>
          <div>
            <Label>Lender Fees (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.hardLenderFeesPercentOfListPrice}
              onSave={(v) => saveField('hardLenderFeesPercentOfListPrice', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardLenderFeesPercentOfListPrice" />
          </div>
          <div>
            <Label>Interest Rate (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.hardInterestRate}
              onSave={(v) => saveField('hardInterestRate', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardInterestRate" />
          </div>
          <div>
            <Label>Months Until Refi</Label>
            <AutoSaveInput
              type="number"
              value={preferences.hardMonthsUntilRefi}
              onSave={(v) => saveField('hardMonthsUntilRefi', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardMonthsUntilRefi" />
          </div>
          <div>
            <Label>Weeks Until Leased</Label>
            <AutoSaveInput
              type="number"
              value={preferences.hardWeeksUntilLeased}
              onSave={(v) => saveField('hardWeeksUntilLeased', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardWeeksUntilLeased" />
          </div>
          <div>
            <div className="pt-6">
              <AutoSaveCheckbox
                label="Roll In Lender Fees"
                checked={preferences.hardRollInLenderFees}
                onSave={(v) => saveField('hardRollInLenderFees', v)}
                disabled={isResetting}
              />
            </div>
            <SettingHelp settingKey="hardRollInLenderFees" />
          </div>
        </div>

        <h4 className="mb-4 mt-6 font-medium text-gray-700 dark:text-gray-300">
          Refinance Terms
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Refi Loan to Value (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.hardRefiLoanToValue}
              onSave={(v) => saveField('hardRefiLoanToValue', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardRefiLoanToValue" />
          </div>
          <div>
            <Label>Refi Loan Term (years)</Label>
            <AutoSaveInput
              type="number"
              value={preferences.hardRefiLoanTermInYears}
              onSave={(v) => saveField('hardRefiLoanTermInYears', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardRefiLoanTermInYears" />
          </div>
          <div>
            <Label>Refi Interest Rate (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.hardRefiInterestRate}
              onSave={(v) => saveField('hardRefiInterestRate', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardRefiInterestRate" />
          </div>
          <div>
            <Label>Refi Lender Fees (%)</Label>
            <AutoSaveInput
              type="number"
              step={0.1}
              value={preferences.hardRefiLenderFeesPercentListPrice}
              onSave={(v) => saveField('hardRefiLenderFeesPercentListPrice', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardRefiLenderFeesPercentListPrice" />
          </div>
          <div>
            <Label>Refi Months Escrow</Label>
            <AutoSaveInput
              type="number"
              value={preferences.hardRefiMonthsTaxEscrow}
              onSave={(v) => saveField('hardRefiMonthsTaxEscrow', v as number)}
              disabled={isResetting}
            />
            <SettingHelp settingKey="hardRefiMonthsTaxEscrow" />
          </div>
        </div>
      </section>

      {/* Reset to Defaults */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        {showResetConfirm ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Reset all preferences to defaults?
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isResetting}
              >
                Yes, Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            disabled={isResetting}
          >
            Reset to Defaults
          </Button>
        )}
      </div>
    </div>
  );
}
