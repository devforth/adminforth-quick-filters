export interface Filter {
  name: string,
  icon?: string,
  enum?: { label: string, icon?: string }[],
  hasSearchInput?: boolean
}