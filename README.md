# Client Fuzzy Search

A small React demo of a command-palette–style smart search running entirely in the browser. There is no search API or backend: documents are loaded as static JSON, indexed and scored in JavaScript, and results follow the input via React `useDeferredValue` (no separate debounce timer). Vite, React 19, TypeScript, Tailwind CSS. `npm install` and `npm run dev`

Features full keyboard navigation and highlighted matches. The bundled JSON is `src/data/movies_1000.json` — 1000 popular movies. To use custom documents and schema, replace or point to the JSON source, update the TypeScript types, and adapt `preparePage` in `src/lib/searchDocument.ts` for correct field mapping into the search index.

## Search (quick overview)

* **Indexed fields:** `name`, `tag` (comma-separated string), `short_description`.
* **Logic:** Query -> lowercase tokens (split on spaces); every token must match.
* **Scoring:** exact/prefix/substring on title words and tags, substring in description (tokens ≥ 3 chars).
* **Fallback:** If a token still matches nothing, acronym or typo on the title.
* **Bonus:** Applied if the full query equals the whole title or whole tag string.
* **Details:** `searchDocument.ts`, `searchEngine.ts`, `searchFuzzy.ts`.

## Debug UI

Set `SEARCH_DEBUG_UI` to `true` in `src/lib/searchEngine.ts` to show each result’s score and match-reason (name / tag / description / acronym / typo) in the list.