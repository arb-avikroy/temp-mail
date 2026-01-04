import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/InboxMessage";
import { toast } from "sonner";

interface TempMailAccount {
  id: string;
  address: string;
  token: string;
}

interface ApiMessage {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  text?: string;
  html?: string[];
  createdAt: string;
  seen: boolean;
}

const STORAGE_KEY = "tempmail_account";

export const useTempMail = () => {
  const [account, setAccount] = useState<TempMailAccount | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(30);
  const isCreatingAccount = useRef(false);

  const callApi = async (action: string, token?: string, messageId?: string) => {
    const { data, error } = await supabase.functions.invoke("temp-mail", {
      body: { action, token, messageId },
    });

    if (error) {
      console.error("API error:", error);
      throw new Error(error.message || "API call failed");
    }

    if (data?.error) {
      console.error("API returned error:", data.error);
      throw new Error(data.error);
    }

    return data;
  };

  const createAccount = useCallback(async () => {
    if (isCreatingAccount.current) return;
    isCreatingAccount.current = true;
    
    setIsLoading(true);
    try {
      console.log("Creating new temporary email account...");
      const newAccount = await callApi("create");
      console.log("Account created:", newAccount.address);
      
      setAccount(newAccount);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccount));
      setMessages([]);
      toast.success("New email address created!");
    } catch (error: any) {
      console.error("Failed to create account:", error);
      toast.error("Failed to create email. Please try again.");
    } finally {
      setIsLoading(false);
      isCreatingAccount.current = false;
    }
  }, []);

  const refreshInbox = useCallback(async () => {
    if (!account?.token) return;
    
    setIsLoading(true);
    try {
      console.log("Refreshing inbox...");
      const apiMessages: ApiMessage[] = await callApi("getMessages", account.token);
      
      const formattedMessages: Message[] = apiMessages.map((msg) => ({
        id: msg.id,
        from: msg.from.name ? `${msg.from.name} <${msg.from.address}>` : msg.from.address,
        subject: msg.subject || "(No subject)",
        preview: msg.intro || "",
        date: new Date(msg.createdAt),
        read: msg.seen,
      }));
      
      setMessages(formattedMessages);
      console.log("Inbox refreshed:", formattedMessages.length, "messages");
    } catch (error: any) {
      console.error("Failed to refresh inbox:", error);
      // If token expired, create new account
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        toast.error("Session expired. Creating new email...");
        localStorage.removeItem(STORAGE_KEY);
        setAccount(null);
      }
    } finally {
      setIsLoading(false);
      setAutoRefreshSeconds(30);
    }
  }, [account?.token]);

  const generateNewEmail = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccount(null);
    setMessages([]);
    await createAccount();
  }, [createAccount]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!account?.token) return;
    
    try {
      await callApi("markAsRead", account.token, messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, [account?.token]);

  const getMessageContent = useCallback(async (messageId: string): Promise<string> => {
    if (!account?.token) return "";
    
    try {
      const fullMessage = await callApi("getMessage", account.token, messageId);
      // Return HTML content if available, otherwise text, otherwise intro
      if (fullMessage.html && fullMessage.html.length > 0) {
        return fullMessage.html.join("");
      }
      return fullMessage.text || fullMessage.intro || "";
    } catch (error) {
      console.error("Failed to get message content:", error);
      return "";
    }
  }, [account?.token]);

  // Initialize account on mount
  useEffect(() => {
    if (!account) {
      createAccount();
    }
  }, [account, createAccount]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!account?.token) return;

    const interval = setInterval(() => {
      setAutoRefreshSeconds((prev) => {
        if (prev <= 1) {
          refreshInbox();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [account?.token, refreshInbox]);

  // Initial refresh when account is ready
  useEffect(() => {
    if (account?.token) {
      refreshInbox();
    }
  }, [account?.token, refreshInbox]);

  return {
    email: account?.address || "Loading...",
    messages,
    isLoading,
    autoRefreshSeconds,
    refreshInbox,
    generateNewEmail,
    markAsRead,
    getMessageContent,
  };
};
