<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Instructions & User Guidelines

## 1. Terminal Command Rules

- **Do NOT execute terminal commands directly.** Always request the user to execute them.
- When requesting execution, **provide a detailed explanation** of what the command does and why it is needed.
- After generating or updating code, **do NOT run verification commands** (e.g., `npm run lint`, `npx tsc`, `npm run build`) yourself. Instead, suggest that the user run these verification commands.

## 2. Documentation & Implementation Planning

- **Documentation**: Unless instructed otherwise, when creating documentation or note records, create new `.md` files under the `docs/` directory.
- **Implementation Plans**: Unless instructed otherwise, create implementation plans as `.md` files inside the `docs/` directory.
- **Plan Workflow**:
  1. Write the implementation plan in `docs/`.
  2. Update the plan document when user feedback is received.
  3. Begin implementation only after receiving explicit user approval for the plan.

## 3. Import & Code Formatting Rules

- **Absolute Imports**: Always use absolute paths for imports (e.g., `@/...`).
- **Linting & Formatting**: Do not manually perform lint/format adjustments in code that ESLint and Prettier automatically handle.

## 4. Coding Preferences & Component Design

- **CSS Values**: Avoid hardcoding absolute CSS values; use semantic CSS variables instead.
- **Component Structure**:
  - Prefer splitting files so that each component has its own file (one component per file).
  - If a single file contains multiple components or helper functions, place the main/primary component at the top (upper position) of the file.
