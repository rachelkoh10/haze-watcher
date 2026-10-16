import type { Request, Response } from 'express';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

/**
 * Serverless / Express health check endpoint
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  const healthData: HealthCheckResponse = {
    status: 'ok',
    service: 'breathe-sg-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json(healthData);
}

export { handler as healthHandler };
