import { Filters, type IAdminForthSingleFilter, type IAdminForthAndOrFilter } from "adminforth"
interface IFilter {
    name: string;
    icon?: string;
    enum?: {
        label: string;
        icon?: string;
        filters: () =>  IAdminForthSingleFilter | IAdminForthAndOrFilter | Promise<IAdminForthSingleFilter | IAdminForthAndOrFilter>;
    }[]; 
    searchInput?: (searchVal: string) =>  IAdminForthSingleFilter | IAdminForthAndOrFilter | Promise<IAdminForthSingleFilter | IAdminForthAndOrFilter>;
}
export interface PluginOptions {
    filters: IFilter[]
}
