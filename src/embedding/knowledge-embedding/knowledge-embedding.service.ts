import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from '../embedding.service';
import { KnowledgesService } from '../../knowledges/knowledges.service';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Mutex } from 'async-mutex';

/**
 * Service responsible for processing and embedding markdown knowledge base files.
 * Uses semantic chunking and vector embeddings for efficient knowledge retrieval.
 * 
 * Features:
 * - Concurrent processing protection using mutex
 * - Async file operations to prevent blocking
 * - Comprehensive error handling
 * - Smart chunking with semantic awareness
 * - Progress tracking and logging
 */
@Injectable()
export class KnowledgeEmbeddingService {
  private static readonly embeddingMutex = new Mutex();
  private readonly logger = new Logger(KnowledgeEmbeddingService.name);
  private readonly knowledgeBasePath = join(process.cwd(), 'src', 'knowledge-base');

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
  ) {}

  /**
   * Embeds the entire knowledge base by processing markdown files and generating vector embeddings.
   * Uses mutex to ensure only one embedding process runs at a time.
   * 
   * @throws {Error} If directory doesn't exist or critical errors occur during processing
   */
  async embedKnowledgeBase(): Promise<void> {
    await KnowledgeEmbeddingService.embeddingMutex.runExclusive(async () => {
      try {
        if (await this.knowledgeService.isEmbedded()) {
          this.logger.log('Knowledge base already embedded, skipping...');
          return;
        }

        this.logger.log('Starting knowledge base embedding process...');

        const files = await fs.readdir(this.knowledgeBasePath);
        const markdownFiles = files.filter((file) => file.endsWith('.md'));

        if (markdownFiles.length === 0) {
          this.logger.warn(`No markdown files found in directory: ${this.knowledgeBasePath}`);
          return;
        }

        this.logger.log(`Found ${markdownFiles.length} markdown files to process`);

        for (const file of markdownFiles) {
          await this.processFile(file);
        }

        this.logger.log('Knowledge base embedding completed successfully');
      } catch (error) {
        this.logger.error('Critical error during knowledge base embedding', error.stack);
        throw error;
      }
    });
  }

  /**
   * Processes a single markdown file: reads, chunks, embeds, and stores content.
   * 
   * @param file - The filename to process
   */
  private async processFile(file: string): Promise<void> {
    try {
      const fullPath = join(this.knowledgeBasePath, file);
      const content = await fs.readFile(fullPath, 'utf-8');

      this.logger.log(`Processing file: ${file}`);

      const chunks = this.splitMarkdownIntoChunks(content, {
        chunkSize: 1200,
        overlap: 150,
      });

      let processed = 0;
      for (const chunk of chunks) {
        try {
          const embedding = await this.embeddingService.generateEmbedding(chunk);
          await this.knowledgeService.insertKnowledge({ content: chunk, embedding });
          processed += 1;
          
          if (processed % 10 === 0 || processed === chunks.length) {
            this.logger.log(`  - ${processed}/${chunks.length} chunks processed from ${file}`);
          }
        } catch (chunkError) {
          this.logger.error(`Failed to process chunk ${processed + 1} from ${file}`, chunkError.stack);
          throw chunkError;
        }
      }
    } catch (fileError) {
      this.logger.error(`Failed to process file ${file}`, fileError.stack);
      throw fileError;
    }
  }

  /**
   * Splits markdown content into semantic chunks with overlap for better context preservation.
   * Maintains semantic boundaries by splitting on headers when possible.
   * 
   * @param content - The markdown content to split
   * @param options - Chunking configuration
   * @returns Array of content chunks
   */
  private splitMarkdownIntoChunks(
    content: string,
    options: { chunkSize: number; overlap: number },
  ): string[] {
    const { chunkSize, overlap } = options;

    // Split by headers to maintain semantic context
    const lines = content.split(/\r?\n/);
    const sections: string[] = [];
    let current: string[] = [];

    const pushCurrent = () => {
      if (current.length > 0) {
        sections.push(current.join('\n').trim());
        current = [];
      }
    };

    for (const line of lines) {
      if (/^#{1,6}\s+/.test(line) && current.length > 0) {
        pushCurrent();
      }
      current.push(line);
    }
    pushCurrent();

    // Create sliding windows with overlap, respecting word boundaries when possible
    const chunks: string[] = [];
    for (const section of sections) {
      if (section.length <= chunkSize) {
        if (section.trim().length > 0) {
          chunks.push(section.trim());
        }
        continue;
      }

      let start = 0;
      while (start < section.length) {
        let end = Math.min(start + chunkSize, section.length);
        
        // Try to end at a word boundary to avoid splitting words
        if (end < section.length) {
          const lastSpace = section.lastIndexOf(' ', end);
          const lastNewline = section.lastIndexOf('\n', end);
          const bestBoundary = Math.max(lastSpace, lastNewline);
          
          if (bestBoundary > start + chunkSize * 0.8) {
            end = bestBoundary;
          }
        }
        
        const slice = section.slice(start, end).trim();
        if (slice.length > 50) {
          chunks.push(slice);
        }
        
        if (end === section.length) break;
        start += Math.max(1, chunkSize - overlap);
      }
    }

    return chunks;
  }
}
