import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MirrorMoment from "./pages/MirrorMoment";
import MindPrintCard from "./pages/MindPrintCard";
import Dashboard from "./pages/Dashboard";
import Processing from "./pages/Processing";
import PublicCard from "./pages/PublicCard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mirror-moment" component={MirrorMoment} />
      <Route path="/processing" component={Processing} />
      <Route path="/mindprint-card" component={MindPrintCard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/card/:shareToken" component={PublicCard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
