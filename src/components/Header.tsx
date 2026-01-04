import { Shield, Zap, Clock } from "lucide-react";

const Header = () => {
  return (
    <header className="text-center mb-12 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm text-primary font-medium">Secure & Anonymous</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
        <span className="text-foreground">Temp</span>
        <span className="text-gradient">Mail</span>
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        Instant disposable email addresses. Protect your privacy from spam and unwanted emails.
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span>Instant Creation</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Auto-Refresh</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>No Registration</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
