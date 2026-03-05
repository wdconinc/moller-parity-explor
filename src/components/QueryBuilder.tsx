import { useState } from 'react';
import { Table } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, Trash, Lightning } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface QueryBuilderProps {
  tables: Table[];
}

export function QueryBuilder({ tables }: QueryBuilderProps) {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [generatedSQL, setGeneratedSQL] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentTable = tables.find(t => t.name === selectedTable);

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedColumns(new Set());
    setGeneratedSQL('');
  };

  const handleColumnToggle = (columnName: string) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnName)) {
        newSet.delete(columnName);
      } else {
        newSet.add(columnName);
      }
      return newSet;
    });
  };

  const generateQuery = () => {
    if (!currentTable || selectedColumns.size === 0) {
      toast.error('Please select a table and at least one column');
      return;
    }

    const columns = Array.from(selectedColumns).join(',\n       ');
    const sql = `SELECT ${columns}\nFROM ${currentTable.name}\nLIMIT 100;`;
    setGeneratedSQL(sql);
    toast.success('Query generated!');
  };

  const selectAllColumns = () => {
    if (currentTable) {
      setSelectedColumns(new Set(currentTable.columns.map(c => c.name)));
    }
  };

  const clearSelection = () => {
    setSelectedColumns(new Set());
    setGeneratedSQL('');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSQL);
      setCopied(true);
      toast.success('Query copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightning size={20} className="text-accent" weight="duotone" />
            Select Table
          </h3>
          <Select value={selectedTable} onValueChange={handleTableChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a table..." />
            </SelectTrigger>
            <SelectContent>
              {tables.map(table => (
                <SelectItem key={table.name} value={table.name} className="font-mono">
                  {table.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentTable?.description && (
            <p className="text-sm text-muted-foreground mt-2">{currentTable.description}</p>
          )}
        </Card>

        {currentTable && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Select Columns</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <Trash size={16} />
                </Button>
              </div>
            </div>
            <Separator className="mb-3" />
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {currentTable.columns.map(column => (
                  <div
                    key={column.name}
                    className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={column.name}
                      checked={selectedColumns.has(column.name)}
                      onCheckedChange={() => handleColumnToggle(column.name)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={column.name}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-mono text-sm font-medium">{column.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {column.type}
                        {!column.nullable && ' • NOT NULL'}
                        {column.isPrimaryKey && ' • PRIMARY KEY'}
                      </div>
                      {column.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {column.description}
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-3" />
            <Button
              onClick={generateQuery}
              className="w-full"
              disabled={selectedColumns.size === 0}
            >
              <Lightning size={18} weight="fill" />
              Generate Query
            </Button>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Generated SQL</h3>
            {generatedSQL && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} weight="bold" className="text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
          <Textarea
            value={generatedSQL}
            readOnly
            placeholder="Your SQL query will appear here..."
            className="font-mono text-sm min-h-[500px] resize-none"
          />
        </Card>

        {generatedSQL && (
          <Card className="p-4 bg-accent/10 border-accent/20">
            <h4 className="font-semibold text-sm mb-2 text-accent-foreground">Next Steps</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Copy the query to your SQL client</li>
              <li>Add WHERE clauses to filter results</li>
              <li>Modify LIMIT to adjust result count</li>
              <li>Join with other tables if needed</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
