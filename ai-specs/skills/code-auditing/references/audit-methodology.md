# Code Audit Methodology

This document provides a comprehensive, systematic approach to code quality auditing. Follow these phases for thorough analysis.

## Phase 0: Pre-Analysis Setup

Before analyzing code, establish the context:

### 1. Project Configuration
- **Package files**: package.json, requirements.txt, go.mod, pom.xml, etc.
- **Tech stack**: Identify languages, frameworks, and core libraries
- **Linting configs**: eslint, prettier, black, golint, etc.
- **Project docs**: CLAUDE.md, README.md for project-specific guidelines

### 2. Baseline Checks
Run existing linting and testing:
```bash
# JavaScript/TypeScript
npm run lint
npm run typecheck
npm test
```

Document existing errors/warnings as baseline.

## Phase 1: Discovery

### File Identification
Find all code files by type:
```
*.js, *.ts, *.jsx, *.tsx  (JavaScript/TypeScript)
```

### Organization
- Group files by module/feature for contextual analysis
- Create a tracking list for systematic progress
- Prioritize core business logic over utilities

## Phase 2: File-by-File Analysis

For each file, analyze for the following categories:

### Dead Code
- Unused functions and methods
- Unused variables and imports
- Unreachable code blocks
- Commented-out code
- Deprecated features still present

### Code Smells & Anti-Patterns
- Functions longer than 50 lines
- High cyclomatic complexity (> 10)
- Deeply nested conditionals (> 3 levels)
- Magic numbers without constants
- Copy-paste code duplication
- God objects/functions doing too much
- Long parameter lists (> 5 params)

### Security Vulnerabilities
- Hardcoded secrets, API keys, passwords
- SQL injection vulnerabilities
- XSS (Cross-Site Scripting) risks
- Command injection risks
- Missing input validation
- Information disclosure in errors

### Performance Issues
- O(n²) or worse algorithms in hot paths
- Missing database indexes
- N+1 query patterns
- Unnecessary synchronous operations
- Missing caching for expensive operations
- Blocking I/O in async contexts

### TypeScript/Type Safety Issues
- Missing type annotations
- Excessive use of `any` type
- Type assertions that could be avoided
- Custom types duplicating official @types/* packages
- Missing null/undefined checks

### Async/Promise Issues
- Missing `await` keywords
- Unhandled promise rejections
- Callback hell that should use async/await
- Fire-and-forget promises without error handling

### Error Handling
- Empty catch blocks
- Catch-and-ignore patterns
- Missing try/catch in async code
- Inconsistent error types
- Generic error messages hiding root cause

## Phase 3: Best Practices Verification

For every major library identified, compare implementation against official patterns:
- Migration guides between versions
- Deprecated features and replacements
- Performance best practices
- Security considerations
- Common pitfalls and anti-patterns

## Phase 3.5: TypeScript Types Verification

For TypeScript projects, perform additional type analysis:

### Check for Duplicate Types
Search for custom interfaces that mirror official types:
- React types (React.FC, React.Component, event types)
- Node.js types (Buffer, Process, Global)
- DOM types (HTMLElement, Event types)
- Express types (Request, Response)

### Verify @types Packages
```bash
npm ls @types/*
```

## Phase 4: Pattern Detection

Look for recurring issues across the codebase:

### Cross-File Patterns
- Same anti-pattern repeated in multiple files
- Duplicated utility functions
- Inconsistent error handling approaches
- Different coding styles in different modules

### Abstraction Opportunities
- Repeated code that could be a utility function
- Common patterns that could be hooks (React)
- Cross-cutting concerns needing middleware

## Phase 5: Library Recommendations

For custom implementations, find mature replacements:

| Custom Implementation | Recommended Library |
|----------------------|---------------------|
| Date manipulation | date-fns, dayjs |
| HTTP client | axios, ky |
| Form validation | zod, yup |
| Deep cloning | lodash/cloneDeep, structuredClone |
| UUID generation | uuid, nanoid |

## Phase 6: Report Generation

### Report Structure

#### Executive Summary (2-3 paragraphs)
- Total files analyzed
- High-level findings overview
- Key risks and recommendations

#### Critical Issues (Immediate Action)
For each:
- File path and line number
- Issue description
- Security/stability impact
- Fix example
- Effort estimate

#### High Priority Issues
- Performance bottlenecks
- Maintainability problems
- Missing error handling

#### Medium Priority Issues
- Best practices violations
- Code quality concerns
- Type safety improvements

#### Low Priority Issues
- Style inconsistencies
- Minor improvements
- Documentation gaps

#### Quick Wins
Low-effort, high-value fixes:
- < 30 minutes to implement
- High impact on quality/security

#### Action Plan
Prioritized steps with:
- Effort estimates (S/M/L/XL)
- Dependencies between tasks
- Suggested sprint allocation

### Report Format Requirements

Each issue should include:
```markdown
### [PRIORITY] Issue Title
**Location:** `src/auth/login.ts:42`

**Problem:**
Description of the issue and why it matters.

**Before:**
```typescript
// problematic code
```

**After:**
```typescript
// fixed code
```

**Effort:** S (< 30 min) | M (1-4 hours) | L (4-8 hours) | XL (> 8 hours)
```

## Common Pitfalls to Avoid

1. **Don't rely on assumptions** - Always verify with documentation
2. **Don't suggest outdated patterns** - Check current best practices
3. **Don't recommend unmaintained libraries** - Verify activity
4. **Don't ignore project conventions** - Respect CLAUDE.md guidelines
5. **Don't break functionality** - Ensure fixes are safe
6. **Don't over-engineer** - Consider cost/benefit ratio
7. **Don't ignore TypeScript type checks** - Types are documentation
