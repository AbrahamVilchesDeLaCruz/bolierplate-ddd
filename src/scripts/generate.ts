import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

interface UseCaseConfig {
  name: string;
  implementationType: "endpoint" | "event-handler";
  httpMethod?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  eventName?: string;
  handlerName?: string;
}

interface ModuleConfig {
  name: string;
  useCases: UseCaseConfig[];
}

interface BoundedContext {
  name: string;
  path: string;
  modules: ModuleConfig[];
}

const program = new Command();

program
  .name("ddd-generator")
  .description("Generate DDD structure for a bounded context")
  .version("1.0.0");

// Función para convertir verbo a sustantivo
function verbToNoun(verb: string): string {
  const commonVerbs: Record<string, string> = {
    create: "creator",
    update: "updater",
    delete: "deleter",
    remove: "remover",
    get: "getter",
    find: "finder",
    search: "searcher",
    authenticate: "authenticator",
    authorize: "authorizer",
    validate: "validator",
    verify: "verifier",
    process: "processor",
    analyze: "analyzer",
    transform: "transformer",
    convert: "converter",
    manage: "manager",
    handle: "handler",
    execute: "executor",
    implement: "implementer",
    calculate: "calculator",
    compute: "computer",
    generate: "generator",
    modify: "modifier",
    notify: "notifier",
    observe: "observer",
    publish: "publisher",
    subscribe: "subscriber",
    send: "sender",
    receive: "receiver",
  };

  const verb_clean = verb.toLowerCase().trim();
  return commonVerbs[verb_clean] || `${verb_clean}r`; // Por defecto añadimos 'r' si no está en el mapa
}

