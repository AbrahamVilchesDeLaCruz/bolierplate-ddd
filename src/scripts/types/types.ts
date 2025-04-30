export interface UseCaseConfig {
  name: string;
  implementationType: "endpoint" | "event-handler";
  httpMethod?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  eventName?: string;
  handlerName?: string;
}

export interface ModuleConfig {
  name: string;
  agregateName: string;
  useCases: UseCaseConfig[];
}

export interface BoundedContext {
  name: string;
  path: string;
  modules: ModuleConfig[];
}
