import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgesService } from '../knowledges/knowledges.service';
// import { EmbeddingService } from '../embedding/embedding.service';
import { Parent } from '../parents/entities/parent.entity';
import { Child } from '../children/entities/child.entity';
import { Knowledge } from '../knowledges/entities/knowledge.entity';
import { getMarkdownFilesRecursively } from '../common/utils/getMarkdownFilesRecursively';
import { join } from 'path';
import { getChildAgeText } from '../common/utils/getChildAgeText';
import { getKeywordFromFilePath } from '../common/utils/getKeywordFromFilePath';
import { getFormattedFoundDocuments } from '../common/utils/getFormattedFoundDocuments';

@Injectable()
export class GeminiAiService {
  private ai: GoogleGenAI;
  private responseModelName: string;
  private contextSummaryModelName: string;
  private semanticQueryModelName: string;
  private matchThreshold: number;
  private documentsCount: number;
  private knowledgeBasePath = join(process.cwd(), 'knowledge-base');
  private readonly logger = new Logger(GeminiAiService.name);

  constructor(
    private readonly configService: ConfigService,
    // private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
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

    this.documentsCount = getMarkdownFilesRecursively(
      this.knowledgeBasePath,
    ).length;
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
        parent,
        child,
      );
      this.logger.log(`\n\nConsulta semântica gerada: "${questionText}"\n\n`);

      // const queryEmbedding =
      //   await this.embeddingService.generateEmbedding(questionText);

      const job = await this.ai.batches.createEmbeddings({
        src: {
          inlinedRequests: {
            contents: { parts: [{ text: questionText }] },
          },
        },
      });

      const result = await this.ai.batches.get({name: job.name!})

      const queryEmbedding = result.dest?.inlinedEmbedContentResponses as number[]

      console.log(queryEmbedding)

      const documents = await this.knowledgeService.matchDocuments({
        queryEmbedding,
        matchThreshold: this.matchThreshold,
        matchCount: this.documentsCount,
      });

      this.logger.log(`\n\n${documents.length} documentos encontrados.\n\n`);
      this.logger.log(getFormattedFoundDocuments(documents));

      const contextText = documents
        .map((doc: Knowledge) => doc.content)
        .join('\n\n---\n\n');

      const childAgeText = getChildAgeText(child);

      const prompt = `
        Você é um assistente virtual especialista em sono infantil e desenvolvimento de bebês. Sua missão é ajudar pais e mães com informações claras, empáticas e baseadas em evidências científicas, sempre em português do Brasil.
        
        INSTRUÇÕES IMPORTANTES:
        - Use **exclusivamente** as informações fornecidas nos campos CONTEXTO e HISTÓRICO DA CONVERSA abaixo para formular sua resposta.
        - Se não houver informações suficientes no CONTEXTO, diga que não é possível responder com base nos dados disponíveis.
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

      this.logger.log(`\n\nConteúdo da resposta: "${aiResponse}"\n\n`);

      const updatedContextSummary = await this.generateContextSummary({
        contextSummary: parent.contextSummary,
        userMessage: questionText,
        aiResponse,
        usedKnowledge: contextText,
      });

      this.logger.log(
        `\n\nContexto atualizado: "${updatedContextSummary}"\n\n`,
      );

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
      - Retorne o resultado em formato de string separando cada interação com quebras de linha e sempre inclua o timestamp de cada interação.

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

  // Nova função para gerar termos semânticos relacionados
  async generateSemanticTerms(
    query: string,
    contextSummary: string,
    keywords: string,
  ): Promise<string[]> {
    const prompt = `
      Você é um assistente que gera palavras-chave e frases curtas relacionadas a um tema para melhorar a busca em uma base de conhecimento.

      INSTRUÇÕES:
      - Baseie-se na pergunta do usuário e no histórico da conversa.
      - Retorne uma lista de termos, palavras e expressões relacionadas que ajudem a encontrar documentos relevantes.
      - Separe os termos por vírgula, sem explicações adicionais.

      Pergunta do usuário: ${query}
      Histórico da conversa: ${contextSummary || 'Nenhum histórico disponível.'}
      Palavras-chave da base: ${keywords}

      Retorne apenas a lista de termos.
    `.trim();

    try {
      const completion = await this.ai.models.generateContent({
        model: this.semanticQueryModelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const termsText = completion?.text?.trim() || '';
      return termsText
        .split(',')
        .map((term) => term.trim())
        .filter(Boolean);
    } catch (error) {
      this.logger.error(
        `Erro ao gerar termos semânticos: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  // Função buildSemanticQuery atualizada para usar generateSemanticTerms
  async buildSemanticQuery(
    query: string,
    contextSummary: string,
    parent: Parent,
    child: Child,
  ): Promise<string> {
    const keywords = getMarkdownFilesRecursively(this.knowledgeBasePath)
      .map(getKeywordFromFilePath)
      .join(', ');

    const terms = await this.generateSemanticTerms(
      query,
      contextSummary,
      keywords,
    );

    // Monta uma query combinada, mantendo voz original e incluindo termos relacionados
    const childAgeText = getChildAgeText(child);

    const combinedQuery = `
      ${query.trim()}.
      Termos relacionados: ${terms.join(', ')}.
      Informação sobre a criança: nome ${child.name}, idade ${childAgeText}.
    `
      .replace(/\s+/g, ' ')
      .trim();

    return combinedQuery;
  }
}
