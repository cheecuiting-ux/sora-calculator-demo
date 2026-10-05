export interface MASRateRecord {
  end_of_day: string; // YYYY-MM-DD
  sor_average: number; // Daily overnight SORA in %
  comp_sora_1m?: number; // 1-Month Compounded SORA in %
  comp_sora_3m?: number; // 3-Month Compounded SORA in %
  comp_sora_6m?: number; // 6-Month Compounded SORA in %
  sora_index?: number; // Official SORA index
  sora_volume?: number; // Volume in SGD Millions
  highest_transaction?: number;
  lowest_transaction?: number;
}

export type SoraTenor = '1M_SORA' | '3M_SORA' | '6M_SORA' | 'DAILY_SORA' | 'CUSTOM';

export interface SoraPackagePreset {
  id: string;
  name: string;
  bankName: string;
  tenor: SoraTenor;
  spreadYear1to3: number; // e.g. 0.65%
  spreadThereafter: number; // e.g. 0.85%
  lockInYears: number;
  description: string;
  isPopular?: boolean;
}

export interface LoanInputState {
  propertyPrice: number;
  downpaymentPercent: number;
  loanAmount: number;
  tenureYears: number;
  selectedTenor: SoraTenor;
  bankSpread: number;
  customBaseRate?: number;
  dayCountMethod: 'ACT_365' | 'ACT_360' | '30_360';
  stressTestRate: number; // MAS default 4.00%
  rateAdjustment: number; // What-if simulation delta (-1.5% to +2.5%)
  propertyType: 'HDB' | 'EC' | 'PRIVATE_CONDO' | 'LANDED' | 'COMMERCIAL';
  monthlyIncome: number;
}

export interface AmortizationPeriod {
  period: number;
  year: number;
  month: number;
  dateStr: string;
  beginningBalance: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  totalInterestPaid: number;
  effectiveRate: number;
}

export interface YearlyAmortizationSummary {
  year: number;
  startingBalance: number;
  endingBalance: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  accumulatedInterest: number;
}

export interface CompoundedCalculationStep {
  date: string;
  nextDate: string;
  calendarDays: number; // n_i
  dailyRate: number; // r_i (%)
  factor: number; // 1 + (r_i * n_i / 365)
  cumulativeProduct: number;
}

export interface CompoundingResult {
  compoundedRate: number; // % rounded to 4 decimals
  startDate: string;
  endDate: string;
  totalCalendarDays: number;
  businessDaysCount: number;
  steps: CompoundedCalculationStep[];
  formulaString: string;
}

export interface MASDataSourceConfig {
  mode: 'DIRECT_MAS' | 'CUSTOM_PROXY' | 'FALLBACK';
  customProxyUrl: string;
  lastSyncTime: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage: string | null;
}