async function createDirectoryStructure(boundedContext: BoundedContext) {
  const basePath = path.join("src", boundedContext.path, boundedContext.name);

  const layers = {
    app: "app",
    domain: "domain",
    infra: "infra",
  };

  const subDirs = {
    [layers.app]: ["use-cases"],
    [layers.domain]: ["event", "exceptions", "repository", "value-objects"],
    [layers.infra]: ["exceptions", "controllers", "framework", "typeorm", "handlers"],
  };

  // Crear módulos
  boundedContext.modules.forEach((moduleConfig) => {
    const moduleBase = path.join(basePath, moduleConfig.name);

    // Crear estructura por capa
    for (const [layer, subfolders] of Object.entries(subDirs)) {
      subfolders.forEach((folder) => {
        const fullPath = path.join(moduleBase, layer, folder);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
          console.log(chalk.blue(`📁 Creado: ${fullPath}`));
        }
      });
    }

    // Crear casos de uso
    moduleConfig.useCases.forEach((useCase) => {
      const verbBase = useCase.name.split("-")[0]; // Obtener el verbo base
      const nounForm = verbToNoun(verbBase); // Convertir a sustantivo

      // Crear estructura de carpetas para el caso de uso
      const useCasePath = path.join(moduleBase, "app", "use-cases", verbBase);
      const dtoPath = path.join(useCasePath, "dto");

      // Crear directorios
      fs.mkdirSync(dtoPath, { recursive: true });

      // Crear archivos DTO
      const requestDtoContent = `import { Request } from '@shared/app/use-cases/request.ts'
export class Request${capitalize(moduleConfig.name)}${capitalize(nounForm)} implements Request {
  // Add your request DTO properties here and implements Request shared interface
}`;

      const responseDtoContent = `import { Response } from '@shared/app/use-cases/response.ts'
export class Response${capitalize(moduleConfig.name)}${capitalize(nounForm)} implements Response {
  // Add your response DTO properties here and implements Response shared interface
}`;

      // Crear archivo de caso de uso
      const useCaseContent = `import { Request${capitalize(moduleConfig.name)}${capitalize(
        nounForm
      )} } from './dto/request-${moduleConfig.name.toLowerCase()}-${nounForm}.dto';
import { Response${capitalize(moduleConfig.name)}${capitalize(
        nounForm
      )} } from './dto/response-${moduleConfig.name.toLowerCase()}-${nounForm}.dto';
import { UseCase } from '@shared/app/use-cases/use-case.ts'

export class ${capitalize(moduleConfig.name)}${capitalize(nounForm)} implements UseCase {
  constructor() {}

  async execute(request: Request${capitalize(moduleConfig.name)}${capitalize(
        nounForm
      )}): Promise<Response${capitalize(moduleConfig.name)}${capitalize(nounForm)} | void> {
    // Implement your use case logic here
    throw new Error('Method not implemented.');
  }
}`;

      // Escribir archivos
      fs.writeFileSync(
        path.join(dtoPath, `request-${moduleConfig.name.toLowerCase()}-${nounForm}.dto.ts`),
        requestDtoContent
      );
      fs.writeFileSync(
        path.join(dtoPath, `response-${moduleConfig.name.toLowerCase()}-${nounForm}.dto.ts`),
        responseDtoContent
      );
      fs.writeFileSync(
        path.join(useCasePath, `${moduleConfig.name.toLowerCase()}-${nounForm}.use-case.ts`),
        useCaseContent
      );

      console.log(chalk.green(`✨ Created use case: ${moduleConfig.name}${capitalize(nounForm)}`));

      // Crear implementación según el tipo
      if (useCase.implementationType === "endpoint") {
        // Crear controller
        const controllerPath = path.join(moduleBase, "infra", "controllers");
        const controllerContent = `import { Request, Response } from 'express';
import { ${capitalize(moduleConfig.name)}${capitalize(
          nounForm
        )} } from '../../app/use-cases/${verbBase}/${moduleConfig.name.toLowerCase()}-${nounForm}.use-case';
import { Request${capitalize(moduleConfig.name)}${capitalize(
          nounForm
        )} } from '../../app/use-cases/${verbBase}/dto/request-${moduleConfig.name.toLowerCase()}-${nounForm}.dto';

export class ${capitalize(moduleConfig.name)}${capitalize(nounForm)}Controller {
  constructor(private readonly useCase: ${capitalize(moduleConfig.name)}${capitalize(nounForm)}) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const request = new Request${capitalize(moduleConfig.name)}${capitalize(nounForm)}();
      // Map request body to DTO
      // request.property = req.body.property;
      
      const result = await this.useCase.execute(request);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}`;

        fs.writeFileSync(
          path.join(controllerPath, `${moduleConfig.name.toLowerCase()}-${nounForm}.controller.ts`),
          controllerContent
        );
        console.log(
          chalk.green(
            `✨ Created controller: ${moduleConfig.name}${capitalize(nounForm)}Controller`
          )
        );
      } else if (useCase.implementationType === "event-handler") {
        // Crear event handler
        const handlerPath = path.join(moduleBase, "infra", "event-handlers");
        const handlerContent = `import { ${capitalize(moduleConfig.name)}${capitalize(
          nounForm
        )} } from '../../app/use-cases/${verbBase}/${moduleConfig.name.toLowerCase()}-${nounForm}.use-case';
import { Request${capitalize(moduleConfig.name)}${capitalize(
          nounForm
        )} } from '../../app/use-cases/${verbBase}/dto/request-${moduleConfig.name.toLowerCase()}-${nounForm}.dto';

export class ${capitalize(
          useCase.handlerName || `${moduleConfig.name}${capitalize(nounForm)}Handler`
        )} {
  constructor(private readonly useCase: ${capitalize(moduleConfig.name)}${capitalize(nounForm)}) {}

  async handle(event: any): Promise<void> {
    try {
      const request = new Request${capitalize(moduleConfig.name)}${capitalize(nounForm)}();
      // Map event data to DTO
      // request.property = event.property;
      
      await this.useCase.execute(request);
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }
}`;

        fs.writeFileSync(
          path.join(
            handlerPath,
            `${
              useCase.handlerName?.toLowerCase() || `${moduleConfig.name.toLowerCase()}-${nounForm}`
            }.handler.ts`
          ),
          handlerContent
        );
        console.log(
          chalk.green(
            `✨ Created event handler: ${capitalize(
              useCase.handlerName || `${moduleConfig.name}${capitalize(nounForm)}Handler`
            )}`
          )
        );
      }
    });
  });
}

