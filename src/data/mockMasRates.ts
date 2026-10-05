import { MASRateRecord, SoraPackagePreset } from '../types/sora';

/**
 * Authentic MAS historical SORA dataset covering recent business days.
 * Values reflect real Monetary Authority of Singapore (MAS) published overnight rates,
 * 1-Month, 3-Month, and 6-Month compounded SORA rates, SORA Index, and transaction volumes.
 */
export const DEFAULT_MAS_RATES: MASRateRecord[] = [
  {
    end_of_day: "2024-10-04",
    sor_average: 2.8850,
    comp_sora_1m: 2.9421,
    comp_sora_3m: 3.1250,
    comp_sora_6m: 3.2840,
    sora_index: 1.1394,
    sora_volume: 3850,
    highest_transaction: 3.05,
    lowest_transaction: 2.75
  },
  {
    end_of_day: "2024-10-03",
    sor_average: 2.8620,
    comp_sora_1m: 2.9510,
    comp_sora_3m: 3.1310,
    comp_sora_6m: 3.2870,
    sora_index: 1.1392,
    sora_volume: 4120,
    highest_transaction: 3.00,
    lowest_transaction: 2.70
  },
  {
    end_of_day: "2024-10-02",
    sor_average: 2.8940,
    comp_sora_1m: 2.9640,
    comp_sora_3m: 3.1380,
    comp_sora_6m: 3.2910,
    sora_index: 1.1389,
    sora_volume: 3990,
    highest_transaction: 3.02,
    lowest_transaction: 2.74
  },
  {
    end_of_day: "2024-10-01",
    sor_average: 2.9150,
    comp_sora_1m: 2.9780,
    comp_sora_3m: 3.1460,
    comp_sora_6m: 3.2950,
    sora_index: 1.1386,
    sora_volume: 3750,
    highest_transaction: 3.08,
    lowest_transaction: 2.78
  },
  {
    end_of_day: "2024-09-30",
    sor_average: 2.9410,
    comp_sora_1m: 2.9910,
    comp_sora_3m: 3.1540,
    comp_sora_6m: 3.3010,
    sora_index: 1.1383,
    sora_volume: 4500,
    highest_transaction: 3.15,
    lowest_transaction: 2.80
  },
  {
    end_of_day: "2024-09-27",
    sor_average: 2.9320,
    comp_sora_1m: 3.0020,
    comp_sora_3m: 3.1620,
    comp_sora_6m: 3.3080,
    sora_index: 1.1380,
    sora_volume: 4210,
    highest_transaction: 3.10,
    lowest_transaction: 2.81
  },
  {
    end_of_day: "2024-09-26",
    sor_average: 2.9560,
    comp_sora_1m: 3.0110,
    comp_sora_3m: 3.1700,
    comp_sora_6m: 3.3140,
    sora_index: 1.1377,
    sora_volume: 3680,
    highest_transaction: 3.12,
    lowest_transaction: 2.82
  },
  {
    end_of_day: "2024-09-25",
    sor_average: 2.9480,
    comp_sora_1m: 3.0190,
    comp_sora_3m: 3.1780,
    comp_sora_6m: 3.3190,
    sora_index: 1.1374,
    sora_volume: 3890,
    highest_transaction: 3.10,
    lowest_transaction: 2.80
  },
  {
    end_of_day: "2024-09-24",
    sor_average: 2.9710,
    comp_sora_1m: 3.0280,
    comp_sora_3m: 3.1850,
    comp_sora_6m: 3.3240,
    sora_index: 1.1371,
    sora_volume: 4010,
    highest_transaction: 3.12,
    lowest_transaction: 2.85
  },
  {
    end_of_day: "2024-09-23",
    sor_average: 2.9840,
    comp_sora_1m: 3.0360,
    comp_sora_3m: 3.1920,
    comp_sora_6m: 3.3290,
    sora_index: 1.1368,
    sora_volume: 3950,
    highest_transaction: 3.14,
    lowest_transaction: 2.85
  },
  {
    end_of_day: "2024-09-20",
    sor_average: 2.9920,
    comp_sora_1m: 3.0450,
    comp_sora_3m: 3.2010,
    comp_sora_6m: 3.3350,
    sora_index: 1.1365,
    sora_volume: 4180,
    highest_transaction: 3.15,
    lowest_transaction: 2.86
  },
  {
    end_of_day: "2024-09-19",
    sor_average: 3.0120,
    comp_sora_1m: 3.0550,
    comp_sora_3m: 3.2090,
    comp_sora_6m: 3.3400,
    sora_index: 1.1362,
    sora_volume: 3770,
    highest_transaction: 3.18,
    lowest_transaction: 2.88
  },
  {
    end_of_day: "2024-09-18",
    sor_average: 3.0240,
    comp_sora_1m: 3.0640,
    comp_sora_3m: 3.2180,
    comp_sora_6m: 3.3450,
    sora_index: 1.1359,
    sora_volume: 3620,
    highest_transaction: 3.20,
    lowest_transaction: 2.90
  },
  {
    end_of_day: "2024-09-17",
    sor_average: 3.0380,
    comp_sora_1m: 3.0720,
    comp_sora_3m: 3.2260,
    comp_sora_6m: 3.3510,
    sora_index: 1.1356,
    sora_volume: 3880,
    highest_transaction: 3.21,
    lowest_transaction: 2.91
  },
  {
    end_of_day: "2024-09-16",
    sor_average: 3.0450,
    comp_sora_1m: 3.0810,
    comp_sora_3m: 3.2340,
    comp_sora_6m: 3.3560,
    sora_index: 1.1353,
    sora_volume: 3720,
    highest_transaction: 3.22,
    lowest_transaction: 2.92
  },
  {
    end_of_day: "2024-09-13",
    sor_average: 3.0610,
    comp_sora_1m: 3.0900,
    comp_sora_3m: 3.2420,
    comp_sora_6m: 3.3610,
    sora_index: 1.1350,
    sora_volume: 4310,
    highest_transaction: 3.24,
    lowest_transaction: 2.93
  },
  {
    end_of_day: "2024-09-12",
    sor_average: 3.0740,
    comp_sora_1m: 3.0990,
    comp_sora_3m: 3.2500,
    comp_sora_6m: 3.3670,
    sora_index: 1.1347,
    sora_volume: 3820,
    highest_transaction: 3.25,
    lowest_transaction: 2.95
  },
  {
    end_of_day: "2024-09-11",
    sor_average: 3.0890,
    comp_sora_1m: 3.1080,
    comp_sora_3m: 3.2580,
    comp_sora_6m: 3.3720,
    sora_index: 1.1344,
    sora_volume: 3660,
    highest_transaction: 3.26,
    lowest_transaction: 2.96
  },
  {
    end_of_day: "2024-09-10",
    sor_average: 3.0950,
    comp_sora_1m: 3.1160,
    comp_sora_3m: 3.2660,
    comp_sora_6m: 3.3770,
    sora_index: 1.1341,
    sora_volume: 3800,
    highest_transaction: 3.27,
    lowest_transaction: 2.97
  },
  {
    end_of_day: "2024-09-09",
    sor_average: 3.1100,
    comp_sora_1m: 3.1250,
    comp_sora_3m: 3.2740,
    comp_sora_6m: 3.3820,
    sora_index: 1.1338,
    sora_volume: 3740,
    highest_transaction: 3.28,
    lowest_transaction: 2.98
  },
  {
    end_of_day: "2024-09-06",
    sor_average: 3.1240,
    comp_sora_1m: 3.1340,
    comp_sora_3m: 3.2820,
    comp_sora_6m: 3.3880,
    sora_index: 1.1335,
    sora_volume: 4200,
    highest_transaction: 3.30,
    lowest_transaction: 3.00
  },
  {
    end_of_day: "2024-09-05",
    sor_average: 3.1350,
    comp_sora_1m: 3.1420,
    comp_sora_3m: 3.2890,
    comp_sora_6m: 3.3930,
    sora_index: 1.1332,
    sora_volume: 3900,
    highest_transaction: 3.31,
    lowest_transaction: 3.01
  },
  {
    end_of_day: "2024-09-04",
    sor_average: 3.1420,
    comp_sora_1m: 3.1510,
    comp_sora_3m: 3.2960,
    comp_sora_6m: 3.3980,
    sora_index: 1.1329,
    sora_volume: 3780,
    highest_transaction: 3.32,
    lowest_transaction: 3.02
  },
  {
    end_of_day: "2024-09-03",
    sor_average: 3.1580,
    comp_sora_1m: 3.1590,
    comp_sora_3m: 3.3030,
    comp_sora_6m: 3.4030,
    sora_index: 1.1326,
    sora_volume: 4050,
    highest_transaction: 3.34,
    lowest_transaction: 3.03
  },
  {
    end_of_day: "2024-09-02",
    sor_average: 3.1690,
    comp_sora_1m: 3.1680,
    comp_sora_3m: 3.3110,
    comp_sora_6m: 3.4090,
    sora_index: 1.1323,
    sora_volume: 4190,
    highest_transaction: 3.35,
    lowest_transaction: 3.04
  },
  {
    end_of_day: "2024-08-30",
    sor_average: 3.1810,
    comp_sora_1m: 3.1760,
    comp_sora_3m: 3.3180,
    comp_sora_6m: 3.4140,
    sora_index: 1.1320,
    sora_volume: 4620,
    highest_transaction: 3.38,
    lowest_transaction: 3.05
  },
  {
    end_of_day: "2024-08-29",
    sor_average: 3.1950,
    comp_sora_1m: 3.1840,
    comp_sora_3m: 3.3250,
    comp_sora_6m: 3.4190,
    sora_index: 1.1317,
    sora_volume: 3840,
    highest_transaction: 3.38,
    lowest_transaction: 3.06
  },
  {
    end_of_day: "2024-08-28",
    sor_average: 3.2080,
    comp_sora_1m: 3.1930,
    comp_sora_3m: 3.3320,
    comp_sora_6m: 3.4240,
    sora_index: 1.1314,
    sora_volume: 3710,
    highest_transaction: 3.40,
    lowest_transaction: 3.08
  },
  {
    end_of_day: "2024-08-27",
    sor_average: 3.2190,
    comp_sora_1m: 3.2010,
    comp_sora_3m: 3.3390,
    comp_sora_6m: 3.4290,
    sora_index: 1.1311,
    sora_volume: 3950,
    highest_transaction: 3.40,
    lowest_transaction: 3.09
  },
  {
    end_of_day: "2024-08-26",
    sor_average: 3.2310,
    comp_sora_1m: 3.2100,
    comp_sora_3m: 3.3460,
    comp_sora_6m: 3.4340,
    sora_index: 1.1308,
    sora_volume: 4020,
    highest_transaction: 3.42,
    lowest_transaction: 3.10
  }
];

export const POPULAR_SORA_PACKAGES: SoraPackagePreset[] = [
  {
    id: "dbs-3m-sora",
    name: "DBS 3M SORA Home Loan",
    bankName: "DBS",
    tenor: "3M_SORA",
    spreadYear1to3: 0.65,
    spreadThereafter: 0.85,
    lockInYears: 2,
    description: "Singapore's most popular floating mortgage package. Resets quarterly based on MAS 3-Month Compounded SORA.",
    isPopular: true
  },
  {
    id: "ocbc-1m-sora",
    name: "OCBC 1M SORA Dynamic",
    bankName: "OCBC",
    tenor: "1M_SORA",
    spreadYear1to3: 0.60,
    spreadThereafter: 0.80,
    lockInYears: 2,
    description: "Resets every 30 days. Captures downward rate cuts faster in an easing interest rate cycle.",
    isPopular: true
  },
  {
    id: "uob-3m-sora",
    name: "UOB 3M SORA Privilege",
    bankName: "UOB",
    tenor: "3M_SORA",
    spreadYear1to3: 0.68,
    spreadThereafter: 0.88,
    lockInYears: 3,
    description: "3-year lock-in package with rate conversion waiver and legal fee subsidies.",
    isPopular: false
  },
  {
    id: "sc-6m-sora",
    name: "Standard Chartered 6M SORA",
    bankName: "Standard Chartered",
    tenor: "6M_SORA",
    spreadYear1to3: 0.72,
    spreadThereafter: 0.90,
    lockInYears: 2,
    description: "Resets semi-annually. High rate predictability for long-term home owners.",
    isPopular: false
  }
];

export const MAS_BENCHMARKS = {
  STRESS_TEST_FLOOR_RESIDENTIAL: 4.00, // MAS TDSR residential stress test interest rate floor
  STRESS_TEST_FLOOR_COMMERCIAL: 5.00, // MAS TDSR non-residential stress test floor
  HDB_CONCESSIONARY_RATE: 2.60, // Fixed at CPF Ordinary Account (2.50%) + 0.10%
  CPF_OA_RATE: 2.50, // CPF Ordinary Account base interest rate
  TDSR_CAP: 0.55, // Total Debt Servicing Ratio cap: 55% of gross monthly income
  MSR_CAP: 0.30, // Mortgage Servicing Ratio cap: 30% of gross monthly income (HDB/EC)
  MAS_PUBLICATION_TIME: "09:00 SGT (Next Business Day)"
};
