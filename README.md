# Statsig DevTools

[![CI/CD Pipeline](https://github.com/d0whc3r/statsig-devtools/actions/workflows/ci-main.yml/badge.svg)](https://github.com/d0whc3r/statsig-devtools/actions/workflows/ci-main.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/d0whc3r/statsig-devtools)](https://github.com/d0whc3r/statsig-devtools/releases/latest)

A browser extension for testing and debugging Statsig feature flags, experiments, and dynamic configurations.

## 🚀 Features

- **Feature Flag Testing**: View and override feature flags in real-time
- **Experiment Management**: Test different experiment variations
- **Dynamic Configuration**: Inspect and modify dynamic configs
- **Storage Override**: Manipulate localStorage and sessionStorage values
- **Multiple Interfaces**: Popup, side panel, and full tab views

## 📦 Installation

### For Users

- **Chrome Web Store**: [Install Extension](https://chrome.google.com/webstore/detail/chapehnicnhgopjmfaimgpgpipnciloo)
- **Firefox Add-ons**: [Install Extension](https://addons.mozilla.org/addon/95c1abb1-f242-41f7-9ef1-01e20beb7fdb)
- **Manual Installation**: [Download from Releases](https://github.com/d0whc3r/statsig-devtools/releases/latest)

### For Developers

```bash
git clone https://github.com/d0whc3r/statsig-devtools.git
cd statsig-devtools
npm install
```

## 🔧 Development

```bash
# Chrome development
npm run dev

# Firefox development
npm run dev:firefox

# Build for production
npm run build

# Run tests
npm run test

# Code quality checks
npm run check
```

## 🛠️ Tech Stack

- **WXT** - Web extension framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vitest** - Testing

## 📁 Project Structure

```
├── entrypoints/          # Extension entry points
│   ├── popup/           # Extension popup
│   ├── sidepanel/       # Side panel interface
│   └── background.ts    # Background script
├── src/
│   ├── components/      # React components
│   ├── services/        # API integration
│   ├── hooks/          # Custom hooks
│   └── types/          # TypeScript types
└── public/             # Static assets
```

## 🚀 Automated Publication

This project uses an automated CI/CD pipeline that:

- ✅ **Automatically publishes** to Chrome Web Store and Firefox Add-ons on every merge to `master`
- ✅ **Semantic versioning** based on [Conventional Commits](https://conventionalcommits.org/)
- ✅ **Quality gates** with linting, testing, and type checking
- ✅ **Cross-browser builds** for Chrome (MV3) and Firefox (MV2)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and run `npm run check`
4. Commit using [Conventional Commits](https://conventionalcommits.org/)
5. Push and open a Pull Request

### Commit Message Examples

```bash
feat: add new configuration override feature
fix: resolve popup rendering issue on Firefox
docs: update installation instructions
perf: optimize configuration loading performance
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with [WXT](https://wxt.dev/) and [React](https://react.dev/)
