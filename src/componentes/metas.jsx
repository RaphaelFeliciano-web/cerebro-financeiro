import React, { useState } from 'react';
import { Target, Plus, Trash2, Flag, TrendingUp, Edit, Check, X } from 'lucide-react';

function MetaCard({ meta, totalInvestido, removerMeta, editarMeta }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNome, setEditedNome] = useState(meta.nome);
  const [editedValor, setEditedValor] = useState(meta.valorAlvo);

  const progresso = meta.valorAlvo > 0 ? (totalInvestido / meta.valorAlvo) * 100 : 0;
  const progressoClamped = Math.min(progresso, 100);

  const handleSave = () => {
    if (editedNome.trim() && editedValor > 0) {
      editarMeta(meta.id, editedNome, editedValor);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedNome(meta.nome);
    setEditedValor(meta.valorAlvo);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-lg flex flex-col gap-4 ring-4 ring-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Edit size={24} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={editedNome}
              onChange={(e) => setEditedNome(e.target.value)}
              className="w-full bg-slate-100 p-2 rounded-lg font-black text-lg text-[#112A46] outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-slate-400">R$</span>
              <input
                type="number"
                value={editedValor}
                onChange={(e) => setEditedValor(e.target.value)}
                className="w-full bg-slate-100 p-2 rounded-lg text-sm font-bold text-slate-400 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={handleCancel} className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={16} />
          </button>
          <button onClick={handleSave} className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
            <Check size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Flag size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#112A46]">{meta.nome}</h3>
            <p className="text-sm font-bold text-slate-400">
              Objetivo: R$ {meta.valorAlvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:bg-blue-100 hover:text-blue-500 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => removerMeta(meta.id)}
            className="p-2 text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-500">Progresso</span>
          <span className="text-sm font-black text-blue-600">{progressoClamped.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progressoClamped}%` }}
          ></div>
        </div>
        <p className="text-right text-xs font-semibold text-slate-400 mt-2">
          R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {meta.valorAlvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

export default function Metas({ metas, totalInvestido, adicionarMeta, removerMeta, editarMeta }) {
  const [nomeMeta, setNomeMeta] = useState('');
  const [valorMeta, setValorMeta] = useState('');

  const handleAddMeta = (e) => {
    e.preventDefault();
    if (nomeMeta.trim() && valorMeta > 0) {
      adicionarMeta(nomeMeta, valorMeta);
      setNomeMeta('');
      setValorMeta('');
    }
  };

  return (
    <div className="flex-1 bg-transparent p-6 md:p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Target size={28} className="text-[#112A46]" />
        <h2 className="text-2xl font-black italic">Metas e Objetivos</h2>
      </div>

      {/* Formulário para adicionar nova meta */}
      <form onSubmit={handleAddMeta} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          value={nomeMeta}
          onChange={(e) => setNomeMeta(e.target.value)}
          placeholder="Nome da Meta (Ex: Viagem ao Japão)"
          className="flex-1 bg-white p-4 rounded-xl outline-none text-sm font-bold border border-slate-200 focus:border-blue-500 transition-colors"
        />
        <input
          type="number"
          value={valorMeta}
          onChange={(e) => setValorMeta(e.target.value)}
          placeholder="Valor do Objetivo (R$)"
          className="w-full md:w-48 bg-white p-4 rounded-xl outline-none text-sm font-bold border border-slate-200 focus:border-blue-500 transition-colors"
        />
        <button type="submit" className="w-full md:w-auto bg-[#112A46] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#3A86FF] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
          <Plus size={18} />
          Adicionar
        </button>
      </form>

      {/* Lista de Metas */}
      {metas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metas.map(meta => (
            <MetaCard 
              key={meta.id} 
              meta={meta} 
              totalInvestido={totalInvestido}
              removerMeta={removerMeta}
              editarMeta={editarMeta}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <TrendingUp size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-500">Nenhuma meta definida ainda.</h3>
          <p className="text-sm text-slate-400 mt-1">Sincronize seus investimentos com seus sonhos!</p>
        </div>
      )}
    </div>
  );
}