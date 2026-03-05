export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKeyRef?: {
    table: string;
    column: string;
  };
  description?: string;
}

export interface Table {
  name: string;
  schema: string;
  columns: Column[];
  description?: string;
}

export interface SchemaData {
  tables: Table[];
}

export interface QueryExample {
  title: string;
  description: string;
  sql: string;
  category: string;
}
