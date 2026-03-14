import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ChatInterface from "./pages/ChatInterface";
import LandingPagePublic from "./pages/LandingPagePublic";
import ReportPublic from "./pages/ReportPublic";
import FormPublic from "./pages/FormPublic";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/p/:slug"} component={LandingPagePublic} />
      <Route path={"/report/:token"} component={ReportPublic} />
      <Route path={"/form/:slug"} component={FormPublic} />
      <Route path={"/aria"} component={ChatInterface} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
