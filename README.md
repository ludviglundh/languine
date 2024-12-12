<p align="center">
  <img src="github.png" alt="linguai Banner" width="100%" />
</p>

A blazingly fast, deliciously simple way to generate translations for your applications using AI. Powered by GPT-4, linguai helps you translate your JSON locale files with minimal effort.

## ✨ Features

- 🚀 Lightning-fast AI-powered translations
- 🎯 Smart duplicate handling with side-by-side comparison
- 🌍 Support for multiple target languages
- 🤖 Powered by GPT-4 for high-quality translations
- 🛠️ Built with TypeScript for type safety
- 💾 Automatic environment configuration
- 🔄 Interactive translation management

## 🚀 Getting Started

```bash
# Install globally
npm install -g linguai

# Or run directly with npx
npx linguai

# Set up your project
linguai init
```

## 🔧 Configuration

Configure your translations in `linguai.json`:

```json
{
  "version": "1.0.0",
  "locale": {
    "source": "en",
    "targets": ["da", "sv", "no"]  // Add any target languages
  },
  "files": {
    "json": {
      "include": ["src/locales/[locale].json"]
    }
  },
  "openai": {
    "model": "gpt-4"  // Or use "gpt-3.5-turbo" for faster translations
  }
}
```

## 🎯 Usage

### Initialize a New Project
```bash
linguai init
```

### Translate Your Files
```bash
# Translate to all configured languages
linguai translate

# Or translate to a specific language
linguai translate da
```

### Managing Duplicates

When translating, linguai smartly handles existing translations:

1. Shows side-by-side comparison of differences
2. Offers options to:
   - 🔍 Choose for each translation individually
   - 💾 Keep all existing translations
   - 🔄 Use all new translations

### Environment Setup

linguai automatically manages your OpenAI API key:
- Checks `.env` and `.env.local` files
- Securely prompts for key if not found
- Optionally saves to `.env.local`
- Automatically adds `.env.local` to `.gitignore`

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
