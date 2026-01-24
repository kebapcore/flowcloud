import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Hexagon, Search, Settings, LogOut } from "lucide-react";
import { useFiles } from "@/hooks/use-files";
import { FileGrid } from "@/components/FileGrid";
import { CreateDialog } from "@/components/CreateDialog";
import { AccessModal } from "@/components/AccessModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: files = [], isLoading, refetch } = useFiles(null);
  
  // Check session storage on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("flowstate_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      refetch();
    }
  }, [refetch]);

  const handleAuthenticated = () => {
    sessionStorage.setItem("flowstate_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("flowstate_auth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AccessModal onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <Hexagon className="w-6 h-6 text-primary stroke-[2] group-hover:rotate-90 transition-transform duration-500" />
              <span className="font-semibold text-lg tracking-tight text-white/90">Flowstate Cloud</span>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search files..." 
                className="pl-10 bg-white/5 border-transparent text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary/20 rounded-full transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
            
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5 rounded-full" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-white/90">My Cloud</h2>
            <div className="text-sm text-white/40">
              {files.length} items
            </div>
          </div>

          <FileGrid files={files} isLoading={isLoading} />
        </motion.div>
      </main>
    </div>
  );
}
