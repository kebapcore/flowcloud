import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVerifyAuth } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";

interface AccessModalProps {
  onAuthenticated: () => void;
}

export function AccessModal({ onAuthenticated }: AccessModalProps) {
  const [key, setKey] = useState("");
  const verifyAuth = useVerifyAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    verifyAuth.mutate(key, {
      onSuccess: (data) => {
        if (data.success) {
          onAuthenticated();
          toast({
            title: "Access Granted",
            description: "Welcome to Flowstate Cloud.",
          });
        }
      },
      onError: () => {
        toast({
          title: "Access Denied",
          description: "Invalid access key provided.",
          variant: "destructive"
        });
        setKey("");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-wide text-white">Secure Access</h2>
            <p className="text-sm text-white/50">Please enter your access key to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Input
              type="password"
              placeholder="Enter Access Key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="h-12 text-center text-lg bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
              autoFocus
            />
            
            <Button 
              type="submit" 
              disabled={verifyAuth.isPending || !key}
              className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {verifyAuth.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Unlock Cloud <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
