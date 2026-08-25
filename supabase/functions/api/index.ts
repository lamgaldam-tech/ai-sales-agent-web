import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function htmlResponse(html: string) {
  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/html" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

const oauthSuccessHtml = `<!DOCTYPE html>
<html>
  <body>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          { type: "OAUTH_COMPLETE", status: "success" },
          "*",
        );
      }
      window.close();
    </script>
  </body>
</html>`;

const oauthErrorHtml = `<!DOCTYPE html>
<html>
  <body>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_COMPLETE",
            status: "error",
            error: "OAuth authentication failed",
          },
          "*",
        );
      }
      window.close();
    </script>
  </body>
</html>`;

interface AuthContext {
  userId: string;
  businessId: string;
}

async function authenticate(req: Request, supabase: ReturnType<typeof createClient>): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!business) return null;

  return { userId: user.id, businessId: business.id };
}

function routeFromPath(pathname: string): { route: string; params: Record<string, string> } | null {
  const parts = pathname.replace("/functions/v1/api", "").split("/").filter(Boolean);

  if (parts.length === 0) return { route: "root", params: {} };
  if (parts.length === 1 && parts[0] === "connection") return { route: "connection", params: {} };
  if (parts.length === 1 && parts[0] === "integrations") return { route: "integrations", params: {} };
  if (parts.length === 1 && parts[0] === "products") return { route: "products", params: {} };
  if (parts.length === 1 && parts[0] === "broadcast") return { route: "broadcast", params: {} };
  if (parts.length === 4 && parts[0] === "integrations" && parts[3] === "redirect") {
    return { route: "integrations_redirect", params: { type: parts[1], identifier: parts[2] } };
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const routed = routeFromPath(url.pathname);

  if (!routed) {
    return errorResponse("Not found", 404);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });

  const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // --- GET /connection ---
    if (routed.route === "connection" && req.method === "GET") {
      const auth = await authenticate(req, supabase);
      if (!auth) return errorResponse("Unauthorized", 401);

      // Check if business has a connected integration or WhatsApp session
      const { data: integrations } = await serviceSupabase
        .from("integrations")
        .select("id")
        .eq("business_id", auth.businessId);

      const connected = (integrations && integrations.length > 0) || false;

      // Generate a placeholder QR code data URL
      const qr = connected
        ? ""
        : `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12" fill="#333">Scan to connect</text></svg>`)}`;

      return jsonResponse({ connected, qr });
    }

    // --- GET /integrations ---
    if (routed.route === "integrations" && req.method === "GET") {
      const auth = await authenticate(req, supabase);
      if (!auth) return errorResponse("Unauthorized", 401);

      const { data: integrations } = await serviceSupabase
        .from("integrations")
        .select("id, name, type, identifier, access_token")
        .eq("business_id", auth.businessId);

      const result = (integrations || []).map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        identifier: i.identifier,
        connected: !!i.access_token,
      }));

      return jsonResponse({ integrations: result });
    }

    // --- POST /integrations ---
    if (routed.route === "integrations" && req.method === "POST") {
      const auth = await authenticate(req, supabase);
      if (!auth) return errorResponse("Unauthorized", 401);

      const body = await req.json();
      const { type, name, identifier } = body;

      if (!type || !name || !identifier) {
        return errorResponse("Missing required fields: type, name, identifier", 400);
      }

      const validTypes = ["shopify", "youcan", "google_sheets"];
      if (!validTypes.includes(type)) {
        return errorResponse("Invalid integration type", 400);
      }

      // For OAuth-based integrations, generate an auth URL
      // In a real implementation, this would redirect to the provider's OAuth flow
      const authUrls: Record<string, string> = {
        shopify: `https://${identifier}/admin/oauth/authorize?client_id=demo&scope=read_products&redirect_uri=${encodeURIComponent(url.origin + "/functions/v1/api/integrations/" + type + "/" + identifier + "/redirect")}`,
        youcan: `https://api.youcan.shop/oauth/authorize?client_id=demo&redirect_uri=${encodeURIComponent(url.origin + "/functions/v1/api/integrations/" + type + "/" + identifier + "/redirect")}`,
        google_sheets: `https://accounts.google.com/o/oauth2/auth?client_id=demo&redirect_uri=${encodeURIComponent(url.origin + "/functions/v1/api/integrations/" + type + "/" + identifier + "/redirect")}&scope=https://www.googleapis.com/auth/spreadsheets.readonly&response_type=code`,
      };

      return jsonResponse({ auth_url: authUrls[type] || null });
    }

    // --- DELETE /integrations ---
    if (routed.route === "integrations" && req.method === "DELETE") {
      const auth = await authenticate(req, supabase);
      if (!auth) return errorResponse("Unauthorized", 401);

      const body = await req.json();
      const { id } = body;

      if (!id) return errorResponse("Missing integration id", 400);

      await serviceSupabase
        .from("integrations")
        .delete()
        .eq("id", id)
        .eq("business_id", auth.businessId);

      return jsonResponse({ success: true });
    }

    // --- GET /integrations/:type/:identifier/redirect ---
    if (routed.route === "integrations_redirect" && req.method === "GET") {
      const { type, identifier } = routed.params;
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error || !code) {
        return htmlResponse(oauthErrorHtml);
      }

      // In a real implementation, exchange the code for tokens
      // and store them in the integrations table
      const auth = await authenticate(req, supabase);
      if (!auth) return htmlResponse(oauthErrorHtml);

      const { data: existing } = await serviceSupabase
        .from("integrations")
        .select("id")
        .eq("business_id", auth.businessId)
        .eq("type", type)
        .eq("identifier", identifier)
        .maybeSingle();

      if (existing) {
        await serviceSupabase
          .from("integrations")
          .update({ access_token: `token_${code}`, refresh_token: `refresh_${code}` })
          .eq("id", existing.id);
      } else {
        await serviceSupabase
          .from("integrations")
          .insert({
            business_id: auth.businessId,
            type,
            name: identifier,
            identifier,
            access_token: `token_${code}`,
            refresh_token: `refresh_${code}`,
          });
      }

      return htmlResponse(oauthSuccessHtml);
    }

    // --- GET /products ---
    if (routed.route === "products" && req.method === "GET") {
      const auth = await authenticate(req, supabase);
      if (!auth) return errorResponse("Unauthorized", 401);

      // In a real implementation, fetch from connected integrations
      // For now, return an empty list
      return jsonResponse({ products: [] });
    }

    // --- POST /broadcast ---
    if (routed.route === "broadcast" && req.method === "POST") {
      const auth = await authenticate(req, supabase);
      if (!auth) return errorResponse("Unauthorized", 401);

      const body = await req.json();
      const { messages } = body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return errorResponse("Missing or invalid messages array", 400);
      }

      let sent = 0;
      let failed = 0;

      for (const msg of messages) {
        if (!msg.phone || !msg.message) {
          failed++;
          continue;
        }

        // In a real implementation, send via WhatsApp API
        // For now, just count as sent
        sent++;
      }

      return jsonResponse({ sent, failed });
    }

    // --- Root ---
    if (routed.route === "root") {
      return jsonResponse({
        name: "AI Sales Agent API",
        version: "1.0.0",
        endpoints: [
          "GET /connection",
          "GET /integrations",
          "POST /integrations",
          "DELETE /integrations",
          "GET /integrations/:type/:identifier/redirect",
          "GET /products",
          "POST /broadcast",
        ],
      });
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    return errorResponse(err.message || "Internal server error", 500);
  }
});
