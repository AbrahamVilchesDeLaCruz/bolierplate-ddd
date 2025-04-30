import inquirer from "inquirer";
import { BoundedContext, ModuleConfig, UseCaseConfig } from "../types/types";

export const promptUseCaseDetails = async (useCaseName: string): Promise<UseCaseConfig> => {
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
};

export const promptBoundedContext = async (): Promise<BoundedContext> => {
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
    const moduleConfig = await getModuleConfig("default");
    modules.push(moduleConfig);
  } else {
    const moduleNames = rawModules
      .split(/[,-]/) // Split by both comma and hyphen
      .map((m: string) => m.trim())
      .filter(Boolean);

    for (const mod of moduleNames) {
      const moduleConfig = await getModuleConfig(mod);
      modules.push(moduleConfig);
    }
  }

  return {
    name: boundedContextName,
    path: boundedContextPath,
    modules,
  };
};

const getModuleConfig = async (moduleName: string): Promise<ModuleConfig> => {
  const { agregateName, useCasesRaw } = await agregateNameAndUseCases(moduleName);

  const { createValueObjects } = await inquirer.prompt([
    {
      type: "confirm",
      name: "createValueObjects",
      message: `Do you want to create value objects for "${agregateName}" aggregate?`,
      default: true,
    },
  ]);

  let valueObjects: string[] = [];
  if (createValueObjects) {
    const { valueObjectsRaw } = await inquirer.prompt([
      {
        type: "input",
        name: "valueObjectsRaw",
        message: `Enter value objects for "${agregateName}" (semicolon-separated, e.g. name;description;email):`,
      },
    ]);

    valueObjects = valueObjectsRaw
      .split(";")
      .map((vo: string) => vo.trim())
      .filter(Boolean);
  }

  const { createRepository } = await inquirer.prompt([
    {
      type: "confirm",
      name: "createRepository",
      message: `Do you want to create a repository for "${agregateName}" aggregate?`,
      default: true,
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

  return {
    name: moduleName,
    agregateName,
    useCases,
    valueObjects,
    createRepository,
  };
};

const agregateNameAndUseCases = async (moduleName: string) => {
  const { agregateName, useCasesRaw } = await inquirer.prompt([
    {
      type: "input",
      name: "agregateName",
      message: `What is the aggregate name for module "${moduleName}"?`,
      validate: (input: string) => (input.length > 0 ? true : "Aggregate name is required"),
    },
    {
      type: "input",
      name: "useCasesRaw",
      message: `Enter use cases for module "${moduleName}" (semicolon-separated):`,
    },
  ]);

  return { agregateName, useCasesRaw };
};
