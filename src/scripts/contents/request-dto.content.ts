import { capitalize } from "../helpers";

export const createRequestDto = (name: string, nounForm: string): string => {
  return `import { Request } from '@shared/app/use-cases/request.ts'
export class Request${capitalize(name)}${capitalize(nounForm)} implements Request {
  // Add your request DTO properties here and implements Request shared interface
}`;
};
