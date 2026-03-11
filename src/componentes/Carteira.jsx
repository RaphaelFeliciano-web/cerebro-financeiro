import React, { useState } from 'react';
import { 
  TrendingUp, PieChart, Eye, EyeOff, 
  Target, Activity, Globe 
} from 'lucide-react';

// Lista de exceções para Units (Ações) que terminam com "11"
const AcoesUnitsConhecidas = ['TAEE11', 'SANB11', 'KLBN11'];

// Componente para o card individual de cada ativo
function TabelaAtivos({ titulo, icone: Icone, cor, ativos, mostrarValores }) {
  if (!ativos || ativos.length === 0) return null;

  const subtotal = ativos.reduce((acc, curr) => acc + (curr.qtd * curr.precoMedio), 0);

  return (
    <div>
      <h3 className={`text-base font-bold ${cor} mb-4 flex items-center gap-2 uppercase tracking-tighter`}>
        <Icone size={18} />
        {titulo}
      </h3>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80">
            <tr className="text-xs font-bold text-slate-500 uppercase">
              <th className="px-6 py-3 text-left">Ativo</th>
              <th className="px-6 py-3 text-right">Quantidade</th>
              <th className="px-6 py-3 text-right">Preço Médio</th>
              <th className="px-6 py-3 text-right">Posição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ativos.map(ativo => {
              const totalAtivo = ativo.qtd * ativo.precoMedio;
              return (
                <tr key={ativo.ticker} className="group hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
                        {ativo.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 group-hover:text-[#3A86FF]">{ativo.ticker}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Nome da Empresa SA</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">{ativo.qtd}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">
                    {mostrarValores ? `R$ ${ativo.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••'}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-800">
                    {mostrarValores ? `R$ ${totalAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50/80">
            <tr>
              <td colSpan="3" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Subtotal</td>
              <td className="px-6 py-3 text-right font-black text-slate-800">
                {mostrarValores ? `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}



function Carteira({ minhaCarteira, totalInvestido, saldo }) {
  const [mostrarTudo, setMostrarTudo] = useState(true);
  const patrimonioTotal = saldo + totalInvestido;

  const getAtivosPorCategoria = (categoria) => {
    return minhaCarteira.filter(a => {
      const ticker = a.ticker.toUpperCase();
      const isUnitAcao = AcoesUnitsConhecidas.includes(ticker);

      if (categoria === 'FII') {
        return !isUnitAcao && ticker.endsWith('11');
      }
      if (categoria === 'RENDA FIXA') return !!ticker.match(/CDB|TESOURO|LCI|LCA/);
      // Ação: ou é uma Unit conhecida, ou não termina com 11 (e não é RF)
      return isUnitAcao || (!ticker.endsWith('11') && !ticker.match(/CDB|TESOURO|LCI|LCA/));
    });
  };

  const acoes = getAtivosPorCategoria('AÇÃO');
  const fiis = getAtivosPorCategoria('FII');
  const rendaFixa = getAtivosPorCategoria('RENDA FIXA');

  // Cálculo para o Gráfico de Pizza (CSS Conic Gradient)
  const categoriesData = [
    { id: 'AÇÃO', color: '#10b981', label: 'Ações' },
    { id: 'FII', color: '#3b82f6', label: 'Fundos Imob.' },
    { id: 'RENDA FIXA', color: '#a855f7', label: 'Renda Fixa' }
  ];

  let currentAngle = 0;
  const gradientString = categoriesData.map(cat => {
    const ativos = getAtivosPorCategoria(cat.id);
    const total = ativos.reduce((acc, curr) => acc + (curr.qtd * curr.precoMedio), 0);
    const percent = patrimonioTotal > 0 ? (total / patrimonioTotal) * 100 : 0;
    const start = currentAngle;
    currentAngle += percent;
    return `${cat.color} ${start}% ${currentAngle}%`;
  }).join(', ');

  return (
    <div className="flex-1 bg-transparent p-4 md:p-6 font-sans text-slate-900 overflow-y-auto">
      
      {/* 1. TOP BAR */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#112A46] rounded-lg flex items-center justify-center text-white shadow-lg">
            <Globe size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#112A46]">Terminal de Investimentos</h2>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">Sincronizado com B3 • Tempo Real</p>
          </div>
        </div>

        <button 
          onClick={() => setMostrarTudo(!mostrarTudo)}
          className="flex items-center gap-2 bg-white border border-slate-200 text-[#112A46] px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:border-[#3A86FF] transition-all shadow-sm active:scale-95"
        >
          {mostrarTudo ? <EyeOff size={14} /> : <Eye size={14} />}
          {mostrarTudo ? "Ocultar Patrimônio" : "Exibir Patrimônio"}
        </button>
      </div>

      {/* 2. DASHBOARD DE ALTA PERFORMANCE (CORRIGIDO) */}
      {mostrarTudo && (
        <div className="flex flex-col gap-6 mb-8">
          
          {/* Main Display: Net Worth - Ajustado min-h e opacidade */}
          <div className="bg-[#112A46] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-xl">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1 block">Equity Value</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light opacity-40 italic">R$</span>
                <h1 className="text-5xl font-black italic tracking-tighter">
                  {mostrarTudo ? patrimonioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "••••••"}
                </h1>
              </div>
            </div>

            <div className="relative z-10 flex gap-8 mt-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5 tracking-wider">Liquidez Diária</p>
                <p className="text-lg font-black">R$ {mostrarTudo ? saldo.toLocaleString('pt-BR') : "•••"}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5 tracking-wider">Capital Alocado</p>
                <p className="text-lg font-black text-blue-400">R$ {mostrarTudo ? totalInvestido.toLocaleString('pt-BR') : "•••"}</p>
              </div>
            </div>
          </div>

          {/* Side Card: Allocation Target */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <Target className="text-[#3A86FF]" size={24} />
                <div className="text-right">
                  <span className="block text-[9px] font-black text-slate-400 uppercase">Alocação</span>
                  <span className="text-xl font-black text-[#112A46]">{categoriesData.length} Classes</span>
                </div>
              </div>
              
              {/* Gráfico de Rosca (CSS Puro) */}
              <div className="flex justify-center my-6 relative">
                <div 
                  className="w-32 h-32 rounded-full transition-all duration-1000"
                  style={{
                    background: patrimonioTotal > 0 ? `conic-gradient(${gradientString})` : '#f1f5f9'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                    <span className="text-lg font-black text-[#112A46]">{minhaCarteira.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {categoriesData.map(cat => {
                  const ativos = getAtivosPorCategoria(cat.id);
                  const totalCat = ativos.reduce((acc, curr) => acc + (curr.qtd * curr.precoMedio), 0);
                  const percent = patrimonioTotal > 0 ? (totalCat / patrimonioTotal) * 100 : 0;
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{cat.label}</span>
                      </div>
                      <span className="text-xs font-black text-[#112A46]">{percent.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button className="w-full mt-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#112A46] hover:text-white transition-all">
              Relatório de Performance
            </button>
          </div>
        </div>
      )}

      {/* 3. LISTAGEM DE ATIVOS */}
      <div className="space-y-10">
        <TabelaAtivos 
          titulo="Ações"
          icone={TrendingUp}
          cor="text-emerald-500"
          ativos={acoes}
          mostrarValores={mostrarTudo}
        />
        <TabelaAtivos 
          titulo="Fundos Imobiliários"
          icone={PieChart}
          cor="text-blue-500"
          ativos={fiis}
          mostrarValores={mostrarTudo}
        />
        <TabelaAtivos 
          titulo="Renda Fixa"
          icone={Activity}
          cor="text-purple-500"
          ativos={rendaFixa}
          mostrarValores={mostrarTudo}
        />
      </div>
    </div>
  );
}

export default Carteira;