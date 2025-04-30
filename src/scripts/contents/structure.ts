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
  createValueObject,
  createRepository,
  createAggregate,
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

    // Create value objects if specified
    if (moduleConfig.valueObjects && moduleConfig.valueObjects.length > 0) {
      const valueObjectsPath = path.join(moduleBase, "domain", "value-objects");

      moduleConfig.valueObjects.forEach((valueObject) => {
        const valueObjectContent = createValueObject(moduleConfig.agregateName, valueObject);
        const fileName = `${moduleConfig.agregateName.toLowerCase()}-${valueObject.toLowerCase()}.value-object.ts`;
        const filePath = path.join(valueObjectsPath, fileName);

        fs.writeFileSync(filePath, valueObjectContent);
        console.log(
          chalk.green(
            `✨ Created value object: ${moduleConfig.agregateName}${capitalize(valueObject)}`
          )
        );
      });
    }

    // Create repository if specified
    if (moduleConfig.createRepository) {
      const repositoryPath = path.join(moduleBase, "domain", "repository");
      const repositoryContent = createRepository(moduleConfig.agregateName);
      const fileName = `${moduleConfig.agregateName.toLowerCase()}.repository.ts`;
      const filePath = path.join(repositoryPath, fileName);

      fs.writeFileSync(filePath, repositoryContent);
      console.log(chalk.green(`✨ Created repository: ${moduleConfig.agregateName}Repository`));
    }

    // Create aggregate
    const domainPath = path.join(moduleBase, "domain");
    const aggregateContent = createAggregate(moduleConfig.agregateName, moduleConfig.valueObjects);
    const aggregateFileName = `${moduleConfig.agregateName.toLowerCase()}.ts`;
    const aggregateFilePath = path.join(domainPath, aggregateFileName);

    fs.writeFileSync(aggregateFilePath, aggregateContent);
    console.log(chalk.green(`✨ Created aggregate: ${moduleConfig.agregateName}`));

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
      const requestDtoContent = createRequestDto(
        moduleConfig.name,
        moduleConfig.agregateName,
        nounForm
      );
      const responseDtoContent = createResponseDto(
        moduleConfig.name,
        moduleConfig.agregateName,
        nounForm
      );
      const useCaseContent = createUseCase(moduleConfig.name, moduleConfig.agregateName, nounForm);

      // Escribir archivos
      fs.writeFileSync(
        path.join(dtoPath, `request-${moduleConfig.agregateName.toLowerCase()}-${nounForm}.dto.ts`),
        requestDtoContent
      );
      fs.writeFileSync(
        path.join(
          dtoPath,
          `response-${moduleConfig.agregateName.toLowerCase()}-${nounForm}.dto.ts`
        ),
        responseDtoContent
      );
      fs.writeFileSync(
        path.join(
          useCasePath,
          `${moduleConfig.agregateName.toLowerCase()}-${nounForm}.use-case.ts`
        ),
        useCaseContent
      );

      console.log(
        chalk.green(`✨ Created use case: ${moduleConfig.agregateName}${capitalize(nounForm)}`)
      );

      // Crear implementación según el tipo
      if (useCase.implementationType === "endpoint") {
        // Crear controller
        const controllerPath = path.join(moduleBase, "infra", "controllers");
        const controllerContent = createController(
          moduleConfig.name,
          moduleConfig.agregateName,
          nounForm,
          verbBase,
          useCase.httpMethod!
        );

        fs.writeFileSync(
          path.join(
            controllerPath,
            `${verbBase}-${moduleConfig.agregateName.toLowerCase()}-${useCase.httpMethod!.toLowerCase()}.controller.ts`
          ),
          controllerContent
        );
        console.log(
          chalk.green(
            `✨ Created controller: ${moduleConfig.agregateName}${capitalize(nounForm)}Controller`
          )
        );
      } else if (useCase.implementationType === "event-handler") {
        // Crear event handler
        const handlerPath = path.join(moduleBase, "infra", "event-handlers");
        const handlerContent = createEventHandler(
          moduleConfig.name,
          moduleConfig.agregateName,
          nounForm,
          verbBase,
          useCase.handlerName
        );

        fs.writeFileSync(
          path.join(
            handlerPath,
            `${
              useCase.handlerName?.toLowerCase() ||
              `${moduleConfig.agregateName.toLowerCase()}-${nounForm}`
            }.handler.ts`
          ),
          handlerContent
        );
        console.log(
          chalk.green(
            `✨ Created event handler: ${capitalize(
              useCase.handlerName || `${moduleConfig.agregateName}${capitalize(nounForm)}Handler`
            )}`
          )
        );
      }
    });
  });
}
