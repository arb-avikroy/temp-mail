import { useState, useEffect, useCallback } from "react";
import { Message } from "@/components/InboxMessage";

const DOMAINS = ["tempmail.io", "quickmail.dev", "disposable.email", "throwaway.mail"];

const generateRandomString = (length: number) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const generateEmail = () => {
  const username = generateRandomString(10);
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  return `${username}@${domain}`;
};

// Demo messages for demonstration purposes
const demoMessages: Message[] = [
  {
    id: "1",
    from: "noreply@service.com",
    subject: "Welcome to Our Service!",
    preview: "Thank you for signing up. We're excited to have you on board...",
    date: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
  },
  {
    id: "2",
    from: "newsletter@updates.io",
    subject: "Your Weekly Newsletter",
    preview: "Here's what you missed this week. Top stories and trending topics...",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: true,
  },
  {
    id: "3",
    from: "verify@accounts.net",
    subject: "Verify Your Email Address",
    preview: "Please click the link below to verify your email address and complete...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
];

export const useTempMail = () => {
  const [email, setEmail] = useState(() => generateEmail());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(30);

  const refreshInbox = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // For demo purposes, randomly add messages
    if (Math.random() > 0.7 && messages.length < 5) {
      const newMessage: Message = {
        id: Date.now().toString(),
        from: `sender${Math.floor(Math.random() * 100)}@example.com`,
        subject: `New Message #${messages.length + 1}`,
        preview: "This is a new message that just arrived in your inbox...",
        date: new Date(),
        read: false,
      };
      setMessages((prev) => [newMessage, ...prev]);
    }
    
    setIsLoading(false);
    setAutoRefreshSeconds(30);
  }, [messages.length]);

  const generateNewEmail = useCallback(() => {
    setEmail(generateEmail());
    setMessages([]);
    setAutoRefreshSeconds(30);
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  }, []);

  // Auto-refresh countdown
  useEffect(() => {
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
  }, [refreshInbox]);

  // Load demo messages on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(demoMessages);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return {
    email,
    messages,
    isLoading,
    autoRefreshSeconds,
    refreshInbox,
    generateNewEmail,
    markAsRead,
  };
};
