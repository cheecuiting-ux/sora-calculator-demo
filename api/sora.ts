/**
 * Serverless MAS SORA Integration Endpoint
 * Route: /api/sora
 * 
 * Pulls daily SORA + compounded 1M/3M/6M averages from MAS API Gateway:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 * 
 * Required Header:
 * KeyId: <MAS_KEY_ID>
 */

export const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export interface SoraApiResponse {
  success: boolean;
  source: 'MAS_API_GATEWAY' | 'CACHE' | 'ERROR';
  totalRecords?: number;
  records: NormalizedSoraRecord[];
  meta?: {
    endpoint: string;
    keyConfigured: boolean;
    cachedAt?: string;
    fetchedAt: string;
    publicationSchedule: string;
  };
  error?: string;
  details?: string;
  raw?: any;
}

export interface NormalizedSoraRecord {
  end_of_day: string;
  sor_average: number;
  comp_sora_1m?: number;
  comp_sora_3m?: number;
  comp_sora_6m?: number;
  sora_index?: number;
  sora_volume?: number;
  highest_transaction?: number;
  lowest_transaction?: number;
}

// In-memory cache for serverless invocation reuse
let cacheData: {
  data: any;
  cachedAt: number;
} | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

export default async function handler(req: any, res?: any) {
  const masKeyId = process.env.MAS_KEY_ID;
  const isKeyConfigured = Boolean(masKeyId && masKeyId.trim() !== '' && masKeyId !== 'YOUR_MAS_KEY_ID');

  // Helper to send JSON response across Express (res.status().json()) or Web Request/Response
  const sendResponse = (statusCode: number, payload: SoraApiResponse) => {
    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
      return res.status(statusCode).json(payload);
    }
    return new Response(JSON.stringify(payload, null, 2), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=900, stale-while-revalidate=1800',
      },
    });
  };

  // If MAS_KEY_ID is missing
  if (!isKeyConfigured) {
    return sendResponse(401, {
      success: false,
      source: 'ERROR',
      records: [],
      error: 'MAS_KEY_ID environment variable is missing or unconfigured.',
      details:
        'Please set MAS_KEY_ID in your environment variables or .env file. Requests to MAS API Gateway require the header "KeyId: <MAS_KEY_ID>".',
      meta: {
        endpoint: MAS_SORA_ENDPOINT,
        keyConfigured: false,
        fetchedAt: new Date().toISOString(),
        publicationSchedule: 'Every Singapore business day at 09:00 SGT',
      },
    });
  }

  // Check cache (unless force-refresh is requested via ?refresh=true or ?nocache=true)
  const query = req?.query || (req?.url ? Object.fromEntries(new URL(req.url, 'http://localhost').searchParams) : {});
  const shouldBypassCache = query.refresh === 'true' || query.nocache === 'true';

  if (!shouldBypassCache && cacheData && Date.now() - cacheData.cachedAt < CACHE_TTL_MS) {
    return sendResponse(200, {
      ...cacheData.data,
      source: 'CACHE',
      meta: {
        ...cacheData.data.meta,
        cachedAt: new Date(cacheData.cachedAt).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
    });
  }

  // Fetch from official MAS API Gateway
  try {
    // Forward optional query parameters like rows or date limits if provided
    const targetUrl = new URL(MAS_SORA_ENDPOINT);
    if (query.rows) targetUrl.searchParams.set('rows', String(query.rows));
    if (query.sort) targetUrl.searchParams.set('sort', String(query.sort));
    if (query.filter) targetUrl.searchParams.set('filter', String(query.filter));

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'KeyId': masKeyId!.trim(),
        'Accept': 'application/json',
        'User-Agent': 'Singapore-SORA-Calculator/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return sendResponse(response.status, {
        success: false,
        source: 'ERROR',
        records: [],
        error: `MAS API Gateway responded with HTTP status ${response.status} (${response.statusText})`,
        details: errorText,
        meta: {
          endpoint: targetUrl.toString(),
          keyConfigured: true,
          fetchedAt: new Date().toISOString(),
          publicationSchedule: 'Every Singapore business day at 09:00 SGT',
        },
      });
    }

    const rawData = await response.json();
    const records = normalizeMasRecords(rawData);

    const payload: SoraApiResponse = {
      success: true,
      source: 'MAS_API_GATEWAY',
      totalRecords: records.length,
      records,
      meta: {
        endpoint: MAS_SORA_ENDPOINT,
        keyConfigured: true,
        fetchedAt: new Date().toISOString(),
        publicationSchedule: 'Every Singapore business day at 09:00 SGT',
      },
      raw: rawData,
    };

    // Save in cache
    cacheData = {
      data: payload,
      cachedAt: Date.now(),
    };

    return sendResponse(200, payload);
  } catch (error: any) {
    return sendResponse(502, {
      success: false,
      source: 'ERROR',
      records: [],
      error: 'Failed to connect to MAS API Gateway',
      details: error?.message || String(error),
      meta: {
        endpoint: MAS_SORA_ENDPOINT,
        keyConfigured: true,
        fetchedAt: new Date().toISOString(),
        publicationSchedule: 'Every Singapore business day at 09:00 SGT',
      },
    });
  }
}

/**
 * Normalizes different MAS JSON structures into standard SORA records
 */
function normalizeMasRecords(rawJson: any): NormalizedSoraRecord[] {
  if (!rawJson) return [];

  // MAS Gateway responses can be { data: [...] }, { result: { records: [...] } }, or direct array [...]
  const rawList: any[] = Array.isArray(rawJson)
    ? rawJson
    : Array.isArray(rawJson.data)
    ? rawJson.data
    : Array.isArray(rawJson?.result?.records)
    ? rawJson.result.records
    : Array.isArray(rawJson?.records)
    ? rawJson.records
    : [];

  return rawList
    .map((item) => {
      const endOfDay = String(
        item.end_of_day || item.endOfDay || item.date || item.publication_date || ''
      );

      const parseNum = (val: any) => {
        if (val === undefined || val === null || val === '') return undefined;
        const n = parseFloat(String(val));
        return isNaN(n) ? undefined : n;
      };

      const sorAvg = parseNum(item.sor_average || item.sorAverage || item.sora || item.rate) ?? 0;
      const comp1m = parseNum(item.comp_sora_1m || item.compSora1m || item.comp_1m || item.sora_1m);
      const comp3m = parseNum(item.comp_sora_3m || item.compSora3m || item.comp_3m || item.sora_3m);
      const comp6m = parseNum(item.comp_sora_6m || item.compSora6m || item.comp_6m || item.sora_6m);
      const index = parseNum(item.sora_index || item.soraIndex);
      const volume = parseNum(item.sora_volume || item.soraVolume || item.volume);
      const highest = parseNum(item.highest_transaction || item.highestTransaction);
      const lowest = parseNum(item.lowest_transaction || item.lowestTransaction);

      return {
        end_of_day: endOfDay,
        sor_average: sorAvg,
        comp_sora_1m: comp1m,
        comp_sora_3m: comp3m,
        comp_sora_6m: comp6m,
        sora_index: index,
        sora_volume: volume,
        highest_transaction: highest,
        lowest_transaction: lowest,
      };
    })
    .filter((r) => r.end_of_day && r.sor_average > 0);
}
