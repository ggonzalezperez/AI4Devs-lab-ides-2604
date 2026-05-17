# Dead Code Detection Methodology

This document provides guidance on detecting and removing dead code using automated tools and manual verification.

## Overview

Dead code is code that exists in the codebase but is never executed. It increases maintenance burden, bundle size, and cognitive load. This methodology uses specialized tools combined with agent verification to filter false positives.

## Types of Dead Code

### 1. Unused Imports
Import statements for modules/symbols that are never used:
```javascript
import { unused } from './utils';  // Never referenced
```

### 2. Unused Exports
Functions, classes, variables exported but never imported elsewhere:
```typescript
export function formatDate() { ... }  // Not imported anywhere
```

### 3. Unused Variables
Variables declared but never read.

### 4. Unused Functions/Methods
Functions defined but never called.

### 5. Unused Files
Entire files not imported anywhere in the codebase.

### 6. Unused Dependencies
Packages in package.json not used in code.

### 7. Unreachable Code
Code after return/throw statements or in dead branches:
```javascript
function foo() {
  return 42;
  console.log('never runs');  // Unreachable
}
```

## Detection Tools

### Knip (JavaScript/TypeScript)

```bash
# Detection (default output)
npx knip

# JSON output for parsing
npx knip --reporter json

# Fix automatically (use with caution)
npx knip --fix
```

**Configuration (`knip.json`):**
```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/index.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["**/*.test.ts"]
}
```

**Categories detected:**
- files, dependencies, devDependencies
- exports, nsExports, classMembers
- types, nsTypes, enumMembers
- unlisted, binaries, unresolved, duplicates

## False Positive Detection

**CRITICAL: Always verify findings before reporting to the user.**

### Common False Positives

#### 1. Dynamic Imports
```javascript
const module = await import(modulePath);
```

#### 2. Framework Magic
```typescript
// React components used in JSX
export const Button = () => <button />;  // Used as <Button />
```

#### 3. Re-exports for Public API
```typescript
// index.ts barrel file - exports ARE the purpose
export { Helper } from './helper';
```

#### 4. Entry Points
```javascript
// Serverless handlers, CLI scripts
export const handler = async (event) => { ... };
```

### Verification Checklist

For each flagged item, the agent MUST:

1. **Read the flagged code** to understand context
2. **Search for dynamic references**
3. **Check framework patterns** (React components, Express middleware)
4. **Check for re-exports** (barrel files)
5. **Check entry points** (package.json scripts, config files)

## Workflow

### 1. Run Detection Tool
```bash
npx knip --reporter json
```

### 2. Parse and Categorize
Group findings by type:
- Unused exports
- Unused files
- Unused dependencies
- Unused imports
- Unused class members

### 3. Verify Each Finding
For each item:
1. Read the code
2. Check for false positive patterns
3. Mark as "verified" or "likely false positive"

### 4. Present Verified Report
Show user:
- Summary counts (verified items only)
- Detailed list with file:line references
- Filtered items with reasons

### 5. Apply Fixes (After Approval)
```bash
# Only after user confirms
npx knip --fix
```

## Best Practices

1. **Run regularly** - Include in CI/CD pipeline
2. **Configure properly** - Set up ignore rules for framework patterns
3. **Test after removal** - Ensure nothing breaks
4. **Review before commit** - Manual verification recommended
5. **Document exceptions** - Comment why certain "dead" code is intentional
6. **Start conservative** - Better to miss some than to break things
