import { cn } from "@/lib/utils";
import { FileMetadata } from "@shared/schema";
import { Terminal, FileCode, CheckCircle, ExternalLink, Lock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResponseViewerProps {
  data: FileMetadata | null;
  error: Error | null;
  isLoading: boolean;
}

export function ResponseViewer({ data, error, isLoading }: ResponseViewerProps) {
  if (isLoading) {
    return (
      <div className="mt-8 p-6 border border-border bg-black/40 font-mono text-sm animate-pulse">
        <div className="flex items-center gap-2 text-primary mb-4">
          <LoaderSpinner />
          <span className="tracking-widest uppercase">Initializing handshake...</span>
        </div>
        <div className="space-y-2 opacity-50">
          <div className="h-4 w-3/4 bg-primary/20 rounded" />
          <div className="h-4 w-1/2 bg-primary/20 rounded" />
          <div className="h-4 w-2/3 bg-primary/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-8 p-6 border border-destructive/50 bg-destructive/5 text-destructive font-mono relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle size={100} />
          </div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2 uppercase tracking-widest">
            <AlertTriangle className="h-5 w-5" /> Access Denied / Error
          </h3>
          <p className="text-destructive/80 font-medium">
            {error.message}
          </p>
          <div className="mt-4 text-xs opacity-60">
            ERROR_CODE: 0x{Math.floor(Math.random() * 100000).toString(16).toUpperCase()}
          </div>
        </motion.div>
      )}

      {data && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-8 border border-primary/30 bg-black/60 backdrop-blur-sm relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
              <CheckCircle className="h-4 w-4" />
              Access Granted
            </div>
            <div className="text-[10px] text-primary/50">
              ID: {data.id.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Filename</div>
                <div className="text-lg text-foreground font-medium flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  {data.name}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Size</div>
                <div className="text-lg text-foreground font-medium">{data.size}</div>
              </div>

              <div className="space-y-1 col-span-1 md:col-span-2">
                <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Access Key Hash</div>
                <div className="font-mono text-xs text-primary/80 bg-primary/10 p-2 border border-primary/20 break-all flex items-center gap-2">
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  {data.accessKey}
                </div>
              </div>
            </div>

            {/* Raw JSON View */}
            <div className="space-y-2 pt-4 border-t border-dashed border-border">
              <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Raw Response Payload</div>
              <pre className="text-xs text-green-400/80 bg-black p-4 rounded border border-border overflow-x-auto custom-scrollbar">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            {/* Action */}
            <div className="pt-2">
              <a
                href={`/files${data.path}?key=${data.accessKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-white transition-colors group"
              >
                <span className="border-b border-primary/50 group-hover:border-white pb-0.5">Open Preview Stream</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex gap-1">
      <div className="w-1 h-1 bg-primary animate-[bounce_1s_infinite_0ms]" />
      <div className="w-1 h-1 bg-primary animate-[bounce_1s_infinite_200ms]" />
      <div className="w-1 h-1 bg-primary animate-[bounce_1s_infinite_400ms]" />
    </div>
  );
}
