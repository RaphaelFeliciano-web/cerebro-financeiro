import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

dotenv.config();

const app = express();

// Configuração de CORS - Permite que o seu App.jsx (Porta 5173 ou 3000) fale com este servidor
app.use(cors());
app.use(express.json());

// Inicialização da SDK com a sua chave do .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * SCHEMA DE SAÍDA ESTRUTURADA (Structured Output)
 * Este objeto define a "forma" que o Gemini DEVE responder.
 * Isso evita que ele mande textos aleatórios antes do JSON.
 */
const transacaoSchema = {
  type: SchemaType.OBJECT,
  properties: {
    transacoes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          descricao: { 
            type: SchemaType.STRING, 
            description: "Descrição da transação (Ex: Salário, Compra de Ativo, Jantar)" 
          },
          valor: { 
            type: SchemaType.NUMBER, 
            description: "Valor numérico: POSITIVO para ganhos, NEGATIVO para gastos/compras" 
          },
          categoria: { 
            type: SchemaType.STRING, 
            description: "Categoria (Ex: Lazer, Alimentação, Salário, Investimento, Cartão)" 
          },
          quantidade: { 
            type: SchemaType.NUMBER, 
            description: "Quantidade de itens ou cotas (obrigatório se for investimento)" 
          },
          ativo: { 
            type: SchemaType.STRING, 
            description: "Ticker do ativo (Ex: MXRF11, BTC), se houver" 
          },
          tipo_operacao: { 
            type: SchemaType.STRING, 
            description: "C para compra/gasto, V para venda/ganho" 
          }
        },
        required: ["descricao", "valor", "categoria"]
      }
    }
  },
  required: ["transacoes"]
};

async function processarComGeminiPreview(mensagemUsuario) {
  try {
    /**
     * MODELO DEFINIDO: gemini-3-flash-preview
     * Atualizado conforme solicitado para os seus testes.
     */
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview"
    });

    console.log(`🚀 Processando comando (Gemini 3 Preview): "${mensagemUsuario}"`);

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: `Aja como um assistente financeiro e extraia as transações desta frase: "${mensagemUsuario}"` }] 
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: transacaoSchema,
        temperature: 0.1, // Mantém a resposta estável e previsível
      },
    });

    const response = await result.response;
    const text = response.text();
    
    // O Structured Output garante que o 'text' seja um JSON válido que obedece ao schema
    const data = JSON.parse(text);
    
    // Retornamos apenas o array para o Frontend (App.jsx)
    return data.transacoes;

  } catch (error) {
    console.error("❌ Erro na extração com Gemini 3:", error.message);
    throw error;
  }
}

app.post('/processar', async (req, res) => {
  const { mensagem } = req.body;
  
  if (!mensagem) {
    return res.status(400).json({ error: "Mensagem vazia." });
  }

  try {
    const transacoes = await processarComGeminiPreview(mensagem);
    console.log("✅ Sucesso: Transações enviadas ao Dashboard.");
    res.json(transacoes);
  } catch (error) {
    // Envia o erro detalhado para o chat no React
    res.status(500).json({ 
      error: "Falha no Modelo Gemini 3 Preview", 
      details: error.message 
    });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n💎 MODO PREVIEW ATIVO: gemini-3-flash-preview`);
  console.log(`📡 Ouvindo na porta ${PORT}`);
  console.log(`🔑 Use o comando 'node server.js' para iniciar.`);
});