import { useState } from 'react';
import { useUpdateCalculator } from '@/hooks/api/useEvaluations';
import DealScorecard from './DealScorecard';
import DealTermsSummary from './DealTermsSummary';
import FinancingSection from './FinancingSection';
import type {
  Evaluation,
  DealTermInputs,
  ConventionalInputs,
  HardMoneyInputs,
} from '@app-types/evaluation.types';

interface CalculatorSectionProps {
  propertyId: string;
  evaluationId: string;
  evaluation: Evaluation;
}

export default function CalculatorSection({
  propertyId,
  evaluationId,
  evaluation,
}: CalculatorSectionProps) {
  const calculator = evaluation.calculator;
  const updateCalculator = useUpdateCalculator();

  // Track which financing sections are expanded (loan settings are rarely changed)
  const [conventionalExpanded, setConventionalExpanded] = useState(false);
  const [hardMoneyExpanded, setHardMoneyExpanded] = useState(false);

  // API requires ALL calculator values to be sent each time (like Quest4)
  const handleDealTermChange = async (field: keyof DealTermInputs, value: number) => {
    await updateCalculator.mutateAsync({
      propertyId,
      evaluationId,
      dealTermInputs: { ...calculator.dealTermInputs, [field]: value },
      conventionalInputs: calculator.conventionalInputs,
      hardMoneyInputs: calculator.hardMoneyInputs,
    });
  };

  const handleConventionalChange = async (
    field: keyof ConventionalInputs,
    value: number | boolean
  ) => {
    await updateCalculator.mutateAsync({
      propertyId,
      evaluationId,
      dealTermInputs: calculator.dealTermInputs,
      conventionalInputs: { ...calculator.conventionalInputs, [field]: value },
      hardMoneyInputs: calculator.hardMoneyInputs,
    });
  };

  const handleHardMoneyChange = async (
    field: keyof HardMoneyInputs,
    value: number | boolean
  ) => {
    await updateCalculator.mutateAsync({
      propertyId,
      evaluationId,
      dealTermInputs: calculator.dealTermInputs,
      conventionalInputs: calculator.conventionalInputs,
      hardMoneyInputs: { ...calculator.hardMoneyInputs, [field]: value },
    });
  };

  if (!calculator) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Calculator data not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Deal Terms - Always visible, this is why you're here */}
      <DealTermsSummary
        dealTerms={calculator.dealTermInputs}
        onChange={handleDealTermChange}
        showHardMoney={calculator.hardMoneyInputs.show}
      />

      {/* Results - The payoff, right after your inputs */}
      <DealScorecard
        calculator={calculator}
        onToggleConventional={(show) => handleConventionalChange('show', show)}
        onToggleHardMoney={(show) => handleHardMoneyChange('show', show)}
      />

      {/* Conventional - Collapsed by default, rarely changed */}
      <FinancingSection
        type="conventional"
        calculator={calculator}
        onConventionalChange={handleConventionalChange}
        onHardMoneyChange={handleHardMoneyChange}
        isExpanded={conventionalExpanded}
        onToggle={() => setConventionalExpanded(!conventionalExpanded)}
      />

      {/* Hard Money - Collapsed by default, rarely changed */}
      <FinancingSection
        type="hardmoney"
        calculator={calculator}
        onConventionalChange={handleConventionalChange}
        onHardMoneyChange={handleHardMoneyChange}
        isExpanded={hardMoneyExpanded}
        onToggle={() => setHardMoneyExpanded(!hardMoneyExpanded)}
      />
    </div>
  );
}
