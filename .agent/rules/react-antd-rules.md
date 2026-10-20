# React + Vite + Ant Design 6 — Stack Rules

Applies to `source/frontend`. Pair with project-level rules.

> **Key deviations from generic react rules** — these are intentional project decisions,
> not mistakes. Check `CLAUDE.md §Deviations` for the full list.
>
> | Generic rule | This project |
> |---|---|
> | Tailwind + shadcn + `cn()` | Ant Design 6 theme tokens; no Tailwind, no shadcn |
> | react-hook-form + Zod | AntD `Form` with `rules` prop |
> | Zustand for session | No Zustand — TanStack Query `GET /api/auth/me` is the only client session state |
> | `const` arrow components | `function Foo()` declarations |
> | Inline route strings | `ROUTES` constant in `src/routes.ts` |
> | Hand-written API types | Generated from OpenAPI spec via `pnpm api:types` |

---

## 1. Folder Structure

```
src/
├── features/<feature>/
│   ├── api/           ← plain async functions, fully typed
│   ├── components/    ← feature-specific components
│   ├── hooks/         ← useQuery/useMutation wrappers
│   ├── pages/         ← thin page components
│   ├── schema/        ← AntD Form validation rule arrays
│   └── constants/     ← labels, color maps, enum maps
├── shared/
│   ├── api/           ← HTTP client, generated schema.d.ts, pagination, queryClient
│   ├── auth/          ← RequireAuth, RequirePermission, useMe, useCan, useLogout
│   ├── design-system/ ← Theme tokens, shared components (DataTable, PageHeader, …)
│   ├── layout/        ← AppLayout, menuItems
│   ├── org-units/     ← OrgUnitSelect (cross-feature shared component)
│   ├── subject-groups/← SubjectGroupSelect (cross-feature shared component)
│   └── users/         ← UserSelect (cross-feature shared component)
├── main.tsx           ← App bootstrap + ConfigProvider + QueryClientProvider
├── router.tsx         ← Router definition
└── routes.ts          ← ROUTES constant (all path strings)
```

---

## 2. Server State — TanStack Query Only

- All API data lives in `useQuery` / `useMutation`. Never mirror server data into local state.
- Every API interaction has a dedicated hook in the feature's `hooks/` folder.
- Query keys: typed constant arrays defined at the top of the hooks file — never inline strings.
- Loading, error, and empty states are handled in the component that calls the hook, not inside the hook.
- Components never call API service functions directly — always go through a hook.

---

## 3. No Client State Store

- No Zustand. No Redux. No Context for server data.
- UI-only state (modal open, selected item, filter params) lives in `useState` in the component.
- The sole "session" is `useMe()` — a TanStack Query hook that calls `GET /api/auth/me`.

---

## 4. Component Rules

- Named function declarations: `export function MyComponent() {}` — not `const` arrows.
- Pages are thin: they compose feature components and call hooks. No inline business logic.
- Feature components (`features/<f>/components/`) must not be imported by other features.
  If a component is needed cross-feature, move it to `src/shared/`.
- Shared components (`src/shared/`) must have no feature-specific imports.
- **Design system first**: before creating a new component, check `src/shared/design-system/`.
  Use `DataTable`, `PageHeader`, `StatusTag`, `EmptyState`, `DetailPageLayout`, `ListPageLayout`
  where they apply. See `src/shared/design-system/DESIGN_SYSTEM.md` for the decision tree.

---

## 5. Styling

- Ant Design 6 theme tokens via `ConfigProvider` (`src/shared/design-system/theme.ts`).
- Inline `style` allowed for one-off spacing adjustments only.
- No Tailwind. No shadcn. No `cn()`.
- Never hardcode hex color values in components — use AntD token system or `colorMap` constants.
- Motion rules are applied globally via `src/shared/design-system/motion.css` (imported in `main.tsx`).

---

## 6. Forms

- AntD `<Form layout="vertical">` + `<Form.Item rules={...}>` for all forms.
- Validation rule arrays are defined in the feature's `schema/` folder — never inline in JSX.
- No react-hook-form. No Zod.
- `form.setFields()` is the correct way to map server validation errors from `ApiError.details`.

---

## 7. API Service Layer

- Service functions in `features/<f>/api/` are plain async functions — no hooks, no state.
- HTTP client: `src/shared/api/client.ts` (fetch wrapper with `credentials: 'include'`).
- All response types come from the generated `src/shared/api/schema.d.ts` — no hand-written interfaces.
- Errors propagate up — never silently caught in service functions. TanStack Query handles error state.

---

## 8. Routing

- All route path strings live in `ROUTES` constant (`src/routes.ts`).
- Never hardcode path strings in `<Link to="...">` or `navigate("...")` calls.
- Protected routes use `<RequireAuth>` / `<RequirePermission>` from `src/shared/auth/`.
- Lazy-load page components with `React.lazy()` for non-initial routes.

---

## 9. TypeScript

- No `any`. No `@ts-ignore`.
- `interface` for object shapes; `type` for unions, intersections, mapped types.
- All component props have a dedicated `interface XxxProps`.
- `strict: true` is enabled — never disable checks.

---

## 10. Naming Conventions

- Files: `PascalCase` for components (`UserCard.tsx`), `camelCase` for everything else
- Folders: `kebab-case`
- Components / Pages: `PascalCase`
- Hooks: `use` prefix + verb-noun (`useCreateUser`, `useUserList`)
- API functions: noun-based (`userApi.ts` exports `getUsers`, `createUser`, …)
- Validation rule arrays: `SCREAMING_SNAKE_CASE` (`USERNAME_RULES`, `EMAIL_RULES`)
- Query key constants: `SCREAMING_SNAKE_CASE` in a `queryKeys` object per feature
- Route path constants: in the `ROUTES` object (`ROUTES.userList`, `ROUTES.userDetail`)
- Color/label maps: `ENTITY_STATUS_COLORS`, `ENTITY_STATUS_LABELS`
