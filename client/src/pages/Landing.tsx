import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Hexagon, Terminal, Play, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const [fileName, setFileName] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proxy/files/${fileName}`, {
        headers: {
          "X-App-Request": "1"
        }
      });

      if (res.ok) {
        const text = await res.text();
        // Try to parse as JSON if it looks like it, otherwise just show text
        try {
          setOutput(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setOutput(text);
        }
      } else {
        const text = await res.text();
        setOutput(`Error: ${res.status} ${text || "Not Found"}`);
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleCode = `fetch("/api/proxy/files/${fileName || "your-file"}", {
  headers: {
    "X-App-Request": "1"
  }
})`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-8">
            <Hexagon className="w-16 h-16 text-primary animate-pulse stroke-[1.5]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white/90">
            flowstate engine is being built here
          </h1>
          <div className="pt-8">
            <Link href="/files">
              <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-medium">
                Enter Cloud
              </Button>
            </Link>
          </div>
        </div>

        {/* API Test Area */}
        <Card className="glass-panel border-white/5 bg-white/[0.02]">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-primary font-medium border-b border-white/5 pb-4">
              <Terminal className="w-5 h-5" />
              <span>API Test Playground</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <FileCode className="w-3 h-3" /> File Name / Path
                  </label>
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. flowscript.txt"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Button
                  onClick={testApi}
                  disabled={isLoading}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl gap-2"
                >
                  <Play className="w-4 h-4" /> Run Request
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest">Example Code</label>
                  <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] text-primary/80 overflow-x-auto font-mono">
                    {exampleCode}
                  </pre>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest">Server Output</label>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 min-h-[100px] text-[11px] text-green-400/80 font-mono overflow-auto max-h-[200px]">
                    {output || "// Output will appear here"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

