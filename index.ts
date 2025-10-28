import { AdminForthPlugin } from "adminforth";
import type { IAdminForth, IHttpServer, AdminForthResourcePages, AdminForthResourceColumn, AdminForthDataTypes, AdminForthResource, AdminForthComponentDeclaration } from "adminforth";
import type { PluginOptions } from './types.js';


export default class  extends AdminForthPlugin {
  options: PluginOptions;

  constructor(options: PluginOptions) {
    super(options, import.meta.url);
    this.options = options;
  }

  async modifyResourceConfig(adminforth: IAdminForth, resourceConfig: AdminForthResource) {
    super.modifyResourceConfig(adminforth, resourceConfig);
  
    // simply modify resourceConfig or adminforth.config. You can get access to plugin options via this.options;
    if ( !resourceConfig.options.pageInjections ) {
      resourceConfig.options.pageInjections = {};
    }
    if ( !resourceConfig.options.pageInjections.list ) {
      resourceConfig.options.pageInjections.list = {};
    }
    if ( !resourceConfig.options.pageInjections.list.afterBreadcrumbs ) {
      resourceConfig.options.pageInjections.list.afterBreadcrumbs = [];
    }
    (resourceConfig.options.pageInjections.list.afterBreadcrumbs as AdminForthComponentDeclaration[]).push(
      { file: this.componentPath('FiltersArea.vue'), meta: { pluginInstanceId: this.pluginInstanceId, resourceId: this.resourceConfig.resourceId, options: this.options } }
    );
  }
  
  validateConfigAfterDiscover(adminforth: IAdminForth, resourceConfig: AdminForthResource) {
    // optional method where you can safely check field types after database discovery was performed
  }

  instanceUniqueRepresentation(pluginOptions: any) : string {
    // optional method to return unique string representation of plugin instance. 
    // Needed if plugin can have multiple instances on one resource 
    return `single`;
  }

  setupEndpoints(server: IHttpServer) {
    server.endpoint({
      method: 'POST',
      path: `/plugin/${this.pluginInstanceId}/example`,
      handler: async ({ body }) => {
        const { name } = body;
        return { hey: `Hello ${name}` };
      }
    });
  }

}