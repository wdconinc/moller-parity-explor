# Planning Guide

A visual SQL schema explorer and query builder for the MOLLER experimental database that helps researchers authenticate, select databases, understand table structures, relationships, and construct valid SQL queries on db.moller12gev.org.

**Experience Qualities**:
1. **Scientific** - Clean, data-focused interface that prioritizes clarity and precision for researchers working with experimental physics data.
2. **Explorative** - Encourages discovery through interactive schema visualization and relationship mapping between tables.
3. **Efficient** - Streamlines query construction with visual tools and examples, reducing the learning curve for database interaction.

**Complexity Level**: Light Application (multiple features with basic state)
This is a database exploration tool with authentication, database selection, schema browsing, and query building capabilities. It manages user sessions, connects to a remote database server, and provides multiple views of database information - all with moderate state management complexity.

## Essential Features

### Authentication
- **Functionality**: Secure login form to authenticate with db.moller12gev.org using username and password
- **Purpose**: Controls access to the database server and establishes user credentials for queries
- **Trigger**: User opens the app without stored credentials
- **Progression**: Enter username → Enter password → Submit credentials → Store session data → Proceed to database selection
- **Success criteria**: Credentials stored securely in browser session, authentication state persists across page refreshes

### Database Selection
- **Functionality**: Lists all available databases on db.moller12gev.org after successful authentication
- **Purpose**: Allows users to choose which database to explore and query
- **Trigger**: User successfully authenticates
- **Progression**: View available databases → See database metadata (owner, encoding) → Select database → Navigate to schema explorer
- **Success criteria**: All available databases displayed with metadata, graceful handling of connection errors, fallback to example databases if server unavailable

### Schema Browser
- **Functionality**: Displays all database tables with their columns, data types, and constraints
- **Purpose**: Provides researchers quick reference to understand the database structure
- **Trigger**: User selects a database or clicks "Browse Schema" tab
- **Progression**: View table list → Select table → See detailed column info with types/constraints → Explore relationships
- **Success criteria**: All tables visible with complete column metadata, relationships clearly indicated

### Query Builder
- **Functionality**: Visual interface to construct SELECT queries by choosing tables and columns
- **Purpose**: Helps users build syntactically correct queries without memorizing schema
- **Trigger**: User clicks "Build Query" tab or "New Query" button
- **Progression**: Select table → Choose columns → Add WHERE conditions → Preview generated SQL → Copy to clipboard
- **Success criteria**: Generated SQL is valid and matches user selections, easy copy functionality

### Relationship Visualizer
- **Functionality**: Shows foreign key relationships between tables as an interactive diagram
- **Purpose**: Helps understand data connections and plan JOIN queries
- **Trigger**: User selects "Relationships" view or clicks table relationship indicator
- **Progression**: View schema graph → Click table to highlight connections → See FK details → Navigate to related tables
- **Success criteria**: All foreign keys displayed, navigation between related tables intuitive

### Example Query Library
- **Functionality**: Curated collection of common queries for MOLLER database
- **Purpose**: Provides starting points and best practices for database queries
- **Trigger**: User selects "Examples" tab
- **Progression**: Browse query categories → Select example → View explanation → Copy/modify SQL
- **Success criteria**: Queries cover common use cases, include explanatory comments

## Edge Case Handling
- **Unauthenticated State**: Display login form on initial load, clear credentials on logout, persist session across page refreshes
- **Failed Authentication**: Show error message if credentials are rejected, allow retry without page refresh
- **Connection Failures**: Display warning when database server is unreachable, show example databases as fallback, provide retry button
- **Empty Database List**: Handle case where no databases are available for the authenticated user with helpful messaging
- **Empty Schema State**: Display loading skeleton when fetching schema, show friendly message if schema unavailable
- **Complex Data Types**: Handle array types, JSON columns, and custom PostgreSQL types with clear formatting
- **Long Table Lists**: Implement search/filter functionality to find tables quickly in large schemas
- **Mobile View**: Collapse relationship diagram to list view, make query builder vertical stack, stack navigation buttons
- **Copy Failures**: Provide fallback manual selection if clipboard API unavailable

## Design Direction
The design should evoke scientific precision and clarity - like looking at well-organized lab equipment or a research paper's data tables. Professional, clean, with subtle depth that suggests layers of information to explore.

## Color Selection
A scientific, high-contrast scheme with cool analytical tones and warm accent highlights for interactive elements.

- **Primary Color**: Deep slate blue `oklch(0.35 0.05 250)` - Conveys analytical thinking and scientific rigor
- **Secondary Colors**: 
  - Light slate background `oklch(0.98 0.01 250)` for cards and surfaces
  - Medium slate `oklch(0.75 0.02 250)` for muted elements and borders
