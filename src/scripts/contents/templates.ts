import { capitalize } from "../helpers/helpers";

export const createRequestDto = (
  moduleName: string,
  agregateName: string,
  useCase: string
): string => {
  return `
    import { Request } from '@shared/app/use-cases/request.ts'
    
    export class Request${capitalize(agregateName)}${capitalize(useCase)} implements Request {
    // Add your request DTO properties here and implements Request shared interface
    }
  `;
};

export const createResponseDto = (
  moduleName: string,
  agregateName: string,
  useCase: string
): string => {
  return `
    import { Response } from '@shared/app/use-cases/response.ts'
    
    export class Response${capitalize(agregateName)}${capitalize(useCase)} implements Response {
      // Add your response DTO properties here and implements Response shared interface
    }
  `;
};

export const createUseCase = (
  moduleName: string,
  agregateName: string,
  useCase: string
): string => {
  const agregateCap = capitalize(agregateName);
  const agregateLow = agregateName.toLowerCase();
  const nounCap = capitalize(useCase);

  return `
      import { Request${agregateCap}${nounCap} } from './dto/request-${agregateLow}-${useCase}.dto';
      import { Response${agregateCap}${nounCap} } from './dto/response-${agregateLow}-${useCase}.dto';
      import { UseCase } from '@shared/app/use-cases/use-case.ts'

      export class ${agregateCap}${nounCap} implements UseCase {
        constructor() {}

      async execute(request: Request${agregateCap}${nounCap}): Promise<Response${agregateCap}${nounCap} | void> {
        // Implement your use case logic here
        throw new Error('Method not implemented.');
      }
    }
  `;
};

export const createController = (
  moduleName: string,
  agregateName: string,
  useCase: string,
  verbBase: string,
  httpMethod: string
): string => {
  const agregateCap = capitalize(agregateName);
  const agregateLow = agregateName.toLowerCase();
  const useCaseCap = capitalize(useCase);
  const useCaseLow = useCase.toLowerCase();

  return `
    import { ${agregateCap}${useCaseCap} } from '../../app/use-cases/${verbBase}/${agregateLow}-${useCase}.use-case';
    import { Request${agregateCap}${useCaseCap} } from '../../app/use-cases/${verbBase}/dto/request-${agregateLow}-${useCase}.dto';

    export class ${agregateCap}${useCaseCap}${capitalize(httpMethod)}Controller {
      constructor(private readonly ${useCaseLow}: ${agregateCap}${useCaseCap}) {}

      // add manually the route to the controller and the request 
      async handle(): Promise<void> {
        try {
          const result = await this.${useCaseLow}.execute(new Request${agregateCap}${useCaseCap}());
          
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
    }`;
};

export const createEventHandler = (
  moduleName: string,
  agregateName: string,
  nounForm: string,
  verbBase: string,
  handlerName?: string
): string => {
  const agregateCap = capitalize(agregateName);
  const nounCap = capitalize(nounForm);
  const handlerCap = capitalize(`${agregateName}${nounCap}On${capitalize(handlerName!)}Handler`);
  const agregateLow = agregateName.toLowerCase();
  const useCaseLow = nounForm.toLowerCase();

  return `
    import { ${agregateCap}${nounCap} } from '../../app/use-cases/${verbBase}/${agregateLow}-${nounForm}.use-case';
    import { Request${agregateCap}${nounCap} } from '../../app/use-cases/${verbBase}/dto/request-${agregateLow}-${nounForm}.dto';

    export class ${handlerCap} implements Handler {
      constructor(private readonly ${useCaseLow}: ${agregateCap}${nounCap}) {}

      async handle(): Promise<void> {
        throw new Error('Method not implemented.');
    }
  `;
};
