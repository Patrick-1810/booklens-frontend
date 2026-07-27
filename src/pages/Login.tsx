import { useState } from 'react';
import { AuthSidePanel } from '../components/auth/AuthSidePanel';
import { Input } from '../components/ui/Input';

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex selection:bg-brand-500 selection:text-white">
      <AuthSidePanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Entrar</h2>
            <p className="text-sm text-slate-400 mt-1">
              Informe seu e-mail e senha para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.gov.br"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              id="password"
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              rightLabelAction={
                <a href="/esqueci-senha" className="text-xs text-brand-400 hover:underline">
                  Esqueceu a senha?
                </a>
              }
              required
            />

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-400 select-none cursor-pointer">
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-full transition-all shadow-sm text-sm mt-2"
            >
              Entrar
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Não tem conta?{' '}
            <a href="/register" className="text-brand-400 hover:underline font-medium">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}