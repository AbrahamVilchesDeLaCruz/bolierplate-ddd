# DDD Code Generator

A CLI tool to generate Domain-Driven Design structure for bounded contexts.

GitHub: [https://github.com/AbrahamVilchesDeLaCruz/bolierplate-ddd](https://github.com/AbrahamVilchesDeLaCruz/bolierplate-ddd)

## Installation

```bash
# Install as a dev dependency in your project
npm install --save-dev ddd-code-generator
```

## Usage
### Without Install
```bash
# You could also use directly without install
npx ddd-code-generator
```

### CLI

```bash
# Generate DDD structure using interactive prompts
ddd-gen
```

### Add to npm scripts

Add the following to your package.json:

```json
"scripts": {
  "generate:ddd": "ddd-gen",
}
```

Then run commands with:

```bash
npm run generate:ddd
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
│   ├── domain/
│   │   ├── event/
│   │   ├── exceptions/
│   │   ├── repository/
│   │       └── [aggregate].repository.ts
│   │   ├── value-objects/
│   │       └── [aggregate]-[property].value-object.ts
│   │   └── [aggregate].ts
│   ├── infra/
│   │   ├── controllers/
│   │       └── [verb]-[aggregate]-[http-method].controller.ts
│   │   ├── event-handlers/
│   │   ├── exceptions/
│   │   └── typeorm/
```

## License

MIT

## Contributing

We welcome contributions!
Since this is a public repository, feel free to:

- Open issues to report bugs or suggest features.
- Fork the project and submit a Pull Request (PR) with your improvements.

Note: All changes must go through a pull request. Direct edits to the main branch are restricted.

Please follow standard GitHub flow: fork → commit → PR → review → merge.
