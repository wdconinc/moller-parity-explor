import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaBrowser } from '@/components/SchemaBrowser';
import { QueryBuilder } from '@/components/QueryBuilder';
import { Relationships } from '@/components/Relationships';
import { Examples } from '@/components/Examples';
import { mollerSchema, queryExamples } from '@/lib/schema';
import { Database, Code, Graph, BookOpen } from '@phosphor-icons/react';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            oklch(0.7 0.15 65 / 0.05) 35px,
            oklch(0.7 0.15 65 / 0.05) 70px
          )`,
        }}
      />

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Database size={40} weight="duotone" className="text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-mono tracking-tight">
                MOLLER Database Explorer
              </h1>
              <p className="text-sm text-muted-foreground">
                Schema browser and query builder for the MOLLER experimental database
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="schema" className="gap-2">
              <Database size={18} weight="duotone" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              <Code size={18} weight="duotone" />
              Query Builder
            </TabsTrigger>
            <TabsTrigger value="relationships" className="gap-2">
              <Graph size={18} weight="duotone" />
              Relationships
            </TabsTrigger>
            <TabsTrigger value="examples" className="gap-2">
              <BookOpen size={18} weight="duotone" />
              Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema">
            <SchemaBrowser tables={mollerSchema.tables} />
          </TabsContent>

          <TabsContent value="builder">
            <QueryBuilder tables={mollerSchema.tables} />
          </TabsContent>

          <TabsContent value="relationships">
            <Relationships tables={mollerSchema.tables} />
          </TabsContent>

          <TabsContent value="examples">
            <Examples examples={queryExamples} />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
