import { Component, type ErrorInfo, type ReactNode } from "react";
import { isSupabaseAvailable } from "@/lib/supabase";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * SupabaseErrorBoundary
 * Cattura errori relativi a Supabase e mostra un fallback UI
 * invece di far crashare l'intera app.
 */
export default class SupabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    const isSupabaseError =
      error.message?.includes("supabaseUrl") ||
      error.message?.includes("Supabase") ||
      error.message?.includes("supabase") ||
      error.message?.includes("AuthSessionMissingError");

    return {
      hasError: isSupabaseError,
      errorMessage: isSupabaseError
        ? "Servizio di autenticazione temporaneamente non disponibile."
        : error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[SupabaseErrorBoundary]", error.message, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#08080F] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Connessione non disponibile
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {this.state.errorMessage ||
                "Il servizio di autenticazione non è raggiungibile. Riprova più tardi."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #C084FC)" }}
            >
              Riprova
            </button>
          </div>
        </div>
      );
    }

    // Se Supabase non è disponibile ma non c'è un errore attivo, mostra un warning silenzioso
    if (!isSupabaseAvailable() && import.meta.env.DEV) {
      console.warn(
        "[Supabase] Client non inizializzato — env VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY mancanti"
      );
    }

    return this.props.children;
  }
}
