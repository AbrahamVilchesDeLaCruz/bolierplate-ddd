import { capitalize } from "../helpers/helpers";

export function createRequestDto(moduleName: string, nounForm: string): string {
  return `import { Request } from '@shared/app/use-cases/request.ts'
export class Request${capitalize(moduleName)}${capitalize(nounForm)} implements Request {
  // Add your request DTO properties here and implements Request shared interface
}`;
}

export function createResponseDto(moduleName: string, nounForm: string): string {
  return `import { Response } from '@shared/app/use-cases/response.ts'
export class Response${capitalize(moduleName)}${capitalize(nounForm)} implements Response {
  // Add your response DTO properties here and implements Response shared interface
}`;
}

export function createUseCase(moduleName: string, nounForm: string): string {
  return `import { Request${capitalize(moduleName)}${capitalize(
    nounForm
  )} } from './dto/request-${moduleName.toLowerCase()}-${nounForm}.dto';
import { Response${capitalize(moduleName)}${capitalize(
    nounForm
  )} } from './dto/response-${moduleName.toLowerCase()}-${nounForm}.dto';
import { UseCase } from '@shared/app/use-cases/use-case.ts'

export class ${capitalize(moduleName)}${capitalize(nounForm)} implements UseCase {
  constructor() {}

  async execute(request: Request${capitalize(moduleName)}${capitalize(
    nounForm
  )}): Promise<Response${capitalize(moduleName)}${capitalize(nounForm)} | void> {
    // Implement your use case logic here
    throw new Error('Method not implemented.');
  }
}`;
}

export function createController(moduleName: string, nounForm: string, verbBase: string): string {
  return `import { Request, Response } from 'express';
import { ${capitalize(moduleName)}${capitalize(
    nounForm
  )} } from '../../app/use-cases/${verbBase}/${moduleName.toLowerCase()}-${nounForm}.use-case';
import { Request${capitalize(moduleName)}${capitalize(
    nounForm
  )} } from '../../app/use-cases/${verbBase}/dto/request-${moduleName.toLowerCase()}-${nounForm}.dto';

export class ${capitalize(moduleName)}${capitalize(nounForm)}Controller {
  constructor(private readonly useCase: ${capitalize(moduleName)}${capitalize(nounForm)}) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const request = new Request${capitalize(moduleName)}${capitalize(nounForm)}();
      // Map request body to DTO
      // request.property = req.body.property;
      
      const result = await this.useCase.execute(request);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}`;
}

export function createEventHandler(
  moduleName: string,
  nounForm: string,
  verbBase: string,
  handlerName?: string
): string {
  return `import { ${capitalize(moduleName)}${capitalize(
    nounForm
  )} } from '../../app/use-cases/${verbBase}/${moduleName.toLowerCase()}-${nounForm}.use-case';
import { Request${capitalize(moduleName)}${capitalize(
    nounForm
  )} } from '../../app/use-cases/${verbBase}/dto/request-${moduleName.toLowerCase()}-${nounForm}.dto';

export class ${capitalize(handlerName || `${moduleName}${capitalize(nounForm)}Handler`)} {
  constructor(private readonly useCase: ${capitalize(moduleName)}${capitalize(nounForm)}) {}

  async handle(event: any): Promise<void> {
    try {
      const request = new Request${capitalize(moduleName)}${capitalize(nounForm)}();
      // Map event data to DTO
      // request.property = event.property;
      
      await this.useCase.execute(request);
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }
}`;
}
