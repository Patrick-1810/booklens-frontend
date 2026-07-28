import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { AuthSidePanel } from '../components/auth/AuthSidePanel';
import { Input } from '../components/ui/Input';
import { api } from '../services/api'; 

export function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    const payload = {
      nome: formData.fullName,
      email: formData.email,
      senha: formData.password,
    };

    try {
      setLoading(true);
      await api.post('/auth/register', payload);
      navigate('/login');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage('Ocorreu um erro ao tentar cadastrar. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex selection:bg-brand-500 selection:text-white">
      <AuthSidePanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Criar conta</h2>
            <p className="text-sm text-slate-400 mt-1">
              Cadastre-se para digitalizar e organizar documentos públicos.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="fullName"
              label="Nome completo"
              type="text"
              placeholder="Maria Silva"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={loading}
              required
            />

            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.gov.br"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="password"
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
              />

              <Input
                id="confirmPassword"
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                disabled={loading}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
                required
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-normal">
                Li e aceito os{' '}
                <a href="/termos" className="text-brand-400 hover:underline">
                  termos de uso
                </a>{' '}
                e a política de privacidade do acervo público.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium py-3 rounded-full transition-all shadow-sm text-sm mt-2 flex items-center justify-center"
            >
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Já possui conta?{' '}
            <a href="/login" className="text-brand-400 hover:underline font-medium">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}