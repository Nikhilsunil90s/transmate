export interface ModelType {
  update_async: () => Promise<any>;
  create: () => Promise<any>;
}
