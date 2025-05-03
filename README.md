# DDD Code Generator

A CLI tool to generate Domain-Driven Design structure for bounded contexts.

## Installation

```bash
# Install globally
npm install -g ddd-code-generator

# Or use with npx
npx ddd-code-generator
```

## Usage

### CLI

```bash
# Generate DDD structure using interactive prompts
ddd-gen
```

### Programmatic usage

```typescript
import { promptBoundedContext, createDirectoryStructure } from "ddd-code-generator";

async function generateDDD() {
  const boundedContext = await promptBoundedContext();
  await createDirectoryStructure(boundedContext);
}

generateDDD();
```

## Features

- Interactive CLI prompts for creating DDD structures
- Generates bounded contexts with aggregates
- Creates proper folder structure following DDD principles
- Generates boilerplate code for:
  - Aggregates
  - Value Objects
  - Repositories
  - Use Cases
  - DTOs
  - Controllers
  - Event Handlers

## Structure Generated

The generator creates a standard DDD folder structure:

```
src/[bounded-context]/
├── [aggregate]/
│   ├── app/
│   │   └── use-cases/
│   │       ├── [verb]/
│   │       │   ├── dto/
│   │       │   │   ├── request-[aggregate]-[verb].dto.ts
│   │       │   │   └── response-[aggregate]-[verb].dto.ts
│   │       │   └── [aggregate]-[verb].use-case.ts
│   │       ├── domain/
│   │       │   ├── event/
│   │       │   ├── exceptions/
│   │       │   ├── repository/
│   │       │   │   └── [aggregate].repository.ts
│   │       │   ├── value-objects/
│   │       │   │   └── [aggregate]-[property].value-object.ts
│   │       │   └── [aggregate].ts
│   │       └── infra/
│   │           ├── controllers/
│   │           │   └── [verb]-[aggregate]-[http-method].controller.ts
│   │           ├── event-handlers/
│   │           ├── exceptions/
│   │           └── typeorm/
```

## License

MIT
