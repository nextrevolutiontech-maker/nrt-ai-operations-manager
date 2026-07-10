export interface IToolHandler {
  name: string;
  description: string;
  module: string;
  requiredPermission: string;
  inputSchema: any;
  outputSchema: any;

  execute(args: any, context: any): Promise<any>;
}
