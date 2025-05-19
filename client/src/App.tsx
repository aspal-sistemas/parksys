import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Parks from "@/pages/parks";
import ParkDetail from "@/pages/park-detail";
import Activities from "@/pages/activities";
import AdminDashboard from "@/pages/admin";
import AdminParks from "@/pages/admin/parks";
import AdminParkEdit from "@/pages/admin/park-edit";
import AdminParksImport from "@/pages/admin/parks-import";
import AdminActivities from "@/pages/admin/activities";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminDocuments from "@/pages/admin/documents";
import AdminComments from "@/pages/admin/comments";
import AdminIncidents from "@/pages/admin/incidents";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin/login";
import Header from "@/components/Header";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/parks" component={Parks} />
        <Route path="/parks/:id" component={ParkDetail} />
        <Route path="/activities" component={Activities} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/parks" component={AdminParks} />
        <Route path="/admin/parks-import" component={AdminParksImport} />
        <Route path="/admin/parks/new" component={AdminParkEdit} />
        <Route path="/admin/parks/:id" component={AdminParkEdit} />
        <Route path="/admin/activities" component={AdminActivities} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/documents" component={AdminDocuments} />
        <Route path="/admin/comments" component={AdminComments} />
        <Route path="/admin/incidents" component={AdminIncidents} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
