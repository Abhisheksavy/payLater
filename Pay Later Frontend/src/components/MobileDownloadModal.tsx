import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileDownloadModalProps {
  children: React.ReactNode;
}

const MobileDownloadModal = ({ children }: MobileDownloadModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to receive the download link.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format (simple validation)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    // Mock sending SMS
    setIsSubmitted(true);
    toast({
      title: "Download link sent!",
      description: `We've sent a download link to ${phoneNumber}`,
    });

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setPhoneNumber("");
      setIsOpen(false);
    }, 3000);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setPhoneNumber("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Download Mobile App
          </DialogTitle>
        </DialogHeader>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a text with a link to download our mobile app
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Send Link
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Mobile App Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Quick bill payments on the go</li>
                <li>• Push notifications for due dates</li>
                <li>• Instant reward point updates</li>
                <li>• Photo bill scanning</li>
                <li>• Biometric login security</li>
              </ul>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Link Sent Successfully!</h3>
              <p className="text-muted-foreground">
                Check your messages for the download link
              </p>
              <p className="text-sm text-muted-foreground">
                Sent to: {phoneNumber}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full">
              Send to Another Number
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileDownloadModal;