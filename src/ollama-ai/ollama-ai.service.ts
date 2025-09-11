import { Injectable } from '@nestjs/common';
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
    void this.knowledgeEmbeddingService.embedKnowledgeBase();
  }

  async generateResponse(query: string, child?: unknown): Promise<string> {
    const questionText = child
      ? `${query} esse é o filho: ${JSON.stringify(child)}`
      : query;

    const queryEmbedding =
      await this.embeddingService.generateEmbedding(questionText);

    const documents = await this.knowledgeService.matchDocuments({
      queryEmbedding,
      matchThreshold: 0.4,
      matchCount: 12,
    });

    const rawContextText = documents
      .map((doc: { content: string }) => doc.content)
      .join('\n\n---\n\n');

    const contextText = this.truncateContext(rawContextText, 12000);

    const prompt = `
Você é um assistente especialista em sono infantil e desenvolvimento de bebês. Responda em português do Brasil.

Regras:
- Baseie-se apenas no CONTEXTO. Não invente fatos.
- Seja direto, empático e claro para leigos.
- Se o contexto não cobrir o tema, diga que não há informação suficiente e sugira como reformular a pergunta.
- Quando fizer sentido, organize em tópicos curtos e práticos.

CONTEXTO:
${contextText}

PERGUNTA DO USUÁRIO:
${query}

RESPOSTA:
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

  private truncateContext(text: string, maxChars: number): string {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + '\n\n...';
  }
}
