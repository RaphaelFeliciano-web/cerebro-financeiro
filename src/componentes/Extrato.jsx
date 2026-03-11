import React from 'react';
import { 
  Trash2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Utensils, 
  DollarSign,
  FileText,
  Pizza,
  Home,
  ShoppingCart
} from 'lucide-react';

// Mapeamento de categorias para ícones e cores
const getCategoriaInfo = (cat, valor) => {
  const catNorm = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const info = {
    'investimento': { icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    'salario': { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    'alimentacao': { icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    'lazer': { icon: Pizza, color: 'text-pink-500', bg: 'bg-pink-50' },
    'moradia': { icon: Home, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    'compras': { icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-50' },
    'cartao': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
    'credito': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
    'fatura': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
    'pagamento': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
  };

  // Busca por palavras-chave
  for (const key in info) {
    if (catNorm.includes(key)) {
      return info[key];
    }
  }

  // Ícones padrão baseados no valor
  return valor < 0 
    ? { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-50' } 
    : { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-50' };
};

function Extrato({ transacoes, removerTransacao }) {
  // 1. Estado de "Nenhuma Transação"
  if (!transacoes || transacoes.length === 0) {
    return (
      <div className="flex-1 bg-transparent p-6 md:p-10 flex flex-col items-center justify-center text-center">
        <FileText size={48} className="text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-500">Nenhuma transação registrada</h3>
        <p className="text-sm text-slate-400 mt-2">Use o Dashboard para adicionar suas receitas e despesas.</p>
      </div>
    );
  }

  // 2. Agrupamento de transações por data
  const agruparTransacoesPorData = (transacoes) => {
    return transacoes.reduce((acc, t) => {
      const [dia, mes, ano] = t.data.split('/');
      const dataKey = `${ano}-${mes}-${dia}`; // Chave YYYY-MM-DD para ordenação
      if (!acc[dataKey]) {
        acc[dataKey] = [];
      }
      acc[dataKey].push(t);
      return acc;
    }, {});
  };

  // 3. Formatação do cabeçalho da data
  const formatarDataCabecalho = (dataString) => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const dataTransacao = new Date(dataString);
    dataTransacao.setMinutes(dataTransacao.getMinutes() + dataTransacao.getTimezoneOffset());

    if (dataTransacao.toDateString() === hoje.toDateString()) return 'Hoje';
    if (dataTransacao.toDateString() === ontem.toDateString()) return 'Ontem';
    
    return dataTransacao.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    });
  };

  const transacoesAgrupadas = agruparTransacoesPorData(transacoes);
  const datasOrdenadas = Object.keys(transacoesAgrupadas).sort((a, b) => new Date(b) - new Date(a));

  // 4. Renderização
  return (
    <div className="flex-1 bg-transparent p-6 md:p-8 overflow-y-auto">
      <h2 className="text-2xl font-black italic mb-8">Extrato Inteligente</h2>
      <div className="space-y-8">
        {datasOrdenadas.map(data => {
          const transacoesDoDia = transacoesAgrupadas[data];
          return (
            <div key={data}>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-3 mb-3 border-b border-slate-100">
                {formatarDataCabecalho(data)}
              </h3>
              <ul className="divide-y divide-slate-100">
                {transacoesDoDia.map(t => {
                  const { icon: Icone, color, bg } = getCategoriaInfo(t.cat, t.valor);
                  return (
                    <li key={t.id} className="flex items-center justify-between py-4 group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <Icone size={20} className={color} />
                        </div>
                        <div>
                          <p className="font-bold text-[#112A46] text-sm">{t.desc}</p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-1">{t.cat}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`text-base font-black text-right ${t.valor < 0 ? 'text-slate-700' : 'text-emerald-500'}`}>
                          {t.valor < 0 ? '-' : '+'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <button 
                          onClick={() => removerTransacao(t.id)} 
                          className="p-2 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Extrato;