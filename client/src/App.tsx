import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ARIA from "./pages/ARIA";
import LandingPagePublic from "./pages/LandingPagePublic";
import ReportPublic from "./pages/ReportPublic";
import FormPublic from "./pages/FormPublic";
import Campaigns from "./pages/Campaigns";
import Content from "./pages/Content";
import Email from "./pages/Email";
import LandingPages from "./pages/LandingPages";
import Analytics from "./pages/Analytics";
import CRM from "./pages/CRM";
import Brand from "./pages/Brand";
import Scheduler from "./pages/Scheduler";
import DSP from "./pages/DSP";
import SEO from "./pages/SEO";
import Competitors from "./pages/Competitors";
import Reviews from "./pages/Reviews";
import Reports from "./pages/Reports";
import ABTests from "./pages/ABTests";
import Funnels from "./pages/Funnels";
import Automations from "./pages/Automations";
import Video from "./pages/Video";
import Creatives from "./pages/Creatives";
import Templates from "./pages/Templates";
import Products from "./pages/Products";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/p/:slug"} component={LandingPagePublic} />
      <Route path={"/report/:token"} component={ReportPublic} />
      <Route path={"/form/:slug"} component={FormPublic} />
      <Route path={"/campaigns"} component={Campaigns} />
      <Route path={"/content"} component={Content} />
      <Route path={"/email"} component={Email} />
      <Route path={"/landing-pages"} component={LandingPages} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/crm"} component={CRM} />
      <Route path={"/brand"} component={Brand} />
      <Route path={"/scheduler"} component={Scheduler} />
      <Route path={"/dsp"} component={DSP} />
      <Route path={"/seo"} component={SEO} />
      <Route path={"/competitors"} component={Competitors} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/ab-tests"} component={ABTests} />
      <Route path={"/funnels"} component={Funnels} />
      <Route path={"/automations"} component={Automations} />
      <Route path={"/video"} component={Video} />
      <Route path={"/creatives"} component={Creatives} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/products"} component={Products} />
      <Route path={"/team"} component={Team} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/billing"} component={Billing} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/aria"} component={ARIA} />
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
