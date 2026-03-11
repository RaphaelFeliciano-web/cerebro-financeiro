import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './componentes/Sidebar.jsx';
import SaldoeCartao from './componentes/saldoeCartao.jsx';
import Dashboard from './componentes/Dashboard.jsx';
import Carteira from './componentes/Carteira.jsx';
import Extrato from './componentes/Extrato.jsx';
import Metas from './componentes/metas.jsx';

export default function App() {
  // 1. ESTADOS
  const [saldo, setSaldo] = useState(() => Number(localStorage.getItem('cerebro_saldo')) || 2500);
  const [transacoes, setTransacoes] = useState(() => JSON.parse(localStorage.getItem('cerebro_transacoes')) || []);
  const [limiteTotal, setLimiteTotal] = useState(() => Number(localStorage.getItem('cerebro_limite_total')) || 5000);
  const [limiteUtilizado, setLimiteUtilizado] = useState(() => Number(localStorage.getItem('cerebro_limite_uso')) || 1250);
  const [minhaCarteira, setMinhaCarteira] = useState(() => JSON.parse(localStorage.getItem('cerebro_carteira')) || []);
  const [metas, setMetas] = useState(() => JSON.parse(localStorage.getItem('cerebro_metas')) || []);
  const [abaAtiva, setAbaAtiva] = useState('home');
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [estaDigitando, setEstaDigitando] = useState(false);
  const [mensagens, setMensagens] = useState([{ id: Date.now(), texto: "Cérebro v3.5 online. O que vamos fazer hoje?", tipo: 'bot' }]);
  
  const scrollRef = useRef(null);

  // Efeitos para salvar no localStorage e scroll do chat
  useEffect(() => { localStorage.setItem('cerebro_saldo', String(saldo)); }, [saldo]);
  useEffect(() => { localStorage.setItem('cerebro_transacoes', JSON.stringify(transacoes)); }, [transacoes]);
  useEffect(() => { localStorage.setItem('cerebro_limite_total', String(limiteTotal)); }, [limiteTotal]);
  useEffect(() => { localStorage.setItem('cerebro_limite_uso', String(limiteUtilizado)); }, [limiteUtilizado]);
  useEffect(() => { localStorage.setItem('cerebro_carteira', JSON.stringify(minhaCarteira)); }, [minhaCarteira]);
  useEffect(() => { localStorage.setItem('cerebro_metas', JSON.stringify(metas)); }, [metas]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens, estaDigitando]);

  // 2. CÁLCULOS
  const limiteDisponivel = Math.max(0, limiteTotal - limiteUtilizado);
  const porcentagemCredito = limiteTotal > 0 ? (limiteUtilizado / limiteTotal) * 100 : 0;
  const totalInvestido = minhaCarteira.reduce((acc, curr) => acc + (curr.qtd * curr.precoMedio), 0);

  // 3. FUNÇÕES DE LÓGICA
  const processarComando = async (texto) => {
    setEstaDigitando(true);
    try {
      const response = await fetch('http://localhost:3000/processar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: texto })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Erro no servidor.");
      }

      const rawData = await response.json();
      const dadosIA = Array.isArray(rawData) ? rawData : (rawData.transacoes || []);
      
      let novasTransacoesParaEstado = [];
      const mensagensDeFeedback = [];

      dadosIA.forEach(t => {
        const valorOriginal = Number(t.valor) || 0;
        const valorAbs = Math.abs(valorOriginal);
        const ticker = t.ativo ? t.ativo.toUpperCase() : null;
        const catNorm = t.categoria?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        const descNorm = t.descricao?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

        const transacaoBase = {
          id: Date.now() + Math.random(),
          desc: t.descricao || (valorOriginal < 0 ? "Despesa" : "Receita"),
          valor: valorOriginal,
          cat: t.categoria || "Geral",
          data: new Date().toLocaleDateString('pt-BR'),
          tickerInfo: ticker,
          qtdInfo: t.quantidade || 0
        };

        if (ticker) {
          const ehCompra = t.tipo_operacao === 'C' || valorOriginal < 0;
          setSaldo(prev => ehCompra ? prev - valorAbs : prev + valorAbs);
          setMinhaCarteira(prevCarteira => {
            const ativoExistente = prevCarteira.find(i => i.ticker === ticker);
            if (ativoExistente) {
              const novaQtd = ehCompra ? ativoExistente.qtd + (t.quantidade || 0) : ativoExistente.qtd - (t.quantidade || 0);
              if (novaQtd <= 0) return prevCarteira.filter(i => i.ticker !== ticker);
              const novoPM = ehCompra 
                ? ((ativoExistente.qtd * ativoExistente.precoMedio) + valorAbs) / novaQtd 
                : ativoExistente.precoMedio;
              return prevCarteira.map(i => i.ticker === ticker ? { ...i, qtd: novaQtd, precoMedio: novoPM } : i);
            } else if (ehCompra) {
              const quantidade = t.quantidade || 0;
              const precoMedio = quantidade > 0 ? valorAbs / quantidade : 0;
              return [...prevCarteira, { ticker, qtd: quantidade, precoMedio }];
            }
            return prevCarteira;
          });
          novasTransacoesParaEstado.push(transacaoBase);
        } else if (catNorm.includes("fatura") || catNorm.includes("pagamento") || descNorm.includes("fatura") || descNorm.includes("pagamento")) {
          setSaldo(prev => prev - valorAbs);
          setLimiteUtilizado(prev => Math.max(0, prev - valorAbs));
          novasTransacoesParaEstado.push(transacaoBase);
        } else if (catNorm.includes("credito") || catNorm.includes("cartao") || descNorm.includes("credito")) {
          if (limiteUtilizado + valorAbs > limiteTotal) {
            mensagensDeFeedback.push({
              id: Date.now() + Math.random(),
              texto: `Bloqueado: A compra "${t.descricao}" de R$ ${valorAbs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ultrapassa seu limite de crédito.`,
              tipo: 'erro'
            });
          } else {
            setLimiteUtilizado(prev => prev + valorAbs);
            novasTransacoesParaEstado.push(transacaoBase);
          }
        } else {
          setSaldo(prev => prev + valorOriginal);
          novasTransacoesParaEstado.push(transacaoBase);
        }
      });

      if (novasTransacoesParaEstado.length > 0) {
        setTransacoes(prev => [...novasTransacoesParaEstado, ...prev]);
        mensagensDeFeedback.push({ id: Date.now() + Math.random(), texto: "Cérebro atualizado! ✅", tipo: 'bot' });
      }

      if (mensagensDeFeedback.length > 0) {
        setMensagens(prev => [...prev, ...mensagensDeFeedback]);
      }

    } catch (error) {
      setMensagens(prev => [...prev, { id: Date.now() + Math.random(), texto: `Erro: ${error.message}`, tipo: 'erro' }]);
    } finally {
      setEstaDigitando(false);
    }
  };

  const enviar = () => {
    if (!input.trim()) return;
    setMensagens(p => [...p, { id: Date.now() + Math.random(), texto: input, tipo: 'user' }]);
    processarComando(input);
    setInput("");
  };

  const removerTransacao = (id) => {
    const transacao = transacoes.find(t => t.id === id);
    if (!transacao) return;

    const valorOriginal = Number(transacao.valor) || 0;
    const valorAbs = Math.abs(valorOriginal);
    const ticker = transacao.tickerInfo;
    const qtdTransacao = transacao.qtdInfo || 0;
    
    const catNorm = transacao.cat?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
    const descNorm = transacao.desc?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

    // REVERSÃO DA CARTEIRA E INVESTIMENTOS
    if (ticker) {
      const ehCompra = valorOriginal < 0;

      setMinhaCarteira(prevCarteira => {
        const ativo = prevCarteira.find(i => i.ticker === ticker);
        if (!ativo) return prevCarteira;

        if (ehCompra) {
          const novaQtd = ativo.qtd - qtdTransacao;
          if (novaQtd <= 0) return prevCarteira.filter(i => i.ticker !== ticker);
          
          // Recálculo do PM Inverso
          const novoPM = ((ativo.qtd * ativo.precoMedio) - valorAbs) / novaQtd;
          return prevCarteira.map(i => 
            i.ticker === ticker ? { ...i, qtd: novaQtd, precoMedio: Math.max(0, novoPM) } : i
          );
        } else {
          // Revertendo Venda: Devolve a quantidade ao estoque (o PM de venda não altera o custo médio)
          return prevCarteira.map(i => 
            i.ticker === ticker ? { ...i, qtd: ativo.qtd + qtdTransacao } : i
          );
        }
      });

      setSaldo(prev => ehCompra ? prev + valorAbs : prev - valorAbs);
    } 
    // REVERSÃO DE CARTÃO E SALDO COMUM
    else if (catNorm.includes("fatura") || catNorm.includes("pagamento") || descNorm.includes("fatura") || descNorm.includes("pagamento")) {
      setSaldo(prev => prev + valorAbs);
      setLimiteUtilizado(prev => prev + valorAbs);
    } else if (catNorm.includes("credito") || catNorm.includes("cartao") || descNorm.includes("credito")) {
      setLimiteUtilizado(prev => Math.max(0, prev - valorAbs));
    } else {
      setSaldo(prev => prev - valorOriginal);
    }

    setTransacoes(prev => prev.filter(tr => tr.id !== id));
  };

  const adicionarMeta = (nome, valorAlvo) => {
    const novaMeta = {
      id: Date.now(),
      nome,
      valorAlvo: Number(valorAlvo)
    };
    setMetas(prevMetas => [...prevMetas, novaMeta]);
  };

  const removerMeta = (id) => {
    setMetas(prevMetas => prevMetas.filter(meta => meta.id !== id));
  };

  const editarMeta = (id, novoNome, novoValorAlvo) => {
    setMetas(prevMetas =>
      prevMetas.map(meta =>
        meta.id === id
          ? { ...meta, nome: novoNome, valorAlvo: Number(novoValorAlvo) }
          : meta
      )
    );
  };

  return (
    <div className="relative flex h-screen w-full bg-[#F1F5F9] text-[#112A46] font-sans overflow-hidden">
      <aside className="hidden lg:flex flex-shrink-0 border-r border-slate-200 bg-white">
        <Sidebar abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
      </aside>

      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 lg:hidden shadow-xl">
            <Sidebar abaAtiva={abaAtiva} setAbaAtiva={(aba) => { setAbaAtiva(aba); setIsSidebarOpen(false); }} />
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="p-6 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h1 className="text-xl font-black italic text-[#112A46]">Cérebro</h1>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-600">
              <Menu size={28} />
            </button>
          </div>

          {abaAtiva === 'home' && (
            <SaldoeCartao 
              saldo={saldo}
              limiteTotal={limiteTotal}
              limiteUtilizado={limiteUtilizado}
              limiteDisponivel={limiteDisponivel}
              porcentagemCredito={porcentagemCredito}
              totalInvestido={totalInvestido}
            />
          )}
        </header>

        <section className="flex-1 px-6 pb-6 min-h-0">
          <div className="h-full bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            {abaAtiva === 'home' && (
              <Dashboard 
                mensagens={mensagens} estaDigitando={estaDigitando} 
                input={input} setInput={setInput} enviar={enviar} 
                scrollRef={scrollRef} 
              />
            )}
            {abaAtiva === 'carteira' && (
              <Carteira 
                minhaCarteira={minhaCarteira} 
                totalInvestido={totalInvestido} 
                saldo={saldo} 
              />)}
            {abaAtiva === 'historico' && <Extrato transacoes={transacoes} removerTransacao={removerTransacao} />}
            {abaAtiva === 'metas' && (
              <Metas 
                metas={metas} 
                totalInvestido={totalInvestido} 
                adicionarMeta={adicionarMeta}
                removerMeta={removerMeta}
                editarMeta={editarMeta}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}