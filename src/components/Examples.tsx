import { useState } from 'react';
import { QueryExample } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check, BookOpen } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ExamplesProps {
  examples: QueryExample[];
}

export function Examples({ examples }: ExamplesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = Array.from(new Set(examples.map(e => e.category)));

  const copyToClipboard = async (sql: string, index: number) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedIndex(index);
      toast.success('Query copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/10 border-accent/20">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={24} className="text-accent" weight="duotone" />
          <h3 className="font-semibold text-accent-foreground">Example Query Library</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse common queries for the MOLLER database. Copy and modify these examples for your own analysis.
        </p>
      </Card>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-4">
                {examples
                  .filter(ex => ex.category === category)
                  .map((example, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{example.title}</h4>
                          <p className="text-sm text-muted-foreground">{example.description}</p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {example.category}
                        </Badge>
                      </div>

                      <div className="relative">
                        <pre className="bg-muted/50 p-4 rounded-lg border overflow-x-auto text-sm font-mono">
                          <code>{example.sql}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(example.sql, index)}
                          className="absolute top-2 right-2 gap-2"
                        >
                          {copiedIndex === index ? (
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
                      </div>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
