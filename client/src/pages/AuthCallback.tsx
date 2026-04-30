import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState("Completamento accesso...");

  useEffect(() => {
    const handle = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setStatus("Errore durante l'accesso. Riprova.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: session.access_token }),
        credentials: "include",
      });

      navigate("/dashboard");
    };

    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#8B5CF6] text-sm">{status}</p>
      </div>
    </div>
  );
}
