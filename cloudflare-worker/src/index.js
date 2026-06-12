const MAX_BODY_BYTES = 2 * 1024 * 1024;

function getAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return "*";

  const configured = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  if (configured.includes(origin)) return origin;

  try {
    const url = new URL(origin);
    const isLocal =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");

    return isLocal ? origin : null;
  } catch {
    return null;
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function json(payload, status, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default {
  async fetch(request, env) {
    const allowedOrigin = getAllowedOrigin(request, env);

    if (!allowedOrigin) {
      return new Response("Forbidden origin", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowedOrigin)
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405, allowedOrigin);
    }

    if (!env.APPS_SCRIPT_URL) {
      return json({ ok: false, error: "Proxy is not configured" }, 500, allowedOrigin);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "Request body is too large" }, 413, allowedOrigin);
    }

    try {
      const body = await request.text();

      if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
        return json({ ok: false, error: "Request body is too large" }, 413, allowedOrigin);
      }

      const upstream = await fetch(env.APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body,
        redirect: "follow"
      });

      const responseBody = await upstream.text();

      return new Response(responseBody, {
        status: upstream.ok ? 200 : upstream.status,
        headers: {
          ...corsHeaders(allowedOrigin),
          "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8"
        }
      });
    } catch (error) {
      console.error("Apps Script proxy request failed");
      return json({ ok: false, error: "Upstream service unavailable" }, 502, allowedOrigin);
    }
  }
};
