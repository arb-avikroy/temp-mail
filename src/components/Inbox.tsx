import { Inbox as InboxIcon, MailX } from "lucide-react";
import InboxMessage, { Message } from "./InboxMessage";

interface InboxProps {
  messages: Message[];
  onMessageClick: (message: Message) => void;
  isLoading: boolean;
}

const Inbox = ({ messages, onMessageClick, isLoading }: InboxProps) => {
  return (
    <div className="glass-card glow-border p-6 md:p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <InboxIcon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-medium text-foreground">Inbox</h2>
        {messages.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {messages.length}
          </span>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Checking for new messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="p-4 rounded-full bg-muted/50">
            <MailX className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium mb-1">No messages yet</p>
            <p className="text-muted-foreground text-sm">
              Emails sent to your temporary address will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={message.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <InboxMessage message={message} onClick={onMessageClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
