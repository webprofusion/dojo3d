export interface Model {
    id: string;
    name: string;
    attribution: string;
    path: string;
    category: string;
}

export interface ModelCatalog {
    categories: string[];
    models: Model[];
}