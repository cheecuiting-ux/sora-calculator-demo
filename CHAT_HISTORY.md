# Singapore SORA Calculator — Project Chat History & Build Log

**Project**: Singapore SORA Loan & Mortgage Calculator  
**Repository**: [cheecuiting-ux/sora-calculator-demo](https://github.com/cheecuiting-ux/sora-calculator-demo)  
**Date**: October 5, 2026  

---

## 1. Initial Prompt & Implementation

### User Request
> "build me a simple Singapore based SORA calculator that reads MAS backed overnight rates for calculating interest payments accurately and efficiently. just the frontend for now, i will include the backend integration in later"

### Architecture & Key Features Built

1. **MAS Overnight Rates & Compounded SORA Conventions**
   - Implemented the official Monetary Authority of Singapore (MAS) Compounded SORA in Arrears formula:
     $$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_0} \left( 1 + \frac{r_i \times n_i}{365 \times 100} \right) - 1 \right] \times \frac{365}{d} \times 100\%$$
   - Strict adherence to Singapore's **Actual/365** day-count convention.
   - Weekend weighting support: Friday published rates carry forward through Saturday and Sunday ($n_i = 3$).
   - Built a **Step-by-Step Daily Compounding Inspector** displaying each business day's overnight rate $r_i$, weighting days $n_i$, daily factor, and running cumulative product.

2. **Mortgage Calculation Engine**
   - Property price with Singapore presets (HDB 3/4/5-rm, EC, City Condo, Prime Condo).
   - Loan-to-Value (LTV) downpayment sliders (15% to 75%).
   - Loan tenure selector (5 to 30 years).
   - SORA tenor selector: 3M Compounded SORA (most popular bank peg), 1M Compounded SORA, 6M Compounded SORA, Daily Spot SORA, or Custom Rate.
   - Bank margin / spread adjustment (+0.60% to +0.85%).
   - Pre-loaded Singapore bank packages: DBS 3M SORA, OCBC 1M SORA, UOB 3M SORA, Standard Chartered 6M SORA.
   - Real-time Interest Rate Sensitivity Simulator ($-1.50\%$ to $+2.50\%$).

3. **Singapore Regulatory & Benchmark Checks**
   - **MAS 4.00% Stress Test Floor**: Evaluates monthly installments against the statutory residential interest rate floor required under MAS TDSR guidelines.
   - **TDSR Assessment**: Total Debt Servicing Ratio check (55% maximum limit of gross monthly income).
   - **MSR Assessment**: Mortgage Servicing Ratio check (30% maximum limit for HDB & EC buyers).
   - **HDB Concessionary Benchmark**: Direct comparison against the CPF Ordinary Account + 0.10% (2.60% fixed) rate.

4. **Amortization & Reporting**
   - Visual balance progression chart (SVG) tracking outstanding balance decline vs. accumulated interest.
   - Filterable Annual and Monthly amortization tables.
   - Excel-compatible **CSV Export** and **Copy Summary** utilities.

5. **Files Created**:
   - `src/types/sora.ts`
   - `src/data/mockMasRates.ts`
   - `src/services/masService.ts`
   - `src/utils/soraCalculator.ts`
   - `src/components/Header.tsx`
   - `src/components/MasRatesBar.tsx`
   - `src/components/RateChart.tsx`
   - `src/components/MortgageCalculator.tsx`
   - `src/components/CompoundingInspector.tsx`
   - `src/components/AmortizationSchedule.tsx`
   - `src/components/LoanComparison.tsx`
   - `src/components/BackendIntegrationModal.tsx`
   - `src/components/MasRulesGuideModal.tsx`
   - `src/App.tsx`

---

## 2. First Git Push

### User Request
> `git push https://ghp_...`

### Actions Taken
- Initialized local Git repository in `/app/applet`.
- Configured user details and committed all codebase files:
  `[master (root-commit) 6d80a8e] Initial commit: Singapore SORA Loan Calculator`
- Set remote origin to `https://github.com/cheecuiting-ux/sora-calculator-demo.git`.
- Pushed branch `main` to GitHub.

---

## 3. Serverless MAS API Integration

### User Request
> "add a serverless connection that pulls MAS data using the following end points: 
> - store this in /api folder (at project root level) NOT src file 
> - include /health.ts and /sora.ts within the same subfolder
> - do not hardcode any api keys, i willl include them manually
> 
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
> 
> # All requests need the header: KeyId: <MAS_KEY_ID>"

### Implementation Details

1. **/api/sora.ts**
   - Located at project root: `/api/sora.ts`.
   - Calls the MAS API Gateway endpoint:
     `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
   - Injects the required header dynamically:
     ```typescript
     headers: {
       'KeyId': process.env.MAS_KEY_ID,
       'Accept': 'application/json'
     }
     ```
   - Validates that `MAS_KEY_ID` exists in environment variables; returns clear HTTP 401 guidance if missing.
   - Includes 15-minute in-memory caching to reduce MAS latency and prevent rate-limiting (supports `?refresh=true` to force-fetch).
   - Normalizes MAS response structures while returning full raw data.
   - Universal handler compatible with Vercel Serverless Functions, AWS Lambda, Netlify, and Express.

2. **/api/health.ts**
   - Located at project root: `/api/health.ts`.
   - Returns service status, server uptime, and verifies if `MAS_KEY_ID` is set without exposing the key value.

3. **/.env.example**
   - Added environment variable declaration:
     ```env
     # MAS_KEY_ID: Required for authenticating with the Monetary Authority of Singapore (MAS) API gateway.
     # Header sent: KeyId: <MAS_KEY_ID>
     MAS_KEY_ID="YOUR_MAS_KEY_ID"
     ```

4. **/server.ts** & **/src/services/masService.ts**
   - Full-stack Express server mounting `/api/health` and `/api/sora` with Vite dev middleware for seamless local and production execution.
   - Frontend service updated to automatically query `/api/sora` first.

---

## 4. Second Git Push

### User Request
> `git push https://ghp_...`

### Actions Taken
- Committed serverless files and configurations:
  `[main 77885fb] Add serverless MAS connection with /api/health.ts and /api/sora.ts`
- Pushed commit `77885fb` to `main` on GitHub:
  `6d80a8e..77885fb  main -> main`
- Working tree verified clean.

---

## 5. Export Request

### User Request
> "export this entire chat as a .md file"

### Result
- Generated `/CHAT_HISTORY.md` at root level containing full record of interactions, specifications, code architecture, formulas, and deployment history.