// Utilidad para capitalizar el nombre del use case
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function promptUseCaseDetails(useCaseName: string): Promise<UseCaseConfig> {
  const { implementationType } = await inquirer.prompt([
    {
      type: "list",
      name: "implementationType",
      message: `How is the use case "${useCaseName}" implemented?`,
      choices: ["endpoint", "event-handler"],
    },
  ]);

  if (implementationType === "endpoint") {
    const { httpMethod } = await inquirer.prompt([
      {
        type: "list",
        name: "httpMethod",
        message: `What HTTP method is used for the "${useCaseName}" endpoint?`,
        choices: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
    ]);
    return { name: useCaseName, implementationType, httpMethod };
  } else {
    const { eventName, handlerName } = await inquirer.prompt([
      {
        type: "input",
        name: "eventName",
        message: `What event triggers the "${useCaseName}" handler?`,
        default: `${useCaseName}-event`,
      },
      {
        type: "input",
        name: "handlerName",
        message: `What is the name of the handler for "${useCaseName}"?`,
        default: `${useCaseName}-handler`,
      },
    ]);
    return { name: useCaseName, implementationType, eventName, handlerName };
  }
}

async function promptBoundedContext(): Promise<BoundedContext> {
  const { boundedContextName, boundedContextPath, rawModules } = await inquirer.prompt([
    {
      type: "input",
      name: "boundedContextName",
      message: "What is the name of your bounded context?",
      validate: (input: string) => (input.length > 0 ? true : "Bounded context name is required"),
    },
    {
      type: "input",
      name: "boundedContextPath",
      message: "Where should the bounded context be placed? (relative to src/)",
      default: ".",
    },
    {
      type: "input",
      name: "rawModules",
      message: "What modules do you want to create? (comma-separated, or press Enter for default)",
    },
  ]);

  let modules: ModuleConfig[] = [];

  if (!rawModules.trim()) {
    // Un solo módulo por defecto
    const { useCasesRaw } = await inquirer.prompt([
      {
        type: "input",
        name: "useCasesRaw",
        message: `Enter use cases for the default module (semicolon-separated):`,
      },
    ]);

    const useCaseNames = useCasesRaw
      .split(";")
      .map((uc: string) => uc.trim())
      .filter(Boolean);

    const useCases: UseCaseConfig[] = [];
    for (const useCaseName of useCaseNames) {
      const useCaseDetails = await promptUseCaseDetails(useCaseName);
      useCases.push(useCaseDetails);
    }

    modules.push({
      name: "default",
      useCases,
    });
  } else {
    const moduleNames = rawModules
      .split(/[,-]/) // Split by both comma and hyphen
      .map((m: string) => m.trim())
      .filter(Boolean);

    for (const mod of moduleNames) {
      const { useCasesRaw } = await inquirer.prompt([
        {
          type: "input",
          name: "useCasesRaw",
          message: `Enter use cases for module "${mod}" (semicolon-separated):`,
        },
      ]);

      const useCaseNames = useCasesRaw
        .split(";")
        .map((uc: string) => uc.trim())
        .filter(Boolean);

      const useCases: UseCaseConfig[] = [];
      for (const useCaseName of useCaseNames) {
        const useCaseDetails = await promptUseCaseDetails(useCaseName);
        useCases.push(useCaseDetails);
      }

      modules.push({
        name: mod,
        useCases,
      });
    }
  }

  return {
    name: boundedContextName,
    path: boundedContextPath,
    modules,
  };
}

async function main() {
  try {
    const boundedContext = await promptBoundedContext();
    await createDirectoryStructure(boundedContext);
    console.log(chalk.green("✨ DDD structure created successfully!"));
  } catch (error) {
    console.error(chalk.red("Error creating DDD structure:"), error);
    process.exit(1);
  }
}

main();
