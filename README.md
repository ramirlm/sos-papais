# SOS Papais 👶

**SOS Papais** é um chatbot inteligente no WhatsApp que oferece suporte especializado para pais e mães sobre desenvolvimento infantil, sono, alimentação e cuidados gerais com bebês e crianças. Utilizando inteligência artificial local (Ollama) e uma base de conhecimento estruturada, o sistema fornece respostas personalizadas e baseadas em evidências científicas.

## 🎯 Funcionalidades Principais

- **Chatbot WhatsApp**: Integração completa com WhatsApp Web para comunicação direta com os pais
- **IA Local**: Utiliza Ollama (modelo llama3.2) para geração de respostas contextuais
- **Base de Conhecimento**: Mais de 20 documentos especializados sobre desenvolvimento infantil, sono, alimentação e segurança
- **RAG (Retrieval Augmented Generation)**: Sistema de busca semântica com embeddings vetoriais
- **Gestão de Usuários**: Sistema de cadastro e identificação de pais via número de telefone
- **Controle de Acesso**: Lista de números autorizados (safelist) para segurança

## 🏗️ Arquitetura

### Stack Tecnológica
- **Backend**: NestJS (Node.js/TypeScript)
- **Banco de Dados**: PostgreSQL com extensão pgvector
- **IA**: Ollama (llama3.2)
- **WhatsApp**: whatsapp-web.js
- **Embeddings**: @xenova/transformers
- **ORM**: TypeORM

### Componentes Principais

#### 1. WhatsApp Integration (`WhatsappWebService`)
- Autenticação via QR Code
- Recebimento e envio de mensagens
- Sistema de safelist para controle de acesso
- Gerenciamento de sessão persistente

#### 2. Message Handler (`MessageHandlerService`)
- Processamento de mensagens recebidas
- Fluxo de onboarding de novos usuários
- Integração com IA para geração de respostas

#### 3. AI Service (`OllamaAiService`)
- Conexão com Ollama local
- Sistema RAG para busca de contexto relevante
- Geração de respostas especializadas

#### 4. Knowledge Management (`KnowledgesService`)
- Busca semântica em documentos
- Inserção de novos conhecimentos
- Gerenciamento de embeddings vetoriais

#### 5. Embedding Services
- `EmbeddingService`: Geração de embeddings de texto
- `KnowledgeEmbeddingService`: Processamento da base de conhecimento

## 📚 Base de Conhecimento

O sistema conta com uma extensa base de conhecimento científica organizada por temas:

### Desenvolvimento Infantil
- Marcos do desenvolvimento (6-12 meses, 3-6 anos)
- Desenvolvimento cognitivo e de linguagem
- Desenvolvimento motor e escolar

### Sono Infantil
- Sono em recém-nascidos e lactentes
- Rotinas e ambiente ideal para o sono
- Terrores noturnos e apneia do sono
- Método Ferber e outras técnicas

### Alimentação
- Introdução alimentar (6-12 meses)
- Alimentação saudável para crianças
- Perguntas frequentes sobre alimentação

### Saúde e Segurança
- Segurança doméstica
- Prevenção de engasgo
- Febre alta em crianças
- Higiene infantil
- Calendário vacinal

### Bibliografia Científica
- Referências sobre desenvolvimento infantil
- Estudos sobre sono infantil
- Pesquisas em segurança e prevenção

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 20 ou 22 LTS (recomendado)
- PostgreSQL com extensão pgvector
- Ollama instalado e rodando localmente
- Modelo llama3.2 baixado no Ollama

### 1. Instalação das Dependências
```bash
nvm use || true   # usa Node 22 LTS se você tiver nvm
npm install
```

> Dica: este repositório inclui um arquivo `.nvmrc` apontando para Node 22.
> Algumas dependências nativas (ex: `sharp`, usada indiretamente por `@xenova/transformers`) ainda não suportam Node 23.
> Se você estiver em Node 23 e vir erro do `sharp`, troque para Node 22 LTS e reinstale dependências.

#### Se você encontrou erro do sharp ao iniciar
```bash
# Troque para Node 22 (com nvm)
nvm install 22
nvm use 22

# Limpe e reinstale dependências
rm -rf node_modules package-lock.json
npm install

# Verifique se a arquitetura não está forçada incorretamente
npm config get arch        # deve ser arm64 em Macs Apple Silicon
# se aparecer arm64v8, ajuste com:
npm config delete arch

# Rode o app novamente
npm run start:dev
```

### 2. Configuração do Banco de Dados
```bash
# Iniciar PostgreSQL com pgvector via Docker
docker-compose up -d postgres

# Executar migrações
npm run typeorm:run
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL=postgresql://nest_user:nest_password@localhost:5432/nest_db
NUMBER_SAFELIST=5511999999999,5511888888888  # Números autorizados (separados por vírgula)
PORT=3000
```

