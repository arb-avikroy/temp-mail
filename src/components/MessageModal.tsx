import { X, Clock, User, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "./InboxMessage";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";

interface MessageModalProps {
  message: Message | null;
  onClose: () => void;
  getMessageContent?: (messageId: string) => Promise<string>;
}

const MessageModal = ({ message, onClose, getMessageContent }: MessageModalProps) => {
  const [content, setContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (message && getMessageContent) {
      setIsLoadingContent(true);
      setContent("");
      getMessageContent(message.id)
        .then((fullContent) => {
          setContent(fullContent);
        })
        .finally(() => {
          setIsLoadingContent(false);
        });
    }
  }, [message, getMessageContent]);

  if (!message) return null;

  const displayContent = content || message.preview;
  const isHtml = content.includes("<") && content.includes(">");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl max-h-[80vh] glass-card glow-border p-6 md:p-8 overflow-hidden animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground pr-8 line-clamp-2">
            {message.subject}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-3 mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">From:</span>
            <span className="text-foreground font-medium">{message.from}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="text-foreground">
              {format(message.date, 'PPpp')} ({formatDistanceToNow(message.date, { addSuffix: true })})
            </span>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[40vh]">
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading message...</span>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
              <div className="prose prose-invert prose-sm max-w-none">
                {isHtml ? (
                  <div 
                    className="text-foreground"
                    dangerouslySetInnerHTML={{ __html: displayContent }} 
                  />
                ) : (
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {displayContent}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
