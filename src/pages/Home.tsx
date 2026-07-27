import { Navbar } from '../components/layout/Navbar';
import { FeatureCard } from '../components/FeatureCard';
import { Scan, BookOpen, Search, Zap, ShieldCheck } from 'lucide-react';

export function Home() {
  const features = [
    {
      icon: Scan,
      title: 'OCR Instantâneo',
      description: 'Reconhecimento com prévia da imagem e status de processamento em tempo real.',
    },
    {
      icon: BookOpen,
      title: 'Texto Estruturado',
      description: 'Título detectado e parágrafos formatados prontos para revisão e cópia.',
    },
    {
      icon: Search,
      title: 'Dicionário Integrado',
      description: 'Busca e sugestões inteligentes sobre termos técnicos e administrativos.',
    },
    {
      icon: Zap,
      title: 'Exportação Direta',
      description: 'Copie, exporte em arquivo TXT ou imprima/salve em PDF com um clique.',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-16 pb-16 flex flex-col justify-between w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70 text-slate-300 text-xs font-medium mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Acervo público e transparente</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-6">
            Digitalize documentos públicos e{' '}
            <span className="text-brand-400">
              extraia o texto
            </span>{' '}
            em segundos.
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
            Envie uma imagem, receba título e parágrafos estruturados, pesquise termos com autocompletar e mantenha todo o acervo organized.
          </p>

          {/* Botões CTA Redondos e Sem Seta */}
          <div className="flex flex-wrap items-center gap-3 mb-16">
            <a
              href="/scanner"
              className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-full transition-all shadow-sm"
            >
              <Scan className="w-4 h-4" />
              <span>Digitalizar agora</span>
            </a>
            <a
              href="/documentos"
              className="inline-flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 font-medium px-6 py-3 rounded-full transition-all"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Ver acervo</span>
            </a>
          </div>
        </div>

        {/* Grid de Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </main>
    </div>
  );
}