# DDD Boilerplate Generator

This is a TypeScript boilerplate generator for creating Domain-Driven Design (DDD) structures. It helps you set up a new bounded context with all the necessary folders and files following DDD principles.

## Installation

```bash
npm install
```

## Usage

To generate a new DDD structure, run:

```bash
npm run generate
```

The generator will ask you for:

1. The name of your bounded context
2. The path where you want to place it (relative to src/)
3. The modules you want to create (comma-separated)
4. The use cases you want to create (comma-separated)

## Generated Structure

The generator will create the following structure:

```
your-bounded-context/
├── app/
│   └── use-cases/
│       └── your-module/
│           ├── dto/
│           │   ├── request-your-module.dto.ts
│           │   └── response-your-module.dto.ts
│           └── your-module.use-case.ts
├── domain/
│   ├── event/
│   ├── exceptions/
│   ├── repository/
│   ├── value-object/
│   └── user.ts
└── infra/
    ├── controllers/
    │   └── payloads/
    ├── exceptions/
    ├── framework/
    └── typeorm/
        ├── entity/
        ├── mapper/
        └── repository/
```

## Development

To build the project:

```bash
npm run build
```

To run the project:

```bash
npm start
```
