# API Documentation - SOS Papais

## Visão Geral

O SOS Papais é principalmente um sistema de chatbot que opera via WhatsApp, não expondo APIs REST tradicionais para consumo externo. A aplicação funciona como um serviço backend que processa mensagens do WhatsApp e fornece respostas inteligentes através da integração com Ollama AI.

## Endpoints Disponíveis

### Health Check

#### `GET /`
- **Descrição**: Endpoint simples para verificar se a aplicação está funcionando
- **Método**: `GET`
- **URL**: `http://localhost:3000/`
- **Resposta**: 
  ```text
  Hello World!
  ```
- **Status Code**: `200 OK`

## Arquitetura de Serviços

### WhatsappWebService

**Responsabilidades:**
- Gerenciar conexão com WhatsApp Web
- Autenticar via QR Code
- Receber mensagens dos usuários
- Enviar respostas automatizadas
- Controlar acesso via safelist de números

**Métodos Principais:**
- `onModuleInit()`: Inicializa o cliente WhatsApp
- `sendWhatsAppMessage(to: string, message: string)`: Envia mensagem para um número específico

### MessageHandlerService

**Responsabilidades:**
- Processar mensagens recebidas
- Gerenciar fluxo de onboarding
- Integrar com serviços de IA

**Métodos Principais:**
- `handleIncomingMessage(message)`: Processa mensagens recebidas
- `handleNotFoundParent(phoneNumber)`: Gerencia cadastro de novos usuários
- `handleParentName(phoneNumber, name)`: Atualiza nome do usuário

### OllamaAiService

**Responsabilidades:**
- Conectar com Ollama AI local
- Processar consultas usando RAG (Retrieval Augmented Generation)
- Gerar respostas contextualizadas

**Métodos Principais:**
- `generateResponse(query: string, child?: unknown)`: Gera resposta para consulta do usuário

**Configuração:**
- Host padrão: `http://127.0.0.1:11434`
- Modelo utilizado: `llama3.2`
- Match threshold: `0.4`
- Match count: `12` documentos

### KnowledgesService

**Responsabilidades:**
- Buscar documentos relevantes na base de conhecimento
- Inserir novos conhecimentos
- Gerenciar embeddings vetoriais

**Métodos Principais:**
- `matchDocuments(params)`: Busca semântica por documentos relevantes
- `insertKnowledge(content, embedding)`: Insere novo conhecimento
- `isEmbedded()`: Verifica se há embeddings na base

**Parâmetros de Busca:**
```typescript
interface MatchDocumentsParams {
  queryEmbedding?: number[];
  matchThreshold: number; // Limiar de similaridade (0.0 - 1.0)
  matchCount: number;     // Número máximo de documentos retornados
}
```

### EmbeddingService

**Responsabilidades:**
- Gerar embeddings de texto usando transformers
- Converter texto em vetores para busca semântica

**Métodos Principais:**
- `generateEmbedding(text: string)`: Gera embedding para texto fornecido

### ParentsService

**Responsabilidades:**
- Gerenciar cadastro de pais/usuários
- Controlar acesso e permissões

**Métodos Principais:**
- `findByPhone(phone: string)`: Busca usuário por número de telefone
- `register(phone: string)`: Cadastra novo usuário
- `updateName(phone: string, name: string)`: Atualiza nome do usuário

## Fluxo de Dados

### 1. Recebimento de Mensagem
```mermaid
graph TD
    A[WhatsApp Message] --> B[WhatsappWebService]
    B --> C[MessageHandlerService]
    C --> D{User Exists?}
    D -->|No| E[Register User]
    D -->|Yes| F{Has Name?}
    F -->|No| G[Request Name]
    F -->|Yes| H[Process Query]
```

### 2. Processamento de Consulta
```mermaid
graph TD
    A[User Query] --> B[OllamaAiService]
    B --> C[EmbeddingService]
    C --> D[Generate Query Embedding]
    D --> E[KnowledgesService]
    E --> F[Search Similar Documents]
    F --> G[Ollama AI Processing]
    G --> H[Generate Response]
    H --> I[Send via WhatsApp]
```

## Configurações

### Variáveis de Ambiente

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `NUMBER_SAFELIST` | Números autorizados (separados por vírgula) | `5511999999999,5511888888888` |
| `PORT` | Porta da aplicação | `3000` |

### Configuração do Banco de Dados

**PostgreSQL com pgvector:**
- Extensão pgvector habilitada para busca vetorial
- Função personalizada `match_documents()` para busca semântica
- Tabelas principais: `knowledge`, `parents`

## Monitoramento e Logs

### Logs Importantes
- Conexão/desconexão do WhatsApp Web
- Mensagens recebidas e processadas
- Erros na geração de respostas
- Tentativas de acesso não autorizado

### Métricas Sugeridas
- Número de mensagens processadas por minuto
- Tempo médio de resposta
- Taxa de sucesso na geração de respostas
- Uso de memória para embeddings

## Limitações e Considerações

### Performance
- Embeddings são gerados localmente (pode ser intensivo em CPU)
- Base de conhecimento carregada em memória
- Ollama requer recursos significativos

### Segurança
- Acesso controlado por safelist de números
- Sem autenticação tradicional (baseado no WhatsApp)
- Dados sensíveis não devem ser commitados

### Escalabilidade
- Sistema projetado para uso moderado
- Para alta escala, considerar:
  - Cache de embeddings
  - Load balancing
  - Banco dedicado para embeddings
  - API externa para IA

## Troubleshooting

### Problemas Comuns

**WhatsApp não conecta:**
- Verificar se o QR Code foi escaneado
- Confirmar que o Puppeteer tem permissões adequadas
- Verificar logs de autenticação

**Ollama não responde:**
- Confirmar se o serviço Ollama está rodando
- Verificar se o modelo llama3.2 foi baixado
- Testar conexão manual: `curl http://localhost:11434/api/generate`

**Base de conhecimento vazia:**
- Executar embeddings manualmente via `KnowledgeEmbeddingService`
- Verificar se os arquivos markdown estão na pasta `knowledge-base`
- Confirmar se o banco PostgreSQL tem a extensão pgvector
