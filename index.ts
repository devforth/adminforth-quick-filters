import { AdminForthPlugin } from "adminforth";
import type { IAdminForth, AdminForthResource, AdminForthComponentDeclaration } from "adminforth";
import { AdminForthFilterOperators } from "adminforth";
import type { PluginOptions } from './types.js';

export default class  extends AdminForthPlugin {
  options: PluginOptions;
  
  constructor(options: PluginOptions) {
    super(options, import.meta.url);
    this.options = options;
  }

  async modifyResourceConfig(adminforth: IAdminForth, resourceConfig: AdminForthResource) {
    super.modifyResourceConfig(adminforth, resourceConfig);
  
    const frontendOptions = this.options.filters.map(f => {
      if (!f.enum && !f.searchInput) {
        throw new Error(`Filter ${f.name} should have either enum or searchInput property`);
      }
      if (f.enum && f.searchInput) {
        throw new Error(`Filter ${f.name} should not have both enum and searchInput properties, choose one of them`);
      }
      return {
        name: f.name,
        icon: f.icon,
        enum: f.enum ? f.enum.map(e => ({ label: e.label, icon: e.icon })) : undefined,
        hasSearchInput: !!f.searchInput,
      };
    });
    // simply modify resourceConfig or adminforth.config. You can get access to plugin options via this.options;
    if ( !resourceConfig.options.pageInjections ) {
      resourceConfig.options.pageInjections = {};
    }
    if ( !resourceConfig.options.pageInjections.list ) {
      resourceConfig.options.pageInjections.list = {};
    }
    if ( !resourceConfig.options.pageInjections.list.beforeActionButtons ) {
      resourceConfig.options.pageInjections.list.beforeActionButtons = [];
    }
    (resourceConfig.options.pageInjections.list.beforeActionButtons as AdminForthComponentDeclaration[]).push(
      { 
        file: this.componentPath('FiltersArea.vue'), 
        meta: {
          pluginInstanceId: this.pluginInstanceId, 
          resourceId: this.resourceConfig.resourceId, 
          options: frontendOptions
        } 
      }
    );

    const normalizeFilterValue = (filters: any[]) => {
      const filtersToReturn = [];
      const normalizedFilters = Array.isArray(filters) ? filters : [];
      for (const filter of normalizedFilters) {
        if (filter.field?.startsWith('_universal_search_')) {
          const searchTerm = filter.value as string;
          if (!searchTerm) continue;
          const searchFieldName = filter.field.replace('_universal_search_', '');
          const filterFromSearch = this.options.filters.find(f => f.name === searchFieldName)?.searchInput?.(searchTerm) || { field: searchFieldName, operator: AdminForthFilterOperators.EQ, value: searchTerm }; 
          filtersToReturn.push(filterFromSearch);
        } else if (filter.field?.startsWith('_qf_')) {
          const quickFilter = this.options.filters.find(f => `_qf_${f.name}` === filter.field);
          if (quickFilter?.enum) {
            const enumOption = quickFilter.enum.find(e => e.label === filter.value);
            if (enumOption) {
              const filterFromEnum = enumOption.filters();
              filtersToReturn.push(filterFromEnum);
            }
          }
        } else {
          filtersToReturn.push(filter);
        }
      }
      return filtersToReturn;
    } 
    
    const transformer = async ({ query }: { query: any }) => {
      const normalizedFilters = normalizeFilterValue(query.filters);
      query.filters = normalizedFilters;
      return { ok: true, error: '' };
    };

    const originalBefore = this.resourceConfig.hooks.list.beforeDatasourceRequest;

    if (!originalBefore) {
      this.resourceConfig.hooks.list.beforeDatasourceRequest = [transformer];
    } else if (Array.isArray(originalBefore)) {
      originalBefore.push(transformer);
      this.resourceConfig.hooks.list.beforeDatasourceRequest = originalBefore;
    } else {
      this.resourceConfig.hooks.list.beforeDatasourceRequest = [originalBefore, transformer];
    }
  }
  
  validateConfigAfterDiscover(adminforth: IAdminForth, resourceConfig: AdminForthResource) {

  }

  instanceUniqueRepresentation(pluginOptions: any) : string {
    // optional method to return unique string representation of plugin instance. 
    // Needed if plugin can have multiple instances on one resource 
    return `${this.resourceConfig.resourceId}-quick-filters`;
  }

}