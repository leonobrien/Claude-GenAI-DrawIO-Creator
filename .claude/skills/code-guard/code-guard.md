---
name: code-guard
description: Performs a deep security and quality audit of TypeScript files.
allowed-tools: Bash, Read
---

# Code Guard Skill

## Objectives
1. **Security:** Identify SQL injection, XSS, and hardcoded secrets.
2. **Quality:** Identify "Big Ball of Mud" functions with high complexity.
3. **Dependencies:** Check for known vulnerabilities in `node_modules`.

## Instructions for Claude
1. Run `npm run check:types`. If the compiler fails, do not proceed; fix the types first.
2. Run `npm run audit:all`.
3. If `eslintcc` reports any rank 'D' or 'E' functions, suggest a refactor to break them into smaller private methods.
4. If `secure-coding` flags an issue, explain the risk (e.g., "This could lead to a ReDoS attack") and provide a fixed version.
5. **Special Rule:** Scan for `JSON.parse()`. If found, ensure the result is validated with a Zod schema or a Type Guard. Never allow a `JSON.parse()` result to remain as `any`.
6. Check `package.json` for any packages older than 1 year and suggest updates.

## Output
Provide a summary table of:
- Type Errors (Critical)
- Security Risks (High)
- Complexity Warnings (Refactor suggested)