import { useState } from "react";
import { Copy, Check, RefreshCw, Mail, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmailDisplayProps {
  email: string;
  onRefresh: () => void;
  onNewEmail: () => void;
  isLoading: boolean;
  autoRefreshSeconds: number;
  expirationSeconds: number | null;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const EmailDisplay = ({ 
  email, 
  onRefresh, 
  onNewEmail, 
  isLoading,
  autoRefreshSeconds,
  expirationSeconds 
}: EmailDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy email");
    }
  };

  return (
    <div className="glass-card glow-border p-6 md:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-md bg-primary/10 border border-primary/20">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-serif font-medium text-foreground">Your Temporary Email</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-3 border border-border/50">
          <span className="font-mono text-sm md:text-base text-foreground truncate flex-1">
            {email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="shrink-0 hover:bg-primary/10 hover:text-primary"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sm:hidden md:inline">Refresh</span>
          </Button>
          
          <Button
            variant="glow"
            onClick={onNewEmail}
            className="flex-1 sm:flex-none"
          >
            New Email
          </Button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Auto-refresh in {autoRefreshSeconds}s</span>
          {expirationSeconds !== null && (
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              Expires in {formatTime(expirationSeconds)}
            </span>
          )}
        </div>
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${expirationSeconds !== null && expirationSeconds < 300 ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
          {expirationSeconds !== null && expirationSeconds < 300 ? 'Expiring soon' : 'Active'}
        </span>
      </div>
    </div>
  );
};

export default EmailDisplay;