### 4. Configuração do Ollama
```bash
# Instalar Ollama (se não estiver instalado)
curl -fsSL https://ollama.com/install.sh | sh

# Baixar e executar o modelo llama3.2
ollama pull llama3.2
ollama run llama3.2
```

### 5. Inicialização
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📱 Como Usar

### Primeiro Uso
1. Inicie a aplicação
2. Escaneie o QR Code exibido no terminal com seu WhatsApp
3. Adicione os números autorizados na variável `NUMBER_SAFELIST`

### Fluxo do Usuário
1. **Primeiro contato**: Usuário envia mensagem → Sistema cadastra o número → Solicita o nome
2. **Cadastro do nome**: Usuário informa o nome → Sistema atualiza o perfil
3. **Consultas**: Usuário faz perguntas → Sistema busca na base de conhecimento → IA gera resposta personalizada

### Exemplos de Uso
- "Como introduzir alimentação sólida para bebê de 6 meses?"
- "Meu filho de 2 anos não quer dormir, o que fazer?"
- "Quais são os marcos de desenvolvimento aos 12 meses?"
- "Como prevenir engasgo em bebês?"

## 🗄️ Estrutura do Banco de Dados

### Tabela: `knowledge`
- `id`: Identificador único
- `content`: Conteúdo do documento
- `embedding`: Vetor de embedding para busca semântica
- `created_at`: Data de criação

### Tabela: `parents`
- `id`: Identificador único
- `phone`: Número de telefone (único)
- `name`: Nome do pai/mãe
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Funções do Banco
- `match_documents()`: Função PostgreSQL para busca de similaridade vetorial

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run start:dev      # Inicia em modo desenvolvimento
npm run start:debug    # Inicia com debug
```

### Build e Produção
```bash
npm run build         # Compila o projeto
npm run start:prod    # Inicia em produção
```

### Testes
```bash
npm run test          # Testes unitários
npm run test:e2e      # Testes end-to-end
npm run test:cov      # Cobertura de testes
```

### Banco de Dados
```bash
npm run typeorm:generate  # Gera nova migração
npm run typeorm:run      # Executa migrações pendentes
```

### Qualidade de Código
```bash
npm run lint          # Verifica e corrige linting
npm run format        # Formata código com Prettier
```

## 🔐 Segurança

### Controle de Acesso
- Sistema de safelist por números de telefone
- Validação de mensagens apenas de números autorizados
- Logs de tentativas de acesso não autorizadas

### Dados Sensíveis
- Nunca commitadar credenciais no código
- Variáveis de ambiente para configurações sensíveis
- Autenticação local do WhatsApp Web

## 🧪 Testes

O projeto inclui testes unitários e de integração para todos os serviços principais:
- WhatsApp Web Service
- Message Handler Service
- Ollama AI Service
- Knowledge Services
- Embedding Services

Execute os testes:
```bash
npm test
```

## 🧠 RAG: Como funciona e melhorias aplicadas

- Contexto por trechos: os arquivos Markdown são divididos em trechos menores (chunking por cabeçalhos + janela deslizante) para melhorar a precisão da busca.
- Embeddings locais: usamos `Xenova/all-MiniLM-L6-v2` com normalização, armazenados no PostgreSQL via `pgvector`.
- Índice vetorial: migração adiciona índice `ivfflat` para acelerar consultas de similaridade.
- Recuperação ajustada: top-k reduzido (12) e truncamento do contexto para manter o prompt estável.
- Prompt aprimorado: instruções objetivas, PT-BR e foco em usar apenas o contexto recuperado.

### Recriar embeddings
Por padrão, a vetorização ocorre uma vez no boot. Para reprocessar a base:
1. Limpe a tabela `knowledge` ou ajuste o método `isEmbedded()` caso deseje forçar uma reindexação.
2. Reinicie a aplicação para disparar a vetorização.

### Executar migrações de performance
Certifique-se de aplicar as migrações mais recentes para criar o índice vetorial e atualizar a função de busca:
```bash
npm run typeorm:run
```

## 🚀 Deploy

### Docker
O projeto inclui um `docker-compose.yml` para o banco PostgreSQL. Para um deploy completo:

1. Configure as variáveis de ambiente apropriadas
2. Garanta que o Ollama esteja acessível
3. Execute as migrações do banco
4. Inicie a aplicação

### Considerações de Produção
- Configure logs estruturados
- Monitore o uso de memória (embeddings podem ser intensivos)
- Implemente backup da base de conhecimento
- Configure alertas para falhas na conexão WhatsApp

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Utilize TypeScript com tipagem estrita
- Siga os padrões do ESLint configurado
- Mantenha cobertura de testes acima de 80%
- Documente APIs públicas

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Equipe de Desenvolvimento** - Trabalho inicial

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**SOS Papais** - Apoiando pais e mães com tecnologia e conhecimento científico 👶💙
