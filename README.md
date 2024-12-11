# linguine 🍝

> Because life's too short to do stuff manually

A blazingly fast, deliciously simple way to generate translations for your applications using AI. Powered by GPT-4, linguine helps you translate your JSON locale files with minimal effort.

## ✨ Features

- 🚀 Lightning-fast AI-powered translations
- 🎯 Simple JSON-based configuration
- 🌍 Support for multiple target languages
- 🤖 Powered by GPT-4 for high-quality translations
- 🛠️ Built with TypeScript for type safety

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/ludviglundh/linguine.git

# Install dependencies
bun install

# Set up your environment variables
cp .env.local .env

# Configure your project
# Create a linguine.json with your desired settings:
{
  "locale": {
    "source": "en",
    "targets": ["da"]
  },
  "files": {
    "json": {
      "include": ["src/locales/[locale].json"]
    }
  }
}

# Build and run
bun run build
bun start
```

## 🔧 Configuration

Configure your translations in `linguine.json`:

```json
{
  "version": "1.0.0",
  "locale": {
    "source": "en",
    "targets": ["da"]  // Add more target languages as needed
  },
  "files": {
    "json": {
      "include": ["src/locales/[locale].json"]
    }
  },
  "openai": {
    "model": "gpt-4"
  }
}
```

## 🤝 Contributing

Got ideas? Found a bug? We're all ears!

1. Fork it
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT - do whatever you want! See [LICENSE](LICENSE) for more details.

---

Made with ❤️ by [Ludvig Lundh](https://github.com/ludviglundh)
