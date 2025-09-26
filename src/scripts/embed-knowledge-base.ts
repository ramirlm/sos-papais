import { DataSource, DataSourceOptions } from 'typeorm';
import { environments } from '../common/constants/environments';
import { EmbeddingService } from '../embedding/embedding.service';
import { KnowledgeEmbeddingService } from '../embedding/knowledge-embedding/knowledge-embedding.service';
import { KnowledgesService } from '../knowledges/knowledges.service';
import { typeormConfigs } from '../configs/typeorm';
import 'dotenv/config';

const AppDataSource = new DataSource({
  ...(typeormConfigs[
    process.env.NODE_ENV || environments.DEVELOPMENT
  ] as DataSourceOptions),
});

AppDataSource.initialize().then(async (datasource) => {
  const embeddingService = new EmbeddingService();
  const knowledgeService = new KnowledgesService(datasource);
  const knowledgeEmbeddingService = new KnowledgeEmbeddingService(
    embeddingService,
    knowledgeService,
  );

  await datasource.query('DELETE FROM knowledge;');
  await knowledgeEmbeddingService.embedKnowledgeBase();
});
