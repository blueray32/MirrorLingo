---
description: Verify npm packages exist and are compatible before implementation
---

# Dependency Check: Package Verification

Verify that packages exist and are compatible BEFORE adding them to your implementation plan.

## Purpose

Prevent implementation failures caused by:
- Non-existent packages (typos, deprecated, renamed)
- Version incompatibilities
- Missing peer dependencies
- Abandoned/unmaintained packages

## Usage

Run this check for each new dependency before implementation:

```
@dependency-check <package-name> [<package-name2> ...]
```

## Verification Process

### 1. Package Existence Check

For each package:

```bash
# Check if package exists and get latest version
npm view <package-name> version

# If package not found, search for alternatives
npm search <package-name>
```

**Document**:
- Package exists: yes/no
- Latest version
- If missing: suggested alternatives

### 2. Compatibility Check

```bash
# Check peer dependencies
npm view <package-name> peerDependencies

# Check engines (Node version requirements)
npm view <package-name> engines

# For React Native packages, check RN compatibility
npm view <package-name> peerDependencies | grep react-native
```

**Verify against project**:
- [ ] Compatible with project's Node version
- [ ] Compatible with project's React version
- [ ] Compatible with project's React Native version (if applicable)
- [ ] No conflicting peer dependencies

### 3. Maintenance Status Check

```bash
# Check last publish date
npm view <package-name> time.modified

# Check weekly downloads (health indicator)
npm view <package-name> --json | grep -A1 '"downloads"'
```

**Red flags**:
- Last updated > 2 years ago
- Very low download count
- Many open issues on GitHub
- No TypeScript types available

### 4. TypeScript Support Check

```bash
# Check if package has built-in types
npm view <package-name> types

# Check for @types package
npm view @types/<package-name> version
```

**Document**:
- Built-in TypeScript: yes/no
- @types available: yes/no
- Types quality: good/partial/none

### 5. Security Check

```bash
# Check for known vulnerabilities
npm audit <package-name>

# Check package score on Snyk
# Visit: https://snyk.io/advisor/npm-package/<package-name>
```

## Known Problematic Packages

### React Native Ecosystem

| Package Name | Issue | Alternative |
|-------------|-------|-------------|
| `@react-native-netinfo` | Does not exist | `@react-native-community/netinfo` or assume-online fallback |
| `react-native-device-info` | Adds complexity | Random UUID for demo scope |
| Old `react-native-*` packages | May be moved to `@react-native-community/*` | Check community namespace |

### General npm

| Pattern | Issue | Solution |
|---------|-------|----------|
| Packages with `-` vs `_` | Easy to confuse | Double-check exact name |
| Scoped vs unscoped | `@org/pkg` vs `pkg` | Verify correct scope |
| Version-specific names | `package-v2` vs `package@2` | Use `@version` syntax |

## Output Report

### For valid packages:

```markdown
## Dependency Check: [package-name]

**Status**: ✅ APPROVED

| Check | Result |
|-------|--------|
| Exists | Yes |
| Latest Version | X.X.X |
| Last Updated | YYYY-MM-DD |
| TypeScript | Built-in / @types / None |
| Peer Dependencies | Compatible |
| Security | No known vulnerabilities |

**Install Command**:
```bash
npm install <package-name>@X.X.X
```
```

### For problematic packages:

```markdown
## Dependency Check: [package-name]

**Status**: ❌ REJECTED / ⚠️ CAUTION

**Issue**: [describe the problem]

**Alternatives**:
1. `alternative-package` - [why it's better]
2. Custom implementation - [if simple enough]
3. Different approach - [if package not needed]

**Recommendation**: [what to do instead]
```

## Quick Reference Commands

```bash
# Full package info
npm view <package-name>

# Just version and dependencies
npm view <package-name> version peerDependencies

# Search for packages
npm search <keywords>

# Check if installed version matches latest
npm outdated <package-name>

# Security audit
npm audit

# View package homepage/repository
npm view <package-name> homepage repository
```

## Integration with Planning

When using `@plan-feature`, run dependency checks during Phase 2 (Dependency Analysis):

1. List all new packages needed
2. Run `@dependency-check` on each
3. Document results in plan's "Dependencies" section
4. Include fallback strategies for critical packages

## Automation

For bulk checking, create a simple script:

```bash
#!/bin/bash
# check-deps.sh
for pkg in "$@"; do
  echo "=== Checking: $pkg ==="
  npm view "$pkg" version peerDependencies 2>/dev/null || echo "❌ Package not found!"
  echo ""
done
```

Usage: `./check-deps.sh react-native-audio-recorder-player @react-native-voice/voice`
