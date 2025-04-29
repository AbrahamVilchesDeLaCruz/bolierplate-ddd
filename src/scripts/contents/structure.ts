import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { BoundedContext, ModuleConfig, UseCaseConfig } from "../types/types";
import { capitalize, verbToNoun } from "../helpers/helpers";
import {
  createRequestDto,
  createResponseDto,
  createUseCase,
  createController,
  createEventHandler,
} from "./templates";

export async function createDirectoryStructure(boundedContext: BoundedContext) {
  const basePath = path.join("src", boundedContext.path, boundedContext.name);

  const layers = {
    app: "app",
    domain: "domain",
    infra: "infra",
  };

  const subDirs = {
    [layers.app]: ["use-cases"],
    [layers.domain]: ["event", "exceptions", "repository", "value-objects"],
    [layers.infra]: ["exceptions", "controllers", "framework", "typeorm", "event-handlers"],
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
      const requestDtoContent = createRequestDto(moduleConfig.name, nounForm);
      const responseDtoContent = createResponseDto(moduleConfig.name, nounForm);
      const useCaseContent = createUseCase(moduleConfig.name, nounForm);

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
        const controllerContent = createController(moduleConfig.name, nounForm, verbBase);

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
        const handlerContent = createEventHandler(
          moduleConfig.name,
          nounForm,
          verbBase,
          useCase.handlerName
        );

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
