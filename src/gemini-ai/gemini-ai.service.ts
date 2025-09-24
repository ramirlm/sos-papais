import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgeEmbeddingService } from '../embedding/knowledge-embedding/knowledge-embedding.service';
import { Parent } from '../parents/entities/parent.entity';
import { Child } from '../children/entities/child.entity';

@Injectable()
export class GeminiAiService {
  private ai: GoogleGenAI;
  private matchThreshold: number;
  private documentsCount: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
    private readonly knowledgeEmbeddingService: KnowledgeEmbeddingService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY'),
    });

    this.matchThreshold =
      Number(this.configService.get<string>('MATCH_THRESHOLD')) || 0.75;

    this.knowledgeEmbeddingService
      .embedKnowledgeBase()
      .then(({ documentsCount }) => (this.documentsCount = documentsCount));
  }

  async generateResponse(
    query: string,
    parent: Parent,
    child: Child,
  ): Promise<{ aiResponse: string , updatedContextSummary: string }> {
    const questionText = query;

    const queryEmbedding =
      await this.embeddingService.generateEmbedding(questionText);

    const documents = await this.knowledgeService.matchDocuments({
      queryEmbedding,
      matchThreshold: this.matchThreshold,
      matchCount: this.documentsCount,
    });

    const contextText = documents.map((doc) => doc.content).join('\n\n---\n\n');

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
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const aiResponse = completion?.text?.trim() || 'Desculpe, não consegui gerar uma resposta.'

    const updatedContextSummary = await this.generateContextSummary({
      contextSummary: parent.contextSummary,
      userMessage: questionText,
      aiResponse,
    });

    return { aiResponse , updatedContextSummary};
  }

  async generateContextSummary({
    contextSummary,
    userMessage,
    aiResponse,
  }: {
    contextSummary: string;
    userMessage: string;
    aiResponse: string;
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
      - **Não invente informações** que não tenham sido mencionadas.

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

      Resumo atualizado:
    `.trim();


    const completion = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    return completion?.text?.trim() || '';
  }
}
