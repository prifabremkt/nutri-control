import { useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLogin: (token: string, name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao fazer login");
        return;
      }
      onLogin(data.token, data.name);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-4 backdrop-blur-sm">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              <circle cx="24" cy="24" r="22" fill="white" fillOpacity="0.2"/>
              <path d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8z" fill="white" fillOpacity="0.3"/>
              <path d="M16 24c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8z" fill="white"/>
              <path d="M24 18v6l4 2" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 32c1.2.65 2.56 1 4 1s2.8-.35 4-1" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">My Nutri Control</h1>
          <p className="text-violet-200 mt-1 text-sm">Controle nutricional inteligente</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Entrar na sua conta</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-violet-200 text-xs mt-6">
          My Nutri Control &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
