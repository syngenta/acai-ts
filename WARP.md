# Warp Terminal Optimization for acai-ts

This project has been optimized for Warp Terminal with custom configurations, workflows, and shortcuts to enhance your development experience.

## ⚡ Quick Start

The `.warp/` directory contains all optimization files:

```bash
.warp/
├── ai_config.yaml          # AI assistant context
├── warp_config.yaml        # Terminal configuration & aliases
├── workflows/
│   ├── development.yaml    # Development workflows
│   └── testing.yaml        # Testing workflows
└── blocks/
    └── development.json    # Reusable command blocks
```

## 🚀 Essential Shortcuts

### Build & Development
```bash
b           # npm run build
bb          # build + show dist contents
tc          # type-check
lint        # eslint check
format      # prettier format
```

### Testing  
```bash
t           # npm test
tw          # test watch mode
tcov        # test with coverage
```

### Git & Navigation
```bash
gs          # git status
cdsrc       # cd src/
cdtest      # cd test/
info        # show project overview
```

## 🔧 Workflows

Run complete development sequences:

```bash
# Quality checks before commit
warp run quality-gate

# Full build verification  
warp run full-build-check

# Complete test suite
warp run test-coverage
```

## 🎯 Command Blocks

Quick access to common scenarios:

- `qs` → Quick start setup
- `qg` → Quality gate checks
- `debug` → Troubleshoot build issues
- `pub` → Prepare for publishing

## 📝 Key Features

- **TypeScript Integration**: Enhanced autocomplete and error detection
- **Dual Build Support**: Optimized for ESM + CJS outputs
- **Test Workflows**: Coverage analysis and watch modes
- **AI Context**: Project-specific patterns and commands
- **Git Integration**: Branch status and common operations

## 🔄 Usage

Warp will automatically detect and load these configurations when you're in the project directory. All aliases and workflows become immediately available.

---

*Optimized for acai-ts TypeScript AWS Lambda framework development* 🫐