import React from 'react';

function Dashboard({ 
  mensagens, 
  estaDigitando, 
  input, 
  setInput, 
  enviar, 
  scrollRef 
}) {
  return (
    <div className="flex-1 bg-transparent flex flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
        {mensagens.map((m) => (
          <div key={m.id} className={`flex ${m.tipo === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-semibold leading-relaxed ${
              m.tipo === 'user' 
              ? 'bg-[#3A86FF] text-white rounded-tr-none shadow-blue-200 shadow-md' 
              : 'bg-slate-50 border border-slate-100 text-[#112A46] rounded-tl-none'
            }`}>
              {m.texto}
            </div>
          </div>
        ))}
        {estaDigitando && (
          <div className="text-[10px] font-black text-slate-300 animate-pulse uppercase ml-2">
            Cérebro processando...
          </div>
        )}
      </div>

      {/* INPUT DE COMANDO */}
      <div className="p-4 bg-white/50 border-t border-slate-100 flex gap-3">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && enviar()} 
          placeholder="Ex: comprei 10 mxrf11 10.50" 
          className="flex-1 bg-slate-100 p-4 rounded-xl outline-none text-sm font-bold placeholder:text-slate-400" 
        />
        <button 
          onClick={enviar} 
          className="bg-[#112A46] text-white px-8 rounded-xl font-black hover:bg-[#3A86FF] transition-all shadow-lg active:scale-95"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default Dashboard;