# Graph Report - neetpg-app  (2026-11-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 238 nodes · 550 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8

## God Nodes (most connected - your core abstractions)
1. `Button()` - 28 edges
2. `Home()` - 21 edges
3. `react` - 19 edges
4. `lucide-react` - 16 edges
5. `compilerOptions` - 16 edges
6. `Badge()` - 14 edges
7. `DialogContent()` - 12 edges
8. `SubscriptionUpgradeModal()` - 11 edges
9. `useAuth()` - 11 edges
10. `cn` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AnkiDeckTableProps` --references--> `UserCardProgress`  [EXTRACTED]
  src/components/AnkiDeckTable.tsx → src/types/database.ts
- `CardPreviewModalProps` --references--> `Flashcard`  [EXTRACTED]
  src/components/CardPreviewModal.tsx → src/types/database.ts
- `StudyPlayerProps` --references--> `UserCardProgress`  [EXTRACTED]
  src/components/StudyPlayer.tsx → src/types/database.ts
- `BrowseDecks()` --calls--> `CardPreviewModal()`  [EXTRACTED]
  src/components/BrowseDecks.tsx → src/components/CardPreviewModal.tsx
- `CardPreviewModal()` --calls--> `Badge()`  [EXTRACTED]
  src/components/CardPreviewModal.tsx → src/components/ui/badge.tsx

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (42): eslintConfig, dependencies, clsx@^2.1.1, lucide-react@^1.79.0, react@19.3.0, react-dom@19.3.0, shadcn@^4.23.0, @supabase/supabase-js@^2.119.2 (+34 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (25): lucide-react, react, CardPreviewModal(), DailyCardsSummaryCardProps, DailySummaryData, OnboardingProps, slides, HeatmapDay (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (22): ts-fsrs, AnkiDeckTableProps, DeckRowData, BrowseDecksProps, CardPreviewModalProps, StudyItem, StudyPlayer(), StudyPlayerProps (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (21): Home(), AnkiDeckTable(), AppHeader(), AppHeaderProps, BottomNavBar(), BottomNavBarProps, NavTab, BrowseDecks() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (18): nextConfig, next@16.4.6, @supabase/ssr@^0.12.7, next, @supabase/ssr, GET(), inter, metadata (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (14): embla-carousel-react@^8.6.0, embla-carousel-react, CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (9): @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, @base-ui/react, class-variance-authority, cn, Switch(), TabsList() (+1 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0613107822410148 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 7`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13763440860215054 - nodes in this community are weakly interconnected._
- **Why does `cn` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 7`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._