import { Injectable } from '@nestjs/common';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgeEmbeddingService } from '../embedding/knowledge-embedding/knowledge-embedding.service';
import { Ollama } from 'ollama';
import { Child } from '../children/entities/child.entity';
import { Parent } from '../parents/entities/parent.entity';
@Injectable()
export class OllamaAiService {
  private ai: Ollama;

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
    private readonly knowledgeEmbeddingService: KnowledgeEmbeddingService,
  ) {
    this.ai = new Ollama({ host: 'http://127.0.0.1:11434' });
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
      matchThreshold: 0.7,
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
      - **Não invente informações**. Se o contexto não for suficiente para responder corretamente, diga que não há dados suficientes para responder sobre esse tópico.
      - **Não faça perguntas** ao usuário.
      - Formate a resposta como se fosse uma mensagem de WhatsApp: linguagem acessível, tom acolhedor e objetivo.
      - Caso a pergunta do usuário não seja clara ou não pareça uma pergunta, ofereça dicas úteis e seguras relacionadas ao tema mencionado.
      - Trate a criança como se você já a conhecesse: o nome dela é **${child.name}**, tem **${childMonths} meses**, o responsável que está conversando com você é **${parent.name}**.


      --------------------
      CONTEXTO:
      ${contextText}
      --------------------

      Pergunta do Usuário:
      ${query}

      Resposta:
    `.trim();

    console.log(prompt);

    const completion = await this.ai.generate({
      model: 'llama3.2',
      prompt,
    });

    return (
      completion?.response?.trim() ||
      'Desculpe, não consegui gerar uma resposta.'
    );
  }
}
