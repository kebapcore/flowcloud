import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TestInterface from "@/pages/test-interface";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* 
        Implementation Note:
        Main route "/" and all others default to 404 as per requirements.
        Only /test is accessible.
      */}
      <Route path="/test" component={TestInterface} />
      
      {/* 
        Native 404 behavior:
        We let the server handle non-matching routes by not providing a catch-all here.
      */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
