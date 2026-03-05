import { Table } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Database } from '@phosphor-icons/react';

interface RelationshipsProps {
  tables: Table[];
}

export function Relationships({ tables }: RelationshipsProps) {
  const relationships = tables.flatMap(table =>
    table.columns
      .filter(col => col.isForeignKey && col.foreignKeyRef)
      .map(col => ({
        fromTable: table.name,
        fromColumn: col.name,
        toTable: col.foreignKeyRef!.table,
        toColumn: col.foreignKeyRef!.column,
      }))
  );

  const getTableDescription = (tableName: string) => {
    return tables.find(t => t.name === tableName)?.description || '';
  };

  const groupedByTable = relationships.reduce((acc, rel) => {
    if (!acc[rel.fromTable]) {
      acc[rel.fromTable] = [];
    }
    acc[rel.fromTable].push(rel);
    return acc;
  }, {} as Record<string, typeof relationships>);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/10 border-accent/20">
        <h3 className="font-semibold mb-2 text-accent-foreground">Foreign Key Relationships</h3>
        <p className="text-sm text-muted-foreground">
          This view shows all foreign key relationships in the database. Foreign keys connect tables
          together and are essential for JOIN queries.
        </p>
      </Card>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {Object.entries(groupedByTable).map(([tableName, rels]) => (
            <Card key={tableName} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Database size={24} className="text-primary" weight="duotone" />
                <div>
                  <h3 className="font-semibold font-mono text-lg">{tableName}</h3>
                  {getTableDescription(tableName) && (
                    <p className="text-sm text-muted-foreground">{getTableDescription(tableName)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {rels.map((rel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {rel.fromTable}
                        </Badge>
                        <code className="text-sm font-mono font-medium">{rel.fromColumn}</code>
                      </div>
                    </div>

                    <ArrowRight size={20} className="text-accent flex-shrink-0" weight="bold" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="font-mono text-xs">
                          {rel.toTable}
                        </Badge>
                        <code className="text-sm font-mono font-medium">{rel.toColumn}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {relationships.length === 0 && (
            <Card className="p-12 text-center">
              <Database size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No foreign key relationships found in the schema.</p>
            </Card>
          )}
        </div>
      </ScrollArea>

      {relationships.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-semibold text-sm mb-2">Using Relationships in Queries</h4>
          <p className="text-sm text-muted-foreground mb-3">
            To join tables using these foreign keys, use SQL JOIN syntax:
          </p>
          <pre className="bg-card p-3 rounded border text-xs font-mono overflow-x-auto">
{`SELECT t1.column1, t2.column2
FROM table1 t1
JOIN table2 t2 ON t1.foreign_key = t2.primary_key;`}
          </pre>
        </Card>
      )}
    </div>
  );
}
