# HOA Buddy

HOA Buddy is a TypeScript RAG chatbot prototype for answering homeowner questions from cited HOA governing documents and Florida Statutes Chapter 720.

This MVP uses:

- Node.js + TypeScript
- LangChain JS
- OpenAI `text-embedding-3-small`
- Pinecone
- One OCR-processed HOA covenants PDF
- Official Florida Statutes Chapter 720 from Online Sunshine

## Scope

Version 1 corpus:

- HOA Covenants and Restrictions
- Florida Statutes Chapter 720

Not included yet:

- St. Johns County ordinances
- Additional Florida statutes
- Federal law
- UI
- n8n rebuild

## Safety

HOA Buddy is informational only and is not legal advice. Answers should be grounded in retrieved source text. If the retrieved context is insufficient, the system should say it cannot answer reliably.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_INDEX_NAME=hoa-buddy-v1
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

Private HOA documents live under `data/`, which is ignored by Git.

## Run

Create or verify the Pinecone index:

```bash
npm run pinecone:create-index
```

Inspect the OCR HOA PDF:

```bash
npm run pdf:inspect
```

Inspect chunks:

```bash
npm run chunks:inspect
```

Ingest sources:

```bash
npm run ingest:hoa
npm run ingest:florida
```

Check Pinecone record counts:

```bash
npm run pinecone:stats
```

Retrieve without generation:

```bash
npm run retrieve -- "What does Florida law say about HOA architectural approval for improvements?"
```

Generate a grounded answer:

```bash
npm run rag:answer -- "What does Florida law say about HOA architectural approval for improvements?"
```

## Current Index

Expected Pinecone stats after MVP ingestion:

```text
Dimension: 1536
Total record count: 768
hoa: 399
florida-law: 369
```

## Architecture

```text
OFFLINE
HOA PDF / Florida statute HTML
  -> load text
  -> clean text
  -> split chunks
  -> embed with OpenAI
  -> store in Pinecone namespaces

ONLINE
Question
  -> embed question
  -> retrieve top chunks from Pinecone
  -> grounded prompt
  -> LLM answer with citations
```

## Useful Scripts

```bash
npm run build
npm run embedding:test
npm run retrieval:smoke
npm run rag:answer -- "your question"
```

## MVP Status

- TypeScript build passes.
- Pinecone index exists.
- HOA corpus ingested.
- Florida Statutes Chapter 720 ingested.
- Retrieval smoke test baseline: Top-1 keyword hits 4/5, Top-5 keyword hits 5/5.
- Grounded answer generation works with HOA and Florida statute citations.

