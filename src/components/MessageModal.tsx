import { X, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "./InboxMessage";
import { formatDistanceToNow, format } from "date-fns";

interface MessageModalProps {
  message: Message | null;
  onClose: () => void;
}

const MessageModal = ({ message, onClose }: MessageModalProps) => {
  if (!message) return null;

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
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {message.preview}
                {"\n\n"}
                This is a demo message for the temporary email service. In a production environment, this would display the full email content including HTML formatting, attachments, and embedded images.
                {"\n\n"}
                Thank you for using TempMail!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
