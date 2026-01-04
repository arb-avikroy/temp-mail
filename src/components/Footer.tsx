import { Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 pb-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="glass-card glow-border inline-flex items-center gap-6 px-6 py-4">
        <a 
          href="#" 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          About
        </a>
        <a 
          href="#" 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Privacy Policy
        </a>
        <a 
          href="#" 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Terms of Service
        </a>
      </div>
      
      <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-1">
        Made with <Heart className="w-4 h-4 text-destructive" /> for your privacy
      </p>
    </footer>
  );
};

export default Footer;
