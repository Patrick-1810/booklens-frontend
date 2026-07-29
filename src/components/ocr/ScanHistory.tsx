import { Clock, FileText, CheckCircle2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  date: string;
}

interface ScanHistoryProps {
  items: HistoryItem[];
}

export function ScanHistory({ items }: ScanHistoryProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Clock className="w-4 h-4" />
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Processamentos Recentes
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-dark-850 hover:bg-dark-800/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all cursor-pointer flex items-start gap-3 group"
          >
            <div className="p-2.5 bg-dark-800 group-hover:bg-brand-500/10 text-slate-400 group-hover:text-brand-400 rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Concluído
                </span>
                <span className="text-[11px] text-slate-500">• {item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}