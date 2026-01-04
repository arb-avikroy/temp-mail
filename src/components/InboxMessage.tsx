import { Mail, Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: Date;
  read: boolean;
}

interface InboxMessageProps {
  message: Message;
  onClick: (message: Message) => void;
}

const InboxMessage = ({ message, onClick }: InboxMessageProps) => {
  return (
    <button
      onClick={() => onClick(message)}
      className={`w-full text-left p-4 md:p-5 glass-card glow-border transition-all duration-300 hover:bg-card/70 hover:scale-[1.01] group animate-fade-in ${
        !message.read ? 'border-l-2 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg shrink-0 ${
          message.read ? 'bg-muted' : 'bg-primary/10'
        }`}>
          <Mail className={`w-5 h-5 ${
            message.read ? 'text-muted-foreground' : 'text-primary'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className={`font-medium truncate ${
              message.read ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {message.from}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(message.date, { addSuffix: true })}
            </div>
          </div>
          
          <h3 className={`text-sm mb-1 truncate ${
            message.read ? 'text-muted-foreground' : 'text-foreground font-medium'
          }`}>
            {message.subject}
          </h3>
          
          <p className="text-sm text-muted-foreground truncate">
            {message.preview}
          </p>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

export default InboxMessage;
