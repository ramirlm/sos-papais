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

  constructor(
    private readonly configService: ConfigService,
        private readonly embeddingService: EmbeddingService,
        private readonly knowledgeService: KnowledgesService,
        private readonly knowledgeEmbeddingService: KnowledgeEmbeddingService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY'),
    });

    this.knowledgeEmbeddingService.embedKnowledgeBase();
  }

  async generateResponse(
      query: string,
      parent: Parent,
      child: Child,
    ): Promise<string> {
      const questionText = query;
  
      const queryEmbedding =
        await this.embeddingService.generateEmbedding(questionText);
  
      const documents = await this.knowledgeService.matchDocuments({
        queryEmbedding,
        matchThreshold: 0.75,
        matchCount: 27,
      });
  
      const contextText = documents.map((doc) => doc.content).join('\n\n---\n\n');
  
      const childMonths =
        (new Date().getFullYear() - child.birthDate.getFullYear()) * 12 +
        (new Date().getMonth() - child.birthDate.getMonth());
  
      const prompt = `
        Você é um assistente virtual especialista em sono infantil e desenvolvimento de bebês. Sua missão é ajudar pais e mães com informações claras, empáticas e baseadas em evidências científicas, sempre em português do Brasil.
  
        INSTRUÇÕES IMPORTANTES:
        - Use **exclusivamente** as informações fornecidas no campo CONTEXTO abaixo para formular sua resposta.
        - Se o contexto não for encontrado ou não for suficiente, responda que não há dados suficientes para responder à pergunta em sua base de dados.
        - **Não invente informações**. Se o contexto não for suficiente para responder corretamente, diga que não há dados suficientes para responder sobre esse tópico.
        - **Não faça perguntas** ao usuário.
        - Formate a resposta como se fosse uma mensagem de WhatsApp: linguagem acessível, tom acolhedor e objetivo.
        - Caso a pergunta do usuário não seja clara ou não pareça uma pergunta, ofereça dicas úteis e seguras relacionadas ao tema mencionado.
        - Trate a criança como se você já a conhecesse: o nome dela é **${child.name}**, tem **${childMonths > 12 ? `${Math.floor(childMonths/12)} anos${childMonths%12 > 0 ? ` e ${childMonths%12} meses` : ''}` : `${childMonths} meses`}**, o responsável que está conversando com você é **${parent.name}**.
  
  
        --------------------
        CONTEXTO:
        ${contextText ? contextText : 'Nenhum contexto foi encontrado'}
        --------------------
  
        Pergunta do Usuário:
        ${query}
  
        Resposta:
      `.trim();
  
      console.log(prompt);
  
      const completion = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      });
  
      return (
        completion?.text?.trim() ||
        'Desculpe, não consegui gerar uma resposta.'
      );
    }
}
