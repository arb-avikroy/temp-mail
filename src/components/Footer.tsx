import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 pb-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="inline-flex items-center gap-8 px-6 py-4">
        <a 
          href="#" 
          className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide"
        >
          About
        </a>
        <a 
          href="#" 
          className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide"
        >
          Privacy
        </a>
        <a 
          href="#" 
          className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide"
        >
          Terms
        </a>
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground/70 flex items-center justify-center gap-1.5">
        Made with <Heart className="w-3.5 h-3.5 text-primary/60" /> for your privacy
      </p>
    </footer>
  );
};

export default Footer;
