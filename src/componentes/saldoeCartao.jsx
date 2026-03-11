import React from 'react';
import { Wallet, CreditCard } from 'lucide-react';

export default function SaldoeCartao({ saldo, limiteDisponivel, limiteUtilizado, totalInvestido, porcentagemCredito }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
      {/* CARD CONTA - Lado Esquerdo */}
      <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[150px]">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conta Corrente</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={18} /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <p className="text-xs font-bold text-blue-600 mt-1">Investido: R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* CARD CARTÃO - Lado Direito (Estilo Físico) */}
      <div className="flex-[1.5] bg-[#112A46] p-5 rounded-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[150px] shadow-xl">
        <div className="absolute top-10 left-6 w-12 h-9 bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 rounded-md opacity-90 shadow-lg"></div>
        <div className="flex justify-between items-start relative z-10 ml-16">
          <div>
            <span className="text-[10px] font-bold opacity-50 uppercase">Fatura Atual</span>
            <h3 className="text-2xl font-black text-white">R$ {limiteUtilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
          <CreditCard size={24} className="opacity-30" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-2 text-[11px] font-black uppercase">
            <span className="opacity-50">Limite disponível</span>
            <span className="text-emerald-400">R$ {limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${porcentagemCredito > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(porcentagemCredito, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}