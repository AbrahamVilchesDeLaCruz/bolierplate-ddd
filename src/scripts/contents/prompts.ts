import inquirer from "inquirer";
import { BoundedContext, ModuleConfig, UseCaseConfig } from "../types/types";

export async function promptUseCaseDetails(useCaseName: string): Promise<UseCaseConfig> {
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

export async function promptBoundedContext(): Promise<BoundedContext> {
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
