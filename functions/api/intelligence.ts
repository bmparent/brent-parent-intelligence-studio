import {
  buildLocalFallback,
  type IntelligencePayload,
} from '../_shared/portfolioKnowledge';

interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

import { body as readPlatformBody } from '../_shared/platform/core';
const MAX_REQUEST_BYTES = 6000;
function cleanString(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function json(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
function cleanPayload(raw: unknown): IntelligencePayload {
  const body =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const answers =
    body.answers && typeof body.answers === 'object'
      ? (body.answers as Record<string, unknown>)
      : {};

  const mode = ['compass', 'concierge', 'automation', 'brief'].includes(
    String(body.mode),
  )
    ? (String(body.mode) as IntelligencePayload['mode'])
    : 'compass';

  return {
    mode,
    prompt: cleanString(body.prompt, 900),
    answers: {
      projectType: cleanString(answers.projectType, 90),
      businessType: cleanString(answers.businessType, 90),
      currentStack: cleanString(answers.currentStack, 140),
      pain: cleanString(answers.pain, 180),
      timeline: cleanString(answers.timeline, 80),
      budget: cleanString(answers.budget, 80),
    },
    signals: Array.isArray(body.signals)
      ? body.signals
          .map((item) => cleanString(item, 60))
          .filter(Boolean)
          .slice(0, 9)
      : [],
    localMatchIds: Array.isArray(body.localMatchIds)
      ? body.localMatchIds
          .map((item) => cleanString(item, 80))
          .filter(Boolean)
          .slice(0, 4)
      : [],
  };
}

export const onRequestPost = async ({ request }: PagesContext) => {
  try {
    const payload = cleanPayload(
      await readPlatformBody(request, MAX_REQUEST_BYTES),
    );
    return json(buildLocalFallback(payload));
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Invalid request.' },
      { status: 400 },
    );
  }
};
