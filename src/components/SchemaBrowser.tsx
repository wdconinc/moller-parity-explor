import { useState } from 'react';
import { Table } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MagnifyingGlass, CaretDown, CaretRight, Table as TableIcon, Columns } from '@phosphor-icons/react';

interface SchemaBrowserProps {
  tables: Table[];
}

function getTypeColor(type: string): string {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('int') || lowerType.includes('serial') || lowerType.includes('numeric')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  if (lowerType.includes('char') || lowerType.includes('text')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (lowerType.includes('bool')) {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  if (lowerType.includes('time') || lowerType.includes('date')) {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

export function SchemaBrowser({ tables }: SchemaBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTable = (tableName: string) => {
    setOpenTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableName)) {
        newSet.delete(tableName);
      } else {
        newSet.add(tableName);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-3">
          {filteredTables.map((table) => (
            <Card key={table.name} className="overflow-hidden">
              <Collapsible open={openTables.has(table.name)} onOpenChange={() => toggleTable(table.name)}>
                <CollapsibleTrigger className="w-full">
                  <div className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {openTables.has(table.name) ? (
                        <CaretDown size={20} className="text-primary" weight="bold" />
                      ) : (
                        <CaretRight size={20} className="text-muted-foreground" weight="bold" />
                      )}
                      <TableIcon size={24} className="text-primary" weight="duotone" />
                      <div className="text-left">
                        <h3 className="font-semibold text-lg font-mono">{table.name}</h3>
                        {table.description && (
                          <p className="text-sm text-muted-foreground">{table.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {table.columns.length} columns
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t">
                    <div className="p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Columns size={18} className="text-primary" weight="bold" />
                        <h4 className="font-semibold text-sm">Columns</h4>
                      </div>
                      <div className="space-y-2">
                        {table.columns.map((column) => (
                          <div
                            key={column.name}
                            className="flex items-start justify-between gap-4 p-3 bg-card rounded-md border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="font-mono font-medium text-sm">{column.name}</code>
                                {column.isPrimaryKey && (
                                  <Badge variant="default" className="text-xs">PK</Badge>
                                )}
                                {column.isForeignKey && (
                                  <Badge variant="outline" className="text-xs">FK</Badge>
                                )}
                              </div>
                              {column.description && (
                                <p className="text-xs text-muted-foreground">{column.description}</p>
                              )}
                              {column.foreignKeyRef && (
                                <p className="text-xs text-accent-foreground mt-1">
                                  → {column.foreignKeyRef.table}.{column.foreignKeyRef.column}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <Badge className={`font-mono text-xs ${getTypeColor(column.type)}`}>
                                {column.type}
                              </Badge>
                              {!column.nullable && (
                                <Badge variant="secondary" className="text-xs">NOT NULL</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
          {filteredTables.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <TableIcon size={48} className="mx-auto mb-3 opacity-50" />
              <p>No tables found matching your search.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
