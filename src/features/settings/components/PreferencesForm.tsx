import { useState, useEffect } from 'react';
import Input from '@components/form/input/InputField';
import Label from '@components/form/Label';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useUpdatePreferences, useResetPreferences } from '@hooks/api/useSettings';
import { useMlsMarkets, useStates } from '@hooks/api/useAdmin';
import { useAuth } from '@context/AuthContext';
import type { UserPreferences } from '@app-types/auth.types';
import { DEFAULT_PREFERENCES } from '@app-types/settings.types';

export function PreferencesForm() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form state
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const updatePreferences = useUpdatePreferences();
  const resetPreferences = useResetPreferences();
  const { data: mlsMarkets } = useMlsMarkets();
  const { data: states } = useStates();

  // Initialize with user preferences
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...user.preferences });
    }
  }, [user]);

  const handleChange = (field: keyof UserPreferences, value: string | number | boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof UserPreferences, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      handleChange(field, num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    updatePreferences.mutate(
      { userId: user!.id, preferences },
      {
        onSuccess: () => setSuccess(true),
        onError: () => setError('Failed to update preferences'),
      }
    );
  };

  const handleReset = () => {
    setError(null);
    setSuccess(false);

    resetPreferences.mutate(
      { userId: user!.id },
      {
        onSuccess: () => {
          setPreferences(DEFAULT_PREFERENCES);
          setSuccess(true);
          setShowResetConfirm(false);
        },
        onError: () => setError('Failed to reset preferences'),
      }
    );
  };

  const isPending = updatePreferences.isPending || resetPreferences.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <Alert variant="error" title="Error" message={error} />}
      {success && (
        <Alert variant="success" title="Success" message="Preferences saved" />
      )}

      {/* Location Defaults */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Location Defaults
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>MLS Market</Label>
            <select
              value={preferences.mlsMarket}
              onChange={(e) => handleChange('mlsMarket', e.target.value)}
              disabled={isPending}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            >
              <option value="">Select market</option>
              {mlsMarkets?.map((m) => (
                <option key={m.acronym} value={m.acronym}>
                  {m.acronym} - {m.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>State</Label>
            <select
              value={preferences.state}
              onChange={(e) => handleChange('state', e.target.value)}
              disabled={isPending}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            >
              <option value="">Select state</option>
              {states?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
            <Input
              type="number"
              value={preferences.evaluationSalePlusMinusSqft}
              onChange={(e) => handleNumberChange('evaluationSalePlusMinusSqft', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Sale Comps Year Built +/-</Label>
            <Input
              type="number"
              value={preferences.evaluationSalePlusMinusYearBuilt}
              onChange={(e) => handleNumberChange('evaluationSalePlusMinusYearBuilt', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Sale Comps Months Closed</Label>
            <Input
              type="number"
              value={preferences.evaluationSaleMonthsClosed}
              onChange={(e) => handleNumberChange('evaluationSaleMonthsClosed', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Rent Comps Sqft +/-</Label>
            <Input
              type="number"
              value={preferences.evaluationRentPlusMinusSqft}
              onChange={(e) => handleNumberChange('evaluationRentPlusMinusSqft', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Rent Comps Year Built +/-</Label>
            <Input
              type="number"
              value={preferences.evaluationRentPlusMinusYearBuilt}
              onChange={(e) => handleNumberChange('evaluationRentPlusMinusYearBuilt', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Rent Comps Months Closed</Label>
            <Input
              type="number"
              value={preferences.evaluationRentMonthsClosed}
              onChange={(e) => handleNumberChange('evaluationRentMonthsClosed', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Search Radius (miles)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.evaluationRadius}
              onChange={(e) => handleNumberChange('evaluationRadius', e.target.value)}
              disabled={isPending}
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
            <Label>Survey ($)</Label>
            <Input
              type="number"
              value={preferences.dealSurvey}
              onChange={(e) => handleNumberChange('dealSurvey', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Appraisal ($)</Label>
            <Input
              type="number"
              value={preferences.dealAppraisal}
              onChange={(e) => handleNumberChange('dealAppraisal', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Inspection ($)</Label>
            <Input
              type="number"
              value={preferences.dealInspection}
              onChange={(e) => handleNumberChange('dealInspection', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Property Insurance (% of Value)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.dealPropertyInsurancePercentListPrice}
              onChange={(e) => handleNumberChange('dealPropertyInsurancePercentListPrice', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Property Tax (% of Value)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.dealPropertyTaxPercentListPrice}
              onChange={(e) => handleNumberChange('dealPropertyTaxPercentListPrice', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Default Repairs ($)</Label>
            <Input
              type="number"
              value={preferences.dealRepairs}
              onChange={(e) => handleNumberChange('dealRepairs', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Max Refi Cashback ($)</Label>
            <Input
              type="number"
              value={preferences.dealMaxRefiCashback}
              onChange={(e) => handleNumberChange('dealMaxRefiCashback', e.target.value)}
              disabled={isPending}
            />
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
            <Input
              type="number"
              step={0.1}
              value={preferences.conventionalDownPayment}
              onChange={(e) => handleNumberChange('conventionalDownPayment', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Interest Rate (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.conventionalInterestRate}
              onChange={(e) => handleNumberChange('conventionalInterestRate', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Lender Fees (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.conventionalLenderFeesPercentOfListPrice}
              onChange={(e) => handleNumberChange('conventionalLenderFeesPercentOfListPrice', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Months Escrow</Label>
            <Input
              type="number"
              value={preferences.conventionalMonthsTaxEscrow}
              onChange={(e) => handleNumberChange('conventionalMonthsTaxEscrow', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Loan Term (years)</Label>
            <Input
              type="number"
              value={preferences.conventionalLoanTermInYears}
              onChange={(e) => handleNumberChange('conventionalLoanTermInYears', e.target.value)}
              disabled={isPending}
            />
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
            <Input
              type="number"
              step={0.1}
              value={preferences.hardLoanToValuePercent}
              onChange={(e) => handleNumberChange('hardLoanToValuePercent', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Lender Fees (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.hardLenderFeesPercentOfListPrice}
              onChange={(e) => handleNumberChange('hardLenderFeesPercentOfListPrice', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Interest Rate (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.hardInterestRate}
              onChange={(e) => handleNumberChange('hardInterestRate', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Months Until Refi</Label>
            <Input
              type="number"
              value={preferences.hardMonthsUntilRefi}
              onChange={(e) => handleNumberChange('hardMonthsUntilRefi', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Weeks Until Leased</Label>
            <Input
              type="number"
              value={preferences.hardWeeksUntilLeased}
              onChange={(e) => handleNumberChange('hardWeeksUntilLeased', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={preferences.hardRollInLenderFees}
              onChange={(e) => handleChange('hardRollInLenderFees', e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label>Roll In Lender Fees</Label>
          </div>
        </div>

        <h4 className="mb-4 mt-6 font-medium text-gray-700 dark:text-gray-300">
          Refinance Terms
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Refi Loan to Value (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.hardRefiLoanToValue}
              onChange={(e) => handleNumberChange('hardRefiLoanToValue', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Refi Loan Term (years)</Label>
            <Input
              type="number"
              value={preferences.hardRefiLoanTermInYears}
              onChange={(e) => handleNumberChange('hardRefiLoanTermInYears', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Refi Interest Rate (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.hardRefiInterestRate}
              onChange={(e) => handleNumberChange('hardRefiInterestRate', e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Refi Lender Fees (%)</Label>
            <Input
              type="number"
              step={0.1}
              value={preferences.hardRefiLenderFeesPercentListPrice}
              onChange={(e) => handleNumberChange('hardRefiLenderFeesPercentListPrice', e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {showResetConfirm ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Reset all preferences?
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isPending}
                >
                  Yes, Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isPending}
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
              disabled={isPending}
            >
              Reset to Defaults
            </Button>
          )}
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}
