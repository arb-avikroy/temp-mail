import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  const data = await response.json();
  console.log("Domains response:", data);
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
    throw new Error("No domains available");
  }
  
  const domain = domains[0];
  const username = generateRandomString(10);
  const address = `${username}@${domain}`;
  const password = generateRandomString(16);
  
  console.log("Creating account with address:", address);
  
  // Create account
  const createResponse = await fetch(`${MAIL_TM_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error("Failed to create account:", error);
    throw new Error(`Failed to create account: ${error}`);
  }
  
  const account = await createResponse.json();
  console.log("Account created:", account.id);
  
  // Get token
  const tokenResponse = await fetch(`${MAIL_TM_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error("Failed to get token:", error);
    throw new Error(`Failed to get token: ${error}`);
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
    const error = await response.text();
    console.error("Failed to fetch messages:", error);
    throw new Error(`Failed to fetch messages: ${error}`);
  }
  
  const data = await response.json();
  console.log("Messages fetched:", data["hydra:member"]?.length || 0);
  return data["hydra:member"] || [];
}

// Get a single message with full content
async function getMessage(token: string, messageId: string): Promise<MailTmMessage> {
  console.log("Fetching message:", messageId);
  const response = await fetch(`${MAIL_TM_API}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch message:", error);
    throw new Error(`Failed to fetch message: ${error}`);
  }
  
  return await response.json();
}

// Mark message as read
async function markAsRead(token: string, messageId: string): Promise<void> {
  console.log("Marking message as read:", messageId);
  await fetch(`${MAIL_TM_API}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify({ seen: true }),
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, messageId } = await req.json();
    console.log("Received action:", action);

    let result;

    switch (action) {
      case "create":
        result = await createAccount();
        break;
      case "getMessages":
        if (!token) throw new Error("Token is required");
        result = await getMessages(token);
        break;
      case "getMessage":
        if (!token || !messageId) throw new Error("Token and messageId are required");
        result = await getMessage(token, messageId);
        break;
      case "markAsRead":
        if (!token || !messageId) throw new Error("Token and messageId are required");
        await markAsRead(token, messageId);
        result = { success: true };
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in temp-mail function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
