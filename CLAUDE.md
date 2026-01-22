# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Full setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Vitest
npm run db:reset     # Reset SQLite database
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma studio    # Open database GUI
```

## Architecture Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in chat, Claude generates React code using tools, and components render in real-time.

### Tech Stack
- **Framework:** Next.js 15 with App Router, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui (new-york style), Radix UI
- **AI:** Vercel AI SDK + Anthropic Claude Haiku 4.5
- **Database:** Prisma ORM with SQLite
- **Editor:** Monaco Editor for code, Babel for JSX transformation
- **Testing:** Vitest + Testing Library

### Key Architectural Concepts

**Virtual File System** (`src/lib/file-system.ts`):
- In-memory file tree, not written to disk
- `VirtualFileSystem` class handles all file operations
- Serialized to JSON and stored in database per project

**AI Tools** (`src/lib/tools/`):
- `str_replace_editor` - Create, read, modify files
- `file_manager` - Rename, delete files/directories
- Tools operate on the virtual file system during chat

**Chat API** (`src/app/api/chat/route.ts`):
- POST endpoint receives messages + serialized file system
- Uses `streamText()` with tool execution
- Max 40 steps, 10,000 tokens, 120s timeout
- Saves project to database on completion if authenticated

**React Contexts** (`src/lib/contexts/`):
- `ChatProvider` - Chat state, AI SDK integration
- `FileSystemProvider` - Virtual file system state management

**Authentication**:
- JWT-based with cookies (`src/lib/auth.ts`)
- Server Actions for auth operations (`src/actions/index.ts`)
- Middleware protects authenticated routes

**Mock Provider** (`src/lib/provider.ts`):
- When `ANTHROPIC_API_KEY` is missing, uses `MockLanguageModel`
- Generates sample Counter/Form/Card components for testing

### Data Flow
1. User sends message in ChatInterface
2. POST to `/api/chat` with messages + file system state
3. Claude generates response, calls tools to modify files
4. Tools update VirtualFileSystem, changes stream back
5. PreviewFrame renders components from virtual files
6. Project saved to Prisma/SQLite on completion

### Database Schema
```prisma
User { id, email, password, projects[] }
Project { id, name, userId?, messages (JSON), data (JSON file system) }
```

## Code Conventions

- Use `@/` path alias for all internal imports
- Server Actions in `src/actions/` for mutations
- UI components use Radix UI + Tailwind (cn utility for class merging)
- Tests in `__tests__/` directories adjacent to source files
