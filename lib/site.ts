import { env } from "@/lib/env";

const LOCAL_URL = "http://localhost:3000";

function withProtocol(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export function getSiteUrl() {
  const explicit = env.appUrl;
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const deployment = process.env.VERCEL_URL;

  if (explicit) {
    return withProtocol(explicit);
  }

  if (production) {
    return withProtocol(production);
  }

  if (deployment) {
    return withProtocol(deployment);
  }

  return LOCAL_URL;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function getRequestOrigin(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return getSiteUrl();
  }
}
