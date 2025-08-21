import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgeEmbeddingService } from '../embedding/knowledge-embedding/knowledge-embedding.service';
import { Ollama } from 'ollama';
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

  async generateResponse(query: string, child?: any): Promise<string> {
    const questionText = child
      ? `${query} esse é o filho: ${JSON.stringify(child)}`
      : query;

    const queryEmbedding =
      await this.embeddingService.generateEmbedding(questionText);

    const documents = await this.knowledgeService.matchDocuments({
      queryEmbedding,
      matchThreshold: 0.4,
      matchCount: 27,
    });

    const contextText = documents.map((doc) => doc.content).join('\n\n---\n\n');

    const prompt = `
      Você é um chatbot especialista em sono infantil e desenvolvimento de bebês. Sua missão é ajudar pais e mães com informações claras, empáticas e baseadas em fatos, em português do Brasil.
      Use **apenas** o contexto fornecido abaixo para responder à pergunta do usuário. Não invente informações.
      Se o contexto não for suficiente para responder, diga que você não tem a informação sobre esse tópico específico.

      Contexto:
      ${contextText}

      Pergunta do Usuário:
      ${query}

      Resposta:
    `.trim();

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
