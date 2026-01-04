import { useState } from "react";
import Header from "@/components/Header";
import EmailDisplay from "@/components/EmailDisplay";
import Inbox from "@/components/Inbox";
import MessageModal from "@/components/MessageModal";
import Footer from "@/components/Footer";
import { useTempMail } from "@/hooks/useTempMail";
import { Message } from "@/components/InboxMessage";
import { Helmet } from "react-helmet";

const Index = () => {
  const {
    email,
    messages,
    isLoading,
    autoRefreshSeconds,
    refreshInbox,
    generateNewEmail,
    markAsRead,
  } = useTempMail();

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleMessageClick = (message: Message) => {
    markAsRead(message.id);
    setSelectedMessage(message);
  };

  return (
    <>
      <Helmet>
        <title>TempMail - Free Disposable Temporary Email</title>
        <meta 
          name="description" 
          content="Create instant disposable email addresses. Protect your privacy from spam and unwanted emails with our free temporary email service." 
        />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 grid-pattern opacity-30" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <main className="relative z-10 container max-w-4xl mx-auto px-4 py-12 md:py-20">
          <Header />
          
          <div className="space-y-6">
            <EmailDisplay
              email={email}
              onRefresh={refreshInbox}
              onNewEmail={generateNewEmail}
              isLoading={isLoading}
              autoRefreshSeconds={autoRefreshSeconds}
            />
            
            <Inbox
              messages={messages}
              onMessageClick={handleMessageClick}
              isLoading={isLoading}
            />
          </div>
          
          <Footer />
        </main>

        <MessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      </div>
    </>
  );
};

export default Index;
