# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run start:dev      # Hot-reload development server
npm run start:debug    # Development with debugger attached
npm run build          # Compile TypeScript to dist/
npm run start:prod     # Run production build
```

### Testing
```bash
npm test                    # Run all unit tests
npm run test:watch          # Run tests in watch mode
npm run test:cov            # Generate coverage report
npm run test:e2e            # End-to-end integration tests
npm run test -- --testNamePattern="ServiceName"  # Run specific test suite
```

### Database Operations
```bash
npm run typeorm:generate    # Generate new migration from entity changes
npm run typeorm:run         # Execute pending migrations
docker compose up -d postgres  # Start PostgreSQL with pgvector
```

### Code Quality
```bash
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
```

## Architecture Overview

### Core System Design
SOS Papais is a WhatsApp-based AI chatbot providing evidence-based parental guidance through a Retrieval Augmented Generation (RAG) architecture. The system processes WhatsApp messages, performs semantic search on a curated knowledge base, and generates contextual responses using local Ollama AI.

### Key Data Flow
```
WhatsApp Message → Security Check → User Management → 
Query Embedding → Knowledge Retrieval → AI Response Generation → WhatsApp Delivery
```

### Primary Services Integration

**WhatsappWebService**: Manages WhatsApp Web connection via puppeteer with QR authentication. Handles message routing and enforces phone number-based access control through `NUMBER_SAFELIST` environment variable.

**MessageHandlerService**: Central orchestrator managing conversation flow. Implements user onboarding (registration → name collection → AI interaction) and routes established users directly to AI processing.

**OllamaAiService**: RAG implementation using local Ollama (llama3.2). Converts queries to embeddings, retrieves relevant knowledge documents (threshold: 0.4, top 27 matches), and generates responses with assembled context.

**KnowledgesService**: Manages semantic search using PostgreSQL's pgvector extension. Executes `match_documents()` function for cosine similarity matching and handles knowledge insertion with vector embeddings.

**EmbeddingService**: Generates 384-dimensional vectors using Xenova/all-MiniLM-L6-v2 transformer model. Handles text-to-vector conversion for both queries and knowledge base documents.

### Database Architecture
PostgreSQL with pgvector extension stores two main entities:
- `knowledge`: Documents with content and 384-dimensional embeddings for semantic search
- `parents`: User profiles with phone numbers and conversation state

Custom `match_documents(query_embedding, threshold, count)` function performs vector similarity search using cosine distance.

### Knowledge Base System
25+ curated markdown files in `/src/knowledge-base/` covering child development, sleep, nutrition, and safety. `KnowledgeEmbeddingService` automatically vectorizes content on startup, with smart caching to avoid re-processing existing embeddings.

## Environment Configuration

Required `.env` variables:
```env
DATABASE_URL=postgresql://nest_user:nest_password@localhost:5432/nest_db
NUMBER_SAFELIST=comma,separated,phone,numbers
PORT=3000
```

## Development Setup Prerequisites

1. **Ollama Installation**: Local Ollama server with llama3.2 model at `http://127.0.0.1:11434`
2. **PostgreSQL**: Docker container with pgvector extension (use provided docker-compose.yml)
3. **WhatsApp Authentication**: QR code scanning required for WhatsApp Web session

## Testing Architecture

- Unit tests for all services with mocked dependencies
- E2E tests covering WhatsApp integration workflows
- Database tests require running PostgreSQL instance
- AI service tests mock Ollama responses to avoid external dependencies

## Migration Management

TypeORM migrations in `/migrations/` directory:
- Knowledge table with vector column support
- Parent entity with conversation tracking
- Custom PostgreSQL functions for vector similarity

Run migrations before first startup: `npm run typeorm:run`

## Security Model

- **Access Control**: Safelist-based phone number validation
- **Local Processing**: All AI inference via local Ollama (no external APIs)
- **Session Management**: WhatsApp Web persistent authentication
- **Data Privacy**: Minimal user data collection (phone + name only)

## Performance Considerations

- **Embedding Generation**: CPU-intensive on first startup for knowledge base vectorization
- **Vector Search**: Database performance scales with knowledge base size
- **Memory Usage**: Ollama model requires significant RAM allocation
- **WhatsApp Rate Limits**: Platform-imposed message frequency restrictions