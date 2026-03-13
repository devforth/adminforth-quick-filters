import { Filters, type IAdminForthSingleFilter } from "adminforth"
interface IFilter {
    name: string;
    icon?: string;
    enum?: {
        label: string;
        icon?: string;
        filters: () =>  IAdminForthSingleFilter | Promise<IAdminForthSingleFilter>;
    }[]; 
    searchInput?: (searchVal: string) =>  IAdminForthSingleFilter | Promise<IAdminForthSingleFilter>;
}
export interface PluginOptions {
    filters: IFilter[]
}
