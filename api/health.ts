/**
 * Serverless Health Check Endpoint
 * Route: /api/health
 */

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  masGateway: {
    endpointConfigured: boolean;
    masKeyConfigured: boolean;
    headerRequired: 'KeyId';
  };
  supportedEndpoints: string[];
}

export default async function handler(req: any, res?: any) {
  const masKeyId = process.env.MAS_KEY_ID;
  const isKeyConfigured = Boolean(masKeyId && masKeyId.trim() !== '' && masKeyId !== 'YOUR_MAS_KEY_ID');

  const healthData: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'development',
    masGateway: {
      endpointConfigured: true,
      masKeyConfigured: isKeyConfigured,
      headerRequired: 'KeyId',
    },
    supportedEndpoints: [
      '/api/health',
      '/api/sora',
    ],
  };

  // If running in Express or standard Node.js serverless handler
  if (res && typeof res.status === 'function' && typeof res.json === 'function') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(healthData);
  }

  // If running in Web standard Request/Response serverless runtime (e.g. Next.js App Router / Edge)
  return new Response(JSON.stringify(healthData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
