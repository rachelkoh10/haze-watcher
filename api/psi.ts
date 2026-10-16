import type { Request, Response } from 'express';

const DATA_GOV_SG_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export interface V2PsiResponse {
  code: number;
  data: {
    regionMetadata: Array<{
      name: string;
      labelLocation: {
        latitude: number;
        longitude: number;
      };
    }>;
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: Record<string, Record<string, number>>;
    }>;
  };
  errorMsg?: string;
}

/**
 * Serverless / Express endpoint for Singapore Pollutant Standards Index (PSI)
 * GET /api/psi
 * Upstream: https://api-open.data.gov.sg/v2/real-time/api/psi
 * No API key required.
 */
export default async function handler(req: Request, res: Response) {
  // CORS & caching headers for serverless execution
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported.',
    });
  }

  try {
    const url = new URL(DATA_GOV_SG_PSI_URL);
    
    // Forward query params (e.g. ?date=YYYY-MM-DD or ?date_time=YYYY-MM-DDTHH:mm:ss) if provided
    if (req.query?.date && typeof req.query.date === 'string') {
      url.searchParams.set('date', req.query.date);
    }
    if (req.query?.date_time && typeof req.query.date_time === 'string') {
      url.searchParams.set('date_time', req.query.date_time);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const upstreamResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BreatheSG-Serverless/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        error: 'Upstream Error',
        message: `data.gov.sg responded with status ${upstreamResponse.status}`,
      });
    }

    const payload: V2PsiResponse = await upstreamResponse.json();

    return res.status(200).json({
      success: true,
      source: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
      retrievedAt: new Date().toISOString(),
      ...payload,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown network failure';
    
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway',
      message: 'Failed to fetch real-time PSI data from data.gov.sg.',
      details: errorMessage,
    });
  }
}

export { handler as psiHandler };
