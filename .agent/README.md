# .agent/

Thư mục cấu hình cho AI agents (Antigravity, Gemini CLI, v.v.).
Mirror đầy đủ `.claude/` nhưng không assume Claude-specific features.

## Cấu trúc

```
.agent/
├── README.md               ← File này
├── settings.json           ← Permissions và environment settings
├── rules/                  ← Stack rules và design guidelines
│   ├── nestjs-rules.md     ← Backend: NestJS, Prisma, BullMQ
│   ├── react-antd-rules.md ← Frontend: React 19, Ant Design 6
│   └── ui-ux-skill.md      ← UI/UX: Emil Kowalski + Impeccable Design
├── agents/                 ← Specialized agent personas
│   ├── architecture-reviewer.md
│   ├── build-verifier.md
│   ├── debugger.md
│   ├── docs-sync.md
│   └── design-critic.md
├── commands/               ← Slash command definitions
│   └── sync-docs.md
└── hooks/                  ← Event hooks (bash/node scripts)
    ├── agent-chain-guard.sh
    ├── check-prisma-migration.sh
    └── docs-sync-counter.js
```

## Rules loading order

1. `nestjs-rules.md` — applies to `source/backend`
2. `react-antd-rules.md` — applies to `source/frontend`
3. `ui-ux-skill.md` — applies when building any frontend screen

## Deviations from generic rules

Xem `CLAUDE.md §Deviations` hoặc `AGENTS.md §Tech Stack` — những override này áp dụng
cho mọi AI agent, không chỉ Claude.
