# CircleCI Configuration for acai-ts

This directory contains the CI/CD configuration for the acai-ts project using CircleCI.

## Configuration Overview

The CircleCI configuration (`config.yml`) defines two main workflows:

### 1. Test Workflow (`install-build-test-workflow`)

**Triggers**: All branch pushes (excludes tags)

**Steps**:
1. **Install dependencies** - `npm ci`
2. **Type checking** - `npm run type-check` (verify TypeScript compiles)
3. **Linting** - `npm run lint` (ESLint with HTML output)
4. **Build** - `npm run build` (compile ESM + CJS outputs)
5. **Test** - `npm run test:ci` (Jest with coverage)
6. **Coverage reports** - Store artifacts
7. **SonarCloud scan** - Code quality analysis

**Context Required**: `sonarcloud`

### 2. Deploy Workflow (`install-build-deploy-workflow`)

**Triggers**: Git tags matching `v*` pattern (e.g., `v1.0.0`, `v2.1.3`)

**Steps**:
1. **Install dependencies** - `npm ci`
2. **Build** - `npm run build`
3. **Publish to NPM** - `npm publish --access public`

**Context Required**: `npm-publish`

## Required Environment Variables

### SonarCloud Context
- `SONAR_TOKEN` - SonarCloud authentication token

### NPM Publish Context
- `NPM_TOKEN` - NPM registry authentication token

## Setting Up Contexts

1. Go to CircleCI → Organization Settings → Contexts
2. Create `sonarcloud` context:
   - Add `SONAR_TOKEN` environment variable
3. Create `npm-publish` context:
   - Add `NPM_TOKEN` environment variable

## Publishing a New Release

To publish a new version to NPM:

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Push with tags
git push origin main --tags

# 3. CircleCI will automatically:
#    - Build the project
#    - Run npm publish
#    - Package will be available on npm
```

## Docker Image

Uses `cimg/node:22.19.0` - CircleCI's official Node.js 22 image with common tools pre-installed.

## Resource Class

Uses `medium` resource class (2 vCPUs, 4GB RAM) for both jobs.

## Artifacts

The following artifacts are stored:
- **Lint report**: HTML report at `./coverage/lint/index.html`
- **Test results**: JUnit XML in `./coverage/`
- **Coverage report**: LCOV and HTML coverage reports

## Local Testing

To simulate the CI pipeline locally:

```bash
# Install dependencies
npm ci

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test with coverage
npm run test:ci

# Check package contents
npm pack --dry-run
```

## Package Publishing

The package is configured to publish:
- `dist/` directory (ESM + CJS builds)
- `README.md`
- `LICENSE`
- `package.json`

All source files, tests, and config files are excluded (see `.npmignore`).

## Troubleshooting

### Build fails on type-check
- Ensure all TypeScript files compile without errors
- Run `npm run type-check` locally

### Tests fail on CI
- Run `npm run test:ci` locally to reproduce
- Check for environment-specific issues

### SonarCloud scan fails
- Verify `SONAR_TOKEN` is set in CircleCI context
- Check `sonar-project.properties` configuration

### NPM publish fails
- Verify `NPM_TOKEN` is valid and has publish permissions
- Ensure package name is available on npm registry
- Check version tag format (must start with `v`)

## Additional Resources

- [CircleCI Documentation](https://circleci.com/docs/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
