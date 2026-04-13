import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DiaryPage from "@/pages/DiaryPage";
import RecipesPage from "@/pages/RecipesPage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";
import { BookOpen, ChartBar, Book, User } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10000,
    },
  },
});

function BottomNav() {
  const [location, navigate] = useLocation();

  const tabs = [
    { path: "/", label: "Diario", icon: BookOpen },
    { path: "/receitas", label: "Receitas", icon: Book },
    { path: "/progresso", label: "Progresso", icon: ChartBar },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50 shadow-lg max-w-[430px] mx-auto">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-violet-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
            {active && <div className="absolute bottom-0 w-8 h-0.5 bg-violet-600 rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-[430px] mx-auto pb-20 min-h-screen">
        {children}
      </div>
      <div className="max-w-[430px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DiaryPage} />
        <Route path="/receitas" component={RecipesPage} />
        <Route path="/progresso" component={ProgressPage} />
        <Route path="/perfil" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
