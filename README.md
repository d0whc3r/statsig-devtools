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

- [Chrome Extension](https://github.com/d0whc3r/statsig-devtools/releases/latest)
- [Firefox Add-on](https://github.com/d0whc3r/statsig-devtools/releases/latest)

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and run `npm run check`
4. Commit using [Conventional Commits](https://conventionalcommits.org/)
5. Push and open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with [WXT](https://wxt.dev/) and [React](https://react.dev/)
