import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class GeminiAiService {
  private static startedEmbedding = false;
  private ai: GoogleGenAI;
  private knowledgeBasePath = join(process.cwd(), 'src', 'knowledge-base');

  constructor(
    private readonly configService: ConfigService,
    private readonly knowledgeService: KnowledgesService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY'),
    });

    this.embedKnowledgeBase();
  }

  private async embedKnowledgeBase(): Promise<void> {
    if (await this.knowledgeService.isEmbedded()) {
      console.log('Base de conhecimento já vetorizada, pulando...');
      return;
    }
    if (GeminiAiService.startedEmbedding) {
      console.log('Vetorização já em andamento, pulando...');
      return;
    }

    GeminiAiService.startedEmbedding = true;
    console.log('Iniciando a vetorização da base de conhecimento...');

    const files = fs
      .readdirSync(this.knowledgeBasePath)
      .filter((file) => file.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(
        join(this.knowledgeBasePath, file),
        'utf-8',
      );

      console.log(`Vetorizando o arquivo: ${file}`);

      // Pass raw content to embedding generator
      const embedding = await this.embeddingService.generateEmbedding(content);
      console.log(`Embedding gerado para ${file}:`, embedding);

      await this.knowledgeService.insertKnowledge({ content, embedding });
    }

    console.log('Vetorização concluída.');
  }

  async generateResponse(query: string, child?: any): Promise<string> {
    console.log('Dados adicionais (child):', child);

    // 1. Gerar embedding da pergunta
    const questionText = child
      ? `${query} esse é o filho: ${JSON.stringify(child)}`
      : query;

    const queryEmbedding =
      await this.embeddingService.generateEmbedding(questionText);

    // 2. Buscar documentos mais relevantes
    const documents = await this.knowledgeService.matchDocuments({
      queryEmbedding,
      matchThreshold: 0.4,
      matchCount: 27,
    });

    const contextText = documents.map((doc) => doc.content).join('\n\n---\n\n');

    // 3. Criar o prompt
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

    // 4. Gerar resposta com Gemini
    const completion = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    return (
      completion.text?.trim() || 'Desculpe, não consegui gerar uma resposta.'
    );
  }
}
