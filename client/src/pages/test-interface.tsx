import { useState } from "react";
import { useFileMetadata } from "@/hooks/use-files";
import { TerminalInput } from "@/components/TerminalInput";
import { TerminalButton } from "@/components/TerminalButton";
import { ResponseViewer } from "@/components/ResponseViewer";
import { Terminal, Shield, Command } from "lucide-react";

export default function TestInterface() {
  const [path, setPath] = useState("");
  const [accessKey, setAccessKey] = useState("");
  
  const { mutate: fetchFile, data, error, isPending } = useFileMetadata();

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!path || !accessKey) return;
    
    fetchFile({ path, accessKey });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-mono relative selection:bg-primary/20">
      <div className="scanline" />
      
      <div className="container max-w-3xl mx-auto px-4 py-12 md:py-24 relative z-10">
        
        {/* Header */}
        <header className="mb-12 border-b border-border pb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-bold tracking-[0.2em] text-foreground uppercase">
                Flowstate Engine
              </h1>
            </div>
            <p className="text-xs text-muted-foreground pl-9">
              SECURE FILE ACCESS GATEWAY
            </p>
          </div>
          <div className="hidden md:block text-[10px] text-muted-foreground/50 text-right">
            <div>STATUS: ONLINE</div>
            <div>LATENCY: 12ms</div>
          </div>
        </header>

        {/* Form */}
        <div className="bg-card/30 rounded-lg border border-border p-1 backdrop-blur-sm">
          <form onSubmit={handleTest} className="bg-black/40 p-6 md:p-8 rounded space-y-8">
            <div className="space-y-6">
              <TerminalInput
                label="Target Resource Path"
                placeholder="e.g. flowscript.txt"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                autoFocus
                icon={<Command className="w-4 h-4" />}
              />
              
              <TerminalInput
                label="System Access Key"
                placeholder="Enter system key (e.g. 444)"
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                icon={<Shield className="w-4 h-4" />}
              />
            </div>

            {data && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                  <div className="text-[10px] text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Preview Authorization Generated
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-sm text-primary font-bold">{data.accessKey}</code>
                    <a 
                      href={`/files${data.path}?key=${data.accessKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-80 transition-opacity uppercase font-bold"
                    >
                      Open Preview
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-border rounded-md">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Command className="w-3 h-3" />
                    Integration Snippet (Fetch)
                  </div>
                  <pre className="text-[10px] text-muted-foreground overflow-x-auto p-2">
{`fetch("/api/files${data.path}", {
  headers: {
    "x-access-key": "${accessKey}"
  }
})`}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <TerminalButton 
                type="submit" 
                isLoading={isPending}
                disabled={!path || !accessKey}
              >
                Execute Request
              </TerminalButton>
            </div>
          </form>
        </div>

        {/* Output */}
        <div className="min-h-[200px]">
          <ResponseViewer 
            data={data || null} 
            error={error as Error | null} 
            isLoading={isPending} 
          />
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-[10px] text-muted-foreground/30 uppercase tracking-widest">
          Flowcloud Systems Inc. © 2026 // RESTRICTED ACCESS
        </footer>
      </div>
    </div>
  );
}
