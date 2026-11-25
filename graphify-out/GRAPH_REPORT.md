# Graph Report - neetpg-app  (2026-11-26)

## Corpus Check
- 50 files · ~97,972 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 4, .ico 1, .css 1)

## Summary
- 335 nodes · 811 edges · 12 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc84af0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Button
- realDecks.ts
- page.tsx
- AuthContext.tsx
- components.json
- compilerOptions
- carousel.tsx
- NeetPgMarksCard.tsx
- StudyPlayer.tsx
- BionicReaderBolder
- manifest.json

## God Nodes (most connected - your core abstractions)
1. `Button()` - 34 edges
2. `Home()` - 28 edges
3. `react` - 26 edges
4. `lucide-react` - 23 edges
5. `DialogContent()` - 18 edges
6. `compilerOptions` - 16 edges
7. `CardPreviewModal()` - 15 edges
8. `Badge()` - 15 edges
9. `Dialog()` - 15 edges
10. `Flashcard` - 15 edges

## Surprising Connections (you probably didn't know these)
- `VisualConceptCardProps` --references--> `Flashcard`  [EXTRACTED]
  src/components/VisualConceptCard.tsx → src/types/database.ts
- `RootLayout()` --calls--> `AuthProvider()`  [EXTRACTED]
  src/app/layout.tsx → src/context/AuthContext.tsx
- `Home()` --calls--> `AnkiDeckTable()`  [EXTRACTED]
  src/app/page.tsx → src/components/AnkiDeckTable.tsx
- `Home()` --calls--> `InstallAppModal()`  [EXTRACTED]
  src/app/page.tsx → src/components/InstallAppModal.tsx
- `Home()` --calls--> `MilestoneCelebrationBanner()`  [EXTRACTED]
  src/app/page.tsx → src/components/MilestoneCelebrationBanner.tsx

## Import Cycles
- None detected.

## Communities (12 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (49): eslintConfig, nextConfig, dependencies, clsx@^2.1.1, lucide-react@^1.79.0, next@16.4.6, react@19.3.0, react-dom@19.3.0 (+41 more)

### Community 1 - "Button"
Cohesion: 0.14
Nodes (35): lucide-react, react, CardPreviewModal(), DailyCardsSummaryCardProps, DailySummaryData, DeckOptionsModal(), NEW_PRESETS, REVIEW_PRESETS (+27 more)

### Community 2 - "realDecks.ts"
Cohesion: 0.08
Nodes (35): AnkiDeckTable(), AnkiDeckTableProps, DeckRowData, SubDeckRowData, BrowseDecksProps, COMING_SOON_SUBJECTS, CardPreviewModalProps, DeckOptionsModalProps (+27 more)

### Community 3 - "page.tsx"
Cohesion: 0.17
Nodes (22): DEFAULT_REAL_DECK_IDS, Home(), AppHeader(), BottomNavBar(), BottomNavBarProps, NavTab, BrowseDecks(), DailyCardsSummaryCard() (+14 more)

### Community 4 - "AuthContext.tsx"
Cohesion: 0.21
Nodes (10): inter, metadata, RootLayout(), viewport, AuthContext, AuthContextType, AuthProvider(), initAuth() (+2 more)

### Community 5 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "carousel.tsx"
Cohesion: 0.16
Nodes (14): embla-carousel-react@^8.6.0, embla-carousel-react, CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 8 - "NeetPgMarksCard.tsx"
Cohesion: 0.09
Nodes (22): @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, @base-ui/react, class-variance-authority, cn, AppHeaderProps, NeetPgMarksCard() (+14 more)

### Community 9 - "StudyPlayer.tsx"
Cohesion: 0.15
Nodes (21): ts-fsrs@^6.0.1, ts-fsrs, ImageZoomLightbox(), ImageZoomLightboxProps, NeetPgMarksCardProps, StudyItem, StudyPlayer(), StudyPlayerProps (+13 more)

### Community 10 - "BionicReaderBolder"
Cohesion: 0.31
Nodes (6): BionicReaderBolder, forTextNodesInTree(), getBoldLength(), indexOfWhitespace(), makeBionic(), newBoldElement()

### Community 11 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Button` to `package.json`, `realDecks.ts`, `page.tsx`, `AuthContext.tsx`, `carousel.tsx`, `NeetPgMarksCard.tsx`, `StudyPlayer.tsx`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Button` to `package.json`, `realDecks.ts`, `page.tsx`, `carousel.tsx`, `NeetPgMarksCard.tsx`, `StudyPlayer.tsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.1427304964539007 - nodes in this community are weakly interconnected._
- **Why does `next` connect `package.json` to `AuthContext.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `realDecks.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07624113475177305 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._