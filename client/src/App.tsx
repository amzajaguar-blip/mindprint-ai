import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Critical path — loaded eagerly
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Heavy pages — lazy loaded per route
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const MirrorMoment = lazy(() => import("./pages/MirrorMoment"));
const MindPrintCard = lazy(() => import("./pages/MindPrintCard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Processing = lazy(() => import("./pages/Processing"));
const PublicCard = lazy(() => import("./pages/PublicCard"));
const Plan = lazy(() => import("./pages/Plan"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Termini = lazy(() => import("./pages/Termini"));
const Cookie = lazy(() => import("./pages/Cookie"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
