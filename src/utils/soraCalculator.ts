import { AmortizationPeriod, YearlyAmortizationSummary } from '../types/sora';

/**
 * Calculates standard monthly mortgage payment using annuity formula
 * @param principal Loan principal in SGD
 * @param annualRatePercentage Annual effective interest rate in % (e.g. 3.75)
 * @param tenureYears Loan tenure in years (e.g. 25)
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRatePercentage: number,
  tenureYears: number
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  if (annualRatePercentage <= 0) {
    return principal / (tenureYears * 12);
  }

  const monthlyRate = (annualRatePercentage / 100) / 12;
  const totalMonths = tenureYears * 12;

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return isNaN(payment) ? 0 : Math.round(payment * 100) / 100;
}

/**
 * Generates month-by-month and year-by-year amortization schedules.
 * Applies Singapore Actual/365 day-count convention.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRatePercentage: number,
  tenureYears: number,
  startDate: Date = new Date()
): {
  monthlySchedule: AmortizationPeriod[];
  yearlySchedule: YearlyAmortizationSummary[];
  totalInterestPaid: number;
  totalPayment: number;
  monthlyPayment: number;
} {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRatePercentage, tenureYears);
  const totalMonths = tenureYears * 12;
  const monthlySchedule: AmortizationPeriod[] = [];
  const yearlyMap = new Map<number, YearlyAmortizationSummary>();

  let remainingBalance = principal;
  let accumulatedInterest = 0;

  for (let i = 1; i <= totalMonths; i++) {
    // Current period date
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i - 1, 1);
    const yearNumber = Math.ceil(i / 12);
    const calendarYear = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    // Days in this month for exact SGD Act/365 calculation
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    // Daily interest = Balance * (annualRate / 100) / 365 * daysInMonth
    // Or standard 1/12 monthly installment convention
    const periodInterest = (remainingBalance * (annualRatePercentage / 100) / 365) * daysInMonth;
    
    let principalPaid = monthlyPayment - periodInterest;
    
    // Final period adjustment
    if (i === totalMonths || remainingBalance - principalPaid < 0) {
      principalPaid = remainingBalance;
    }

    const beginningBalance = remainingBalance;
    remainingBalance = Math.max(0, remainingBalance - principalPaid);
    accumulatedInterest += periodInterest;

    const row: AmortizationPeriod = {
      period: i,
      year: yearNumber,
      month: (i - 1) % 12 + 1,
      dateStr: monthName,
      beginningBalance: Math.round(beginningBalance * 100) / 100,
      monthlyPayment: Math.round((principalPaid + periodInterest) * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      interestPaid: Math.round(periodInterest * 100) / 100,
      endingBalance: Math.round(remainingBalance * 100) / 100,
      totalInterestPaid: Math.round(accumulatedInterest * 100) / 100,
      effectiveRate: annualRatePercentage
    };

    monthlySchedule.push(row);

    // Accumulate yearly summary
    if (!yearlyMap.has(yearNumber)) {
      yearlyMap.set(yearNumber, {
        year: yearNumber,
        startingBalance: beginningBalance,
        endingBalance: remainingBalance,
        totalPayment: 0,
        principalPaid: 0,
        interestPaid: 0,
        accumulatedInterest: 0
      });
    }

    const ySummary = yearlyMap.get(yearNumber)!;
    ySummary.endingBalance = remainingBalance;
    ySummary.totalPayment += row.monthlyPayment;
    ySummary.principalPaid += row.principalPaid;
    ySummary.interestPaid += row.interestPaid;
    ySummary.accumulatedInterest = accumulatedInterest;
  }

  const yearlySchedule = Array.from(yearlyMap.values()).map(y => ({
    ...y,
    startingBalance: Math.round(y.startingBalance * 100) / 100,
    endingBalance: Math.round(y.endingBalance * 100) / 100,
    totalPayment: Math.round(y.totalPayment * 100) / 100,
    principalPaid: Math.round(y.principalPaid * 100) / 100,
    interestPaid: Math.round(y.interestPaid * 100) / 100,
    accumulatedInterest: Math.round(y.accumulatedInterest * 100) / 100
  }));

  const totalPayment = principal + accumulatedInterest;

  return {
    monthlySchedule,
    yearlySchedule,
    totalInterestPaid: Math.round(accumulatedInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    monthlyPayment
  };
}

/**
 * Formats Singapore Dollar currency
 */
export function formatSGD(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * Formats percentage
 */
export function formatPercent(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Downloads CSV of the amortization schedule
 */
export function exportAmortizationCSV(
  monthlySchedule: AmortizationPeriod[],
  loanAmount: number,
  effectiveRate: number,
  tenureYears: number
) {
  const headers = [
    'Period (Month)',
    'Date',
    'Beginning Balance (SGD)',
    'Monthly Installment (SGD)',
    'Principal Paid (SGD)',
    'Interest Paid (SGD)',
    'Ending Balance (SGD)',
    'Cumulative Interest (SGD)',
    'Effective Rate (%)'
  ];

  const rows = monthlySchedule.map(r => [
    r.period,
    `"${r.dateStr}"`,
    r.beginningBalance.toFixed(2),
    r.monthlyPayment.toFixed(2),
    r.principalPaid.toFixed(2),
    r.interestPaid.toFixed(2),
    r.endingBalance.toFixed(2),
    r.totalInterestPaid.toFixed(2),
    r.effectiveRate.toFixed(4)
  ]);

  const metaRows = [
    `# Singapore SORA Loan Amortization Schedule`,
    `# Loan Amount: SGD ${loanAmount.toLocaleString()}`,
    `# Effective Interest Rate: ${effectiveRate.toFixed(4)}% p.a.`,
    `# Loan Tenure: ${tenureYears} Years (${tenureYears * 12} Months)`,
    `# Day Count Convention: Actual/365 (MAS Standard)`,
    `# Generated: ${new Date().toISOString()}`,
    ''
  ];

  const csvContent = [
    metaRows.join('\n'),
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SORA_Loan_Amortization_${loanAmount}_SGD.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
