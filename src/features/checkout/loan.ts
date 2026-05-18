import type { LoanConfig } from '@/config/runtime';

export interface LoanPaymentPlan {
  months: number;
  label: string;
  monthlyPayment: number;
  totalFinanced: number;
}

const normalizeRate = (rate: number) => (rate > 1 ? rate / 100 : rate);

export const isLoanAmountAllowed = (amount: number, loan: LoanConfig): boolean => {
  if (!loan.enabled || amount <= 0) return false;
  if (loan.minAmount > 0 && amount < loan.minAmount) return false;
  if (loan.maxAmount > 0 && amount > loan.maxAmount) return false;
  return true;
};

export const buildLoanPaymentPlans = (amount: number, loan: LoanConfig): LoanPaymentPlan[] => {
  if (!isLoanAmountAllowed(amount, loan)) return [];

  const originationFeeRate = normalizeRate(loan.originationFeeRate);
  const financedBase = amount * (1 + Math.max(originationFeeRate, 0));

  return loan.terms.map((term) => {
    const monthlyRate = normalizeRate(term.monthlyRate ?? loan.monthlyRate);
    const totalFinanced = financedBase * (1 + Math.max(monthlyRate, 0) * term.months);

    return {
      months: term.months,
      label: term.label,
      monthlyPayment: totalFinanced / term.months,
      totalFinanced,
    };
  });
};

export const getPrimaryLoanPaymentPlan = (amount: number, loan: LoanConfig): LoanPaymentPlan | null => {
  const plans = buildLoanPaymentPlans(amount, loan);
  return plans.find((plan) => plan.months === loan.defaultTermMonths) || plans[0] || null;
};