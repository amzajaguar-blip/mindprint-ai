import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import MirrorMoment from "./pages/MirrorMoment";
import MindPrintCard from "./pages/MindPrintCard";
import Dashboard from "./pages/Dashboard";
import Processing from "./pages/Processing";
import PublicCard from "./pages/PublicCard";
import Plan from "./pages/Plan";
import Privacy from "./pages/Privacy";
import Termini from "./pages/Termini";
import Cookie from "./pages/Cookie";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/mirror-moment" component={MirrorMoment} />
      <Route path="/processing" component={Processing} />
      <Route path="/mindprint-card" component={MindPrintCard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/plan" component={Plan} />
      <Route path="/card/:shareToken" component={PublicCard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/termini" component={Termini} />
      <Route path="/cookie" component={Cookie} />
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
