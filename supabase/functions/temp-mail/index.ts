import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS - restrict to your domains
const ALLOWED_ORIGINS = [
  "https://ydxwmklyzkqvkhkkpog.supabase.co",
  "https://ydxwmklyzkqvkfhkkgog.lovableproject.com",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://arb-avikroy.github.io",
  "https://glowing-goggles-qp5rxwv7677f9xxw-8081.app.github.dev"
];

// Generate CORS headers based on request origin
function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com') || origin.endsWith('.lovable.app') || origin.endsWith('.supabase.co') || ||
    origin.endsWith('.github.io') || origin.endsWith('.app.github.dev')
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Input validation schema
const RequestSchema = z.object({
  action: z.enum(["create", "getMessages", "getMessage", "markAsRead"]),
  token: z.string().min(10).max(2000).optional(),
  messageId: z.string().regex(/^[a-zA-Z0-9_\-@/]+$/).max(200).optional(),
});

// User-friendly error messages (don't expose internals)
const USER_ERRORS: Record<string, string> = {
  create: "Failed to create email account. Please try again.",
  getMessages: "Failed to fetch messages. Please try again.",
  getMessage: "Failed to load message content.",
  markAsRead: "Failed to update message status.",
  validation: "Invalid request parameters.",
  unknown: "An error occurred. Please try again.",
};

// Centralized error handler - logs details server-side, returns generic message to client
function handleError(
  error: unknown,
  context: string,
  corsHeaders: Record<string, string>
): Response {
  // Log detailed error server-side for debugging
  console.error(`[${context}] Error details:`, error);
  
  // Return generic message to client
  const userMessage = USER_ERRORS[context] || USER_ERRORS.unknown;
  
  return new Response(
    JSON.stringify({ error: userMessage }),
    { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

const MAIL_TM_API = "https://api.mail.tm";

interface MailTmAccount {
  id: string;
  address: string;
  token: string;
}

interface MailTmMessage {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  text: string;
  html: string[];
  createdAt: string;
  seen: boolean;
}

// Get available domains
async function getDomains(): Promise<string[]> {
  console.log("Fetching available domains...");
  const response = await fetch(`${MAIL_TM_API}/domains`);
  
  if (!response.ok) {
    console.error("Failed to fetch domains:", response.status);
    throw new Error("DOMAIN_FETCH_FAILED");
  }
  
  const data = await response.json();
  console.log("Domains fetched successfully");
  return data["hydra:member"]?.map((d: { domain: string }) => d.domain) || [];
}

// Generate random string for email username
function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Create a new temporary email account
async function createAccount(): Promise<MailTmAccount> {
  const domains = await getDomains();
  if (domains.length === 0) {
    console.error("No domains available from API");
    throw new Error("NO_DOMAINS");
  }
  
  const domain = domains[0];
  const username = generateRandomString(10);
  const address = `${username}@${domain}`;
  const password = generateRandomString(16);
  
  console.log("Creating account...");
  
  // Create account
  const createResponse = await fetch(`${MAIL_TM_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!createResponse.ok) {
    console.error("Account creation failed:", createResponse.status);
    throw new Error("ACCOUNT_CREATE_FAILED");
  }
  
  const account = await createResponse.json();
  console.log("Account created successfully");
  
  // Get token
  const tokenResponse = await fetch(`${MAIL_TM_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!tokenResponse.ok) {
    console.error("Token retrieval failed:", tokenResponse.status);
    throw new Error("TOKEN_FAILED");
  }
  
  const tokenData = await tokenResponse.json();
  console.log("Token obtained successfully");
  
  return {
    id: account.id,
    address: account.address,
    token: tokenData.token,
  };
}

// Get messages for an account
async function getMessages(token: string): Promise<MailTmMessage[]> {
  console.log("Fetching messages...");
  const response = await fetch(`${MAIL_TM_API}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    console.error("Message fetch failed:", response.status);
    throw new Error("MESSAGE_FETCH_FAILED");
  }
  
  const data = await response.json();
  console.log("Messages fetched:", data["hydra:member"]?.length || 0);
  return data["hydra:member"] || [];
}

// Get a single message with full content
async function getMessage(token: string, messageId: string): Promise<MailTmMessage> {
  console.log("Fetching message content...");
  const response = await fetch(`${MAIL_TM_API}/messages/${encodeURIComponent(messageId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    console.error("Message content fetch failed:", response.status);
    throw new Error("MESSAGE_CONTENT_FAILED");
  }
  
  return await response.json();
}

// Mark message as read
async function markAsRead(token: string, messageId: string): Promise<void> {
  console.log("Marking message as read...");
  const response = await fetch(`${MAIL_TM_API}/messages/${encodeURIComponent(messageId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify({ seen: true }),
  });
  
  if (!response.ok) {
    console.error("Mark as read failed:", response.status);
    throw new Error("MARK_READ_FAILED");
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let action = "unknown";
  
  try {
    // Parse and validate request body
    const body = await req.json();
    
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.issues);
      return new Response(
        JSON.stringify({ error: USER_ERRORS.validation }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { action: validatedAction, token, messageId } = validationResult.data;
    action = validatedAction;
    
    console.log("Processing action:", action);

    let result;

    switch (action) {
      case "create":
        result = await createAccount();
        break;
      case "getMessages":
        if (!token) {
          return new Response(
            JSON.stringify({ error: "Token is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await getMessages(token);
        break;
      case "getMessage":
        if (!token || !messageId) {
          return new Response(
            JSON.stringify({ error: "Token and messageId are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await getMessage(token, messageId);
        break;
      case "markAsRead":
        if (!token || !messageId) {
          return new Response(
            JSON.stringify({ error: "Token and messageId are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await markAsRead(token, messageId);
        result = { success: true };
        break;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleError(error, action, corsHeaders);
  }
});
