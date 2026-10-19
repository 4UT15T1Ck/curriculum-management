# React / Vite — Stack Rules

Pair with `ai-rules.md`. Apply both files together for React/Vite projects.

---

## 1. Feature Folder Structure

Every feature lives in `src/features/<feature>/` with these sub-folders:

```
src/features/<feature>/
├── components/     # UI components used only within this feature
├── hooks/          # React Query hooks (useQuery / useMutation) for this feature
├── pages/          # Page-level components — route entry points, thin composers
├── routes/         # React Router route definitions for this feature
├── services/       # Typed API call functions (no state, no hooks — just fetch wrappers)
├── types/          # TypeScript interfaces and types scoped to this feature
└── schema/         # Zod validation schemas for forms and API response validation
```

Cross-feature shared code goes in `src/shared/`. Never put feature-specific code in `shared/`.
shadcn/radix-ui primitives live in `src/shadcn/` — treat that folder as a read-only vendor layer.

---

## 2. Server State — React Query Only

- All data fetched from the API lives in React Query (`useQuery` / `useMutation`). Never mirror
  server data into Zustand.
- Every API interaction has a dedicated hook in the feature's `hooks/` folder.
- Query keys are typed constant arrays defined at the top of the hooks file — never inline strings
  in `useQuery` calls.
- Loading, error, and empty states are handled in the component that calls the hook, not inside
  the hook itself.
- Components never call service functions directly — always go through a hook.

---

## 3. Client State — Zustand

- Zustand stores live in `src/shared/stores/` (if cross-feature) or inside the feature folder if
  truly scoped to one feature.
- Zustand is for UI-only client state: sidebar open/closed, selected tab, auth session data,
  user preferences. Not for data that could be served by React Query.
- Never put server-fetched data in a Zustand store.
- Stores are plain objects with actions as methods on the same object. No computed values inside
  the store — derive them in the component or with a selector function passed to `useStore`.

---

## 4. Component Rules

- Pages are thin: they compose feature components and call hooks. No inline business logic.
- Feature components (`features/<feature>/components/`) must not be imported by other features.
  If a component is needed elsewhere, move it to `src/shared/components/`.
- Shared components (`src/shared/components/`) must have no feature-specific imports.
- Never modify files under `src/shadcn/` directly. Build wrappers in `shared/components/` or
  feature `components/` when customization is needed.
- No inline styles. All styling via Tailwind utility classes.
- Use `cn()` (from `shadcn/lib/utils`) for conditional class merging — never string concatenation.
- `const` arrow functions for all components: `const MyComponent = () => { ... }`.

---

## 5. Forms

- Every form uses `react-hook-form` with a Zod schema via `@hookform/resolvers/zod`.
- Zod schemas are defined in `schema/` and imported by the form component — never inline.
- Never manage form field state with `useState` — use `useForm` from react-hook-form.
- Validation runs on submit by default. Enable `mode: 'onBlur'` only when UX explicitly requires
  it for a specific field.

---

## 6. API Service Layer

- Service functions in `services/` are plain async functions — no hooks, no state, no side effects
  beyond the network call.
- Every service function is fully typed: typed parameters, typed return value.
- Never use `any` for API response types. Define an interface or derive the type from the Zod
  schema with `z.infer<typeof schema>`.
- Errors from service functions propagate up — they are not silently caught. React Query handles
  the error state.
- The HTTP client (axios instance or fetch wrapper) is configured once in `src/core/api/` and
  imported by service functions — never create ad-hoc fetch calls in components or hooks.

---

## 7. Routing

- Route definitions live in each feature's `routes/` folder and are composed into the app router
  in `src/routes/`.
- Route path strings are defined as named constants — never hardcode paths in `<Link to=...>` or
  `navigate(...)` calls.
- Protected routes use a route guard component in `src/core/` — never check auth inside a page
  component.
- Lazy-load page components with `React.lazy()` for any route not on the initial load path.

---

## 8. TypeScript Conventions

- No `any`. Use `unknown` when the type is genuinely unknown, then narrow before use.
- Prefer `interface` for object shapes, `type` for unions, intersections, and mapped types.
- All component props are typed with a dedicated `interface XxxProps`. No prop spreading
  (`{...props}`) without an explicit typed spread target.
- Exported types and interfaces live in `types/` — not inline in component files.
- Enable `strict: true` — never disable strict checks with `// @ts-ignore` or `as any`.

---

## 9. Naming Conventions

- Files: `PascalCase` for components (`UserCard.tsx`), `camelCase` for everything else
  (`useUsers.ts`, `userService.ts`, `userSchema.ts`)
- Folders: `kebab-case`
- Components: `PascalCase`
- Hooks: `use` prefix, verb-noun (`useCreateUser`, `useUserList`)
- Services: noun-based object or file (`userService`, `authService`)
- Zod schemas: `xxxSchema` suffix (`createUserSchema`, `loginSchema`)
- Types / interfaces: `PascalCase` (`UserResponse`, `CreateUserRequest`)
- Query key constants: `SCREAMING_SNAKE_CASE` in a `queryKeys` object per feature
- Route path constants: grouped in a `Routes` or `Paths` constant object
