import React from 'react';

function Sidebar({ abaAtiva, setAbaAtiva }) {
  const menus = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'carteira', label: '📈 Ativos' },
    { id: 'historico', label: '📊 Extrato' },
    { id: 'metas', label: '🎯 Metas' }
  ];

  return (
    <div className="bg-white h-full p-6 flex flex-col border-r border-slate-200/80 shadow-sm">
      <h1 className="text-2xl font-black italic text-[#112A46] mb-16">Cérebro</h1>
      <nav className="flex flex-col gap-3">
        {menus.map(menu => (
          <button
            key={menu.id}
            onClick={() => setAbaAtiva(menu.id)}
            className={`
              w-full text-left font-bold text-sm p-4 rounded-2xl transition-all duration-300
              ${abaAtiva === menu.id 
                ? 'bg-[#3A86FF] text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-[#112A46]'
              }
            `}
          >
            {menu.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;