import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
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
  private responseModelName: string;
  private contextSummaryModelName: string;
  private semanticQueryModelName: string;
  private matchThreshold: number;
  private documentsCount: number;
  private readonly logger = new Logger(GeminiAiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
    private readonly knowledgeEmbeddingService: KnowledgeEmbeddingService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY'),
    });

    this.responseModelName =
      this.configService.get<string>('RESPONSE_GEMINI_AI_MODEL') ||
      'gemini-2.0-flash';

    this.contextSummaryModelName =
      this.configService.get<string>('CONTEXT_SUMMARY_GEMINI_AI_MODEL') ||
      'gemini-2.0-flash';

    this.semanticQueryModelName =
      this.configService.get<string>('SEMANTIC_QUERY_GEMINI_AI_MODEL') ||
      'gemini-2.0-flash';

    this.matchThreshold =
      Number(this.configService.get<string>('MATCH_THRESHOLD')) || 0.75;

    this.knowledgeEmbeddingService
      .embedKnowledgeBase()
      .then(({ documentsCount }) => {
        this.documentsCount = documentsCount;
      });
  }

  async generateResponse(
    query: string,
    parent: Parent,
    child: Child,
  ): Promise<{ aiResponse: string; updatedContextSummary: string }> {
    try {
      const questionText = await this.buildSemanticQuery(
        query,
        parent.contextSummary,
      );
      this.logger.log(`Consulta semântica gerada: "${questionText}"`);

      const queryEmbedding =
        await this.embeddingService.generateEmbedding(questionText);

      const documents = await this.knowledgeService.matchDocuments({
        queryEmbedding,
        matchThreshold: this.matchThreshold,
        matchCount: this.documentsCount,
      });

      this.logger.log(`${documents.length} documentos encontrados.`);

      const contextText = documents
        .map((doc: Knowledge) => doc.content)
        .join('\n\n---\n\n');

      const childMonths =
        (new Date().getFullYear() - child.birthDate.getFullYear()) * 12 +
        (new Date().getMonth() - child.birthDate.getMonth());

      const childAgeText =
        childMonths > 12
          ? `${Math.floor(childMonths / 12)} anos${childMonths % 12 > 0 ? ` e ${childMonths % 12} meses` : ''}`
          : `${childMonths} meses`;

      const prompt = `
        Você é um assistente virtual especialista em sono infantil e desenvolvimento de bebês. Sua missão é ajudar pais e mães com informações claras, empáticas e baseadas em evidências científicas, sempre em português do Brasil.
        
        INSTRUÇÕES IMPORTANTES:
        - Use **exclusivamente** as informações fornecidas nos campos CONTEXTO e HISTÓRICO DA CONVERSA abaixo para formular sua resposta.
        - Se o contexto não for encontrado ou não for suficiente, responda que não há dados suficientes para responder à pergunta em sua base de dados.
        - **Não invente informações**. Responda apenas com base no conteúdo fornecido.
        - Trate a criança como se você já a conhecesse: o nome dela é **${child.name}**, tem **${childAgeText}**, e o responsável que está conversando com você é **${parent.name}**.
        - Use o campo HISTÓRICO DA CONVERSA para **dar continuidade à conversa de forma natural**.
        - Escreva no estilo de uma mensagem de WhatsApp: linguagem acessível, tom acolhedor, direto e gentil.
        - Caso a pergunta do usuário não seja clara ou pareça incompleta, ofereça dicas úteis e seguras relacionadas ao tema mencionado.
        - Se sua resposta puder ser significativamente melhorada com mais informações, você pode fazer no máximo **duas perguntas curtas e diretas** para entender melhor a situação.
        - **Evite fazer perguntas desnecessárias ou fora de contexto.**
  
        --------------------
        HISTÓRICO DA CONVERSA:
        ${parent.contextSummary || 'Nenhum histórico de conversa foi encontrado'}
        --------------------

        --------------------
        CONTEXTO:
        ${contextText || 'Nenhum contexto foi encontrado'}
        --------------------
  
        Pergunta do Usuário:
        ${query}
  
        Resposta:
      `.trim();

      const completion = await this.ai.models.generateContent({
        model: this.responseModelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const aiResponse =
        completion?.text?.trim() ||
        'Desculpe, não consegui gerar uma resposta.';

      this.logger.log(`Conteúdo da resposta: "${aiResponse}"`);

      const updatedContextSummary = await this.generateContextSummary({
        contextSummary: parent.contextSummary,
        userMessage: questionText,
        aiResponse,
        usedKnowledge: contextText,
      });

      this.logger.log(`Contexto atualizado: "${updatedContextSummary}"`);

      return { aiResponse, updatedContextSummary };
    } catch (error) {
      this.logger.error(
        `❌ Erro ao gerar resposta: ${error.message}`,
        error.stack,
      );
      return {
        aiResponse: 'Desculpe, ocorreu um erro ao gerar a resposta.',
        updatedContextSummary: parent.contextSummary || '',
      };
    }
  }

  async generateContextSummary({
    contextSummary,
    userMessage,
    aiResponse,
    usedKnowledge,
  }: {
    contextSummary: string;
    userMessage: string;
    aiResponse: string;
    usedKnowledge?: string;
  }): Promise<string> {
    const prompt = `
      Você é um componente intermediário em uma conversa entre uma IA e um usuário. Sua função é gerar um resumo de contexto acumulativo com base nas mensagens trocadas.

      INSTRUÇÕES IMPORTANTES:
      - Utilize os campos "MENSAGEM DO USUÁRIO" e "MENSAGEM DA IA" para atualizar o histórico da conversa.
      - Identifique claramente de quem é cada mensagem.
      - O resumo deve manter todas as informações anteriores relevantes — ou seja, o contexto deve ser acumulativo.
      - Utilize o campo "CONTEXTO ATUAL" como base para adicionar as novas informações.
      - Sempre escreva o resumo como se fosse a **própria IA refletindo** sobre o que está sendo conversado com o usuário.
      - O resumo deve ser claro, organizado cronologicamente e em português do Brasil.
      - Utilize o campo de **timestamp** para registrar o momento da interação.
      - Sempre inclua no resumo:
        - Todas as **perguntas do usuário**.
        - Todas as **respostas da IA** com suas respectivas dicas.
        - **Perguntas feitas pela IA ao usuário** (caso existam).
        - As **respostas do usuário** a essas perguntas (e use essas informações para complementar ou melhorar respostas anteriores).
        - A **base de dados utilizada** pela IA para gerar a resposta (se houver).
      - **Não invente informações** que não tenham sido mencionadas.
      - Deixe claro no resumo informações sobre a criança, como nome e idade, para que a IA possa se referir a elas em interações futuras.

      --------------------
      TIMESTAMP DA INTERAÇÃO ATUAL:
      ${new Date().toISOString()}
      --------------------

      --------------------
      CONTEXTO ATUAL:
      ${contextSummary || 'Nenhum histórico de conversa foi encontrado.'}
      --------------------

      --------------------
      MENSAGEM DO USUÁRIO:
      ${userMessage || 'Nenhuma mensagem do usuário foi encontrada.'}
      --------------------

      --------------------
      MENSAGEM DA IA:
      ${aiResponse || 'Nenhuma mensagem da IA foi encontrada.'}
      --------------------

      --------------------
      BASE DE DADOS UTILIZADA:
      ${usedKnowledge || 'Nenhuma base de dados foi mencionada.'}
      --------------------

      Resumo atualizado:
    `.trim();

    try {
      const completion = await this.ai.models.generateContent({
        model: this.contextSummaryModelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const result = completion?.text?.trim() || '';

      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao gerar resumo de contexto: ${error.message}`,
        error.stack,
      );
      return contextSummary || '';
    }
  }

  async buildSemanticQuery(
    query: string,
    contextSummary: string,
  ): Promise<string> {
    const prompt = `
      Você é responsável por gerar uma consulta semântica otimizada para recuperar informações de uma base de conhecimento.

      INSTRUÇÕES IMPORTANTES:
      - Reescreva a pergunta do usuário em uma forma clara, objetiva e completa.
      - Inclua termos relacionados e sinônimos que aumentem a chance de encontrar documentos relevantes.
      - Leve em consideração o **HISTÓRICO DA CONVERSA** para manter a coerência do contexto.
      - A consulta deve ser curta, mas precisa (máximo 2 frases).
      - Não invente informações que não estejam na pergunta ou no contexto.
      - Escreva sempre em português do Brasil.

      --------------------
      HISTÓRICO DA CONVERSA:
      ${contextSummary || 'Nenhum histórico foi encontrado.'}
      --------------------

      --------------------
      PERGUNTA ORIGINAL DO USUÁRIO:
      ${query}
      --------------------

      Gere uma versão semanticamente otimizada da pergunta do usuário:
    `.trim();

    try {
      const completion = await this.ai.models.generateContent({
        model: this.semanticQueryModelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const semanticQuery = completion?.text?.trim() || query;
      return semanticQuery;
    } catch (error) {
      this.logger.error(
        `Erro ao gerar consulta semântica: ${error.message}`,
        error.stack,
      );
      return query;
    }
  }
}
