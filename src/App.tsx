import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Players from "./pages/Players";
import Bracket from "./pages/Bracket";
import Schedule from "./pages/Schedule";
import Organizers from "./pages/Organizers";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/players/:playerId" element={<Players />} />
              <Route path="/players" element={<Players />} />
              <Route path="/bracket" element={<Bracket />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/organizers" element={<Organizers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