- **Accent Color**: Warm amber `oklch(0.70 0.15 65)` - Draws attention to interactive elements and important data points
- **Foreground/Background Pairings**:
  - Primary (Deep Slate): White text `oklch(0.98 0 0)` - Ratio 8.2:1 ✓
  - Accent (Warm Amber): Dark slate text `oklch(0.25 0.04 250)` - Ratio 6.1:1 ✓
  - Background (Light Slate): Foreground `oklch(0.20 0.04 250)` - Ratio 12.5:1 ✓
  - Secondary cards: Foreground on light slate - Ratio 11.8:1 ✓

## Font Selection
Typefaces should balance technical precision with readability - monospace for code/data, clean sans-serif for UI elements.

- **Typographic Hierarchy**:
  - H1 (App Title): JetBrains Mono Bold / 32px / -0.02em letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em letter spacing
  - H3 (Table Names): Space Grotesk Medium / 18px / normal spacing
  - Body (UI Text): Space Grotesk Regular / 15px / normal spacing
  - Code (SQL/Data): JetBrains Mono Regular / 14px / normal spacing
  - Labels (Column types): JetBrains Mono Medium / 12px / 0.01em spacing

## Animations
Animations should be subtle and functional - reveal information progressively, provide feedback on interactions, and guide attention during state changes. Query preview should slide in smoothly, table selections should highlight with gentle color transitions, and relationship lines should draw in to show connections.

## Component Selection

- **Components**:
  - `Card` for login form, database cards, table details, query preview, example queries
  - `Input` for username and password fields, with search icon for table filtering
  - `Button` for login, logout, database selection, actions (copy query, add column, clear selections)
  - `Label` for form field labels
  - `Badge` for database metadata (owner, encoding), data types, constraints (PRIMARY KEY, NOT NULL), selected database indicator
  - `Tabs` for main navigation (Schema, Query Builder, Relationships, Examples)
  - `Table` for displaying schema column information
  - `ScrollArea` for long lists of tables, columns, and databases
  - `Separator` to divide sections
  - `Select` for choosing tables in query builder
  - `Checkbox` for selecting columns
  - `Textarea` for query preview/editing
  - `Collapsible` for expandable table sections in schema browser
  - `Tooltip` for explaining database concepts
  - `Sheet` for mobile table detail view
  
- **Customizations**:
  - Custom authentication flow with persistent session storage
  - Custom database list with connection error handling and fallback data
  - Custom syntax-highlighted SQL display component using code blocks
  - Custom relationship diagram using SVG with interactive nodes
  - Custom column type badges with color coding (text=blue, numeric=green, boolean=purple, date=orange)
  
- **States**:
  - Login form: Loading state during authentication, error state for failed login
  - Database cards: Hover with border highlight and shadow, reveal "Explore" button on hover
  - Buttons: Primary (amber accent) for main actions, ghost for secondary, disabled state when no selection, outline for navigation
  - Table rows: Hover with subtle background change, selected rows with accent border-left
  - Input search: Focus with accent ring, clear button appears when text entered
  - Code blocks: Copy button appears on hover, success checkmark animation on copy
  - Loading states: Spinner for database list fetch, skeleton for schema loading
  
- **Icon Selection**:
  - `Database` for main app icon, table indicators, and database cards
  - `SignIn` for login button
  - `SignOut` for logout button
  - `MagnifyingGlass` for search inputs
  - `Code` for query builder tab
  - `Graph` for relationships view
  - `BookOpen` for examples library
  - `Copy` for copy-to-clipboard actions
  - `Check` for successful copy feedback
  - `Lightning` for quick actions and generate query
  - `ArrowRight` for relationship connections
  - `Columns` for table column indicators
  - `Warning` for connection error messages
  - `CircleNotch` for loading/spinner animations
  
- **Spacing**:
  - Page padding: `p-6 md:p-8`
  - Card padding: `p-4 md:p-6`
  - Login form: `p-8` for comfortable entry
  - Section gaps: `gap-6`
  - Database grid: `gap-4`
  - List item gaps: `gap-2`
  - Inline elements: `gap-1.5`
  - Consistent `space-y-4` for vertical stacking
  
- **Mobile**:
  - Login form: Full screen with centered card, remains responsive
  - Database list: Single column grid, full-width cards
  - Navigation: Stack logout and back buttons vertically if needed
  - Tabs switch to full-width stacked buttons
  - Schema browser shows tables in accordion instead of side-by-side
  - Query builder becomes vertical flow with full-width selects
  - Relationship diagram switches to list view with expandable connections
  - SQL preview moves to bottom sheet instead of side panel
