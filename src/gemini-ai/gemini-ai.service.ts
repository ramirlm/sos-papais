import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgeEmbeddingService } from '../embedding/knowledge-embedding/knowledge-embedding.service';
import { Parent } from '../parents/entities/parent.entity';
import { Child } from '../children/entities/child.entity';
import { Knowledge } from '../knowledges/entities/knowledge.entity';

@Injectable()
export class GeminiAiService {
  private ai: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
    private readonly knowledgeEmbeddingService: KnowledgeEmbeddingService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY'),
    });

    // Inicializa o embedding da base
    this.knowledgeEmbeddingService.embedKnowledgeBase();
  }

  async generateResponse(
    query: string,
    parent: Parent,
    child: Child,
  ): Promise<{
    response: string;
    usedKnowledge: Knowledge;
    contextSummary: string;
  }> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    const documents = await this.knowledgeService.matchDocuments({
      queryEmbedding,
      matchThreshold: 0.75,
      matchCount: 27,
    });

    const contextText = documents.map((doc) => doc.content).join('\n\n---\n\n');
    const topDocument = documents?.[0];

    const hasHistory = !!(parent.lastQuestion && parent.lastResponse);
    const lastKnowledge = parent.lastUsedKnowledge?.content
      ? parent.lastUsedKnowledge
      : undefined;

    let updatedContextSummary = parent.contextSummary || '';
    updatedContextSummary = await this.generateContextSummary({
      lastQuestion: parent.lastQuestion,
      lastResponse: parent.lastResponse,
      // knowledge: lastKnowledge,
      previousContextSummary: parent.contextSummary,
    });

    console.log('updatedContextSummary', updatedContextSummary);

    const childMonths =
      (new Date().getFullYear() - child.birthDate.getFullYear()) * 12 +
      (new Date().getMonth() - child.birthDate.getMonth());

    const childAgeText =
      childMonths > 12
        ? `${Math.floor(childMonths / 12)} anos${childMonths % 12 > 0 ? ` e ${childMonths % 12} meses` : ''}`
        : `${childMonths} meses`;

    const prompt = this.buildPrompt({
      query,
      contextText,
      contextSummary: updatedContextSummary,
      childName: child.name || '',
      childAgeText,
      parentName: parent.name,
      hasHistory,
    });

    const completion = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText =
      completion?.text?.trim() || 'Desculpe, não consegui gerar uma resposta.';

    console.log('Prompt:', prompt);
    console.log('Response:', responseText);

    return {
      response: responseText,
      usedKnowledge: topDocument,
      contextSummary: updatedContextSummary,
    };
  }

  private buildPrompt({
    query,
    contextText,
    contextSummary,
    childName,
    childAgeText,
    parentName,
    hasHistory,
  }: {
    query: string;
    contextText: string;
    contextSummary: string;
    childName: string;
    childAgeText: string;
    parentName: string;
    hasHistory: boolean;
  }): string {
    return `
Você é um assistente virtual especialista em sono infantil e desenvolvimento de bebês. Sua missão é orientar pais e mães com informações claras, acolhedoras e baseadas em evidências científicas — sempre em português do Brasil.

### INSTRUÇÕES:
- Responda com linguagem acessível, empática e objetiva — como se estivesse no WhatsApp.
- **Nunca faça mais de 1 pergunta por resposta.**
- Só pergunte se realmente for necessário. Prefira responder com base no que já foi dito.
- Não repita perguntas que o(a) ${parentName} já respondeu.
- Continue a conversa com base no histórico anterior, se disponível. Não reinicie.
- Se a pergunta estiver confusa ou incompleta, peça mais detalhes — mas não ofereça dicas genéricas.
- Trate a criança como se já a conhecesse: o nome dela é **${childName}**, tem **${childAgeText}**.
- Evite citar trechos do conhecimento que não sejam compatíveis com essa idade.
- Mantenha sua resposta com até 6 linhas, de forma natural e útil.

=== CONTEXTO ===
${contextText || 'Nenhum contexto foi encontrado.'}

=== HISTÓRICO DA CONVERSA ===
${hasHistory ? contextSummary || 'Nenhum histórico anterior.' : 'Nenhum histórico disponível.'}

=== PERGUNTA DO USUÁRIO ===
${query}

=== SUA RESPOSTA ===
`.trim();
  }

  private async generateContextSummary({
    lastQuestion,
    lastResponse,
    previousContextSummary,
  }: {
    lastQuestion: string;
    lastResponse: string;
    previousContextSummary?: string;
  }): Promise<string> {
    const prompt = `
Você faz parte de um sistema de IA que orienta pais e mães sobre sono infantil e desenvolvimento de bebês.

Sua tarefa é atualizar o **resumo acumulado da conversa** com base na última interação, mantendo o contexto ao longo do tempo.

### O QUE VOCÊ DEVE FAZER:
1. Gere um **resumo breve (até 200 caracteres)** explicando o tema geral da conversa até agora.
2. Em seguida, liste em formato de **bullet points** as interações anteriores, agrupando:
   - Perguntas que a IA fez;
   - Respostas dadas pelo usuário.
3. **Inclua o histórico anterior no final**, para preservar o contexto de longo prazo.
4. Não repita informações que já estejam no histórico anterior, a menos que estejam sendo atualizadas.
5. Use linguagem simples e clara.

---

### Última pergunta feita pelo usuário:
${lastQuestion || 'Nenhuma pergunta registrada.'}

### Última resposta da IA:
${lastResponse || 'Nenhuma resposta registrada.'}

---

### Histórico anterior da conversa:
${previousContextSummary || 'Nenhum histórico anterior disponível.'}

---

### Novo resumo acumulado:
`.trim();

    const completion = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return completion?.text?.trim() || '';
  }
}
