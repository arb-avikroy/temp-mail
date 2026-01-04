import { Shield, Zap, Clock } from "lucide-react";

const Header = () => {
  return (
    <header className="text-center mb-12 animate-fade-in">
      <p className="text-primary/80 font-serif italic text-lg mb-4 tracking-wide">
        your privacy matters...
      </p>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6 tracking-tight">
        <span className="text-foreground">Temp</span>
        <span className="text-gradient">Mail</span>
      </h1>
      
      <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
        Instant disposable email addresses. Protect your privacy from spam and unwanted emails.
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-primary" />
          <span>Instant</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-primary" />
          <span>Anonymous</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-primary" />
          <span>Secure</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
