# 🤖 AI Code Reviewer Pro

> Professional AI-powered code review assistant using Google's Gemini AI - Similar to GitHub Copilot

Transform your code review process with intelligent AI assistance. Get instant feedback, bug detection, security audits, and improvement suggestions directly in VS Code.

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🔍 **Comprehensive Code Review**
- **Full File Analysis**: Deep review of entire files with categorized issues
- **Selection Review**: Quick focused review of selected code
- **Workspace Scan**: Project-wide code quality assessment

### 🐛 **Bug Detection**
- Logical error identification
- Edge case discovery
- Runtime error prediction
- Resource leak detection

### 🔒 **Security Audit**
- SQL injection detection
- XSS vulnerability scanning
- Authentication issue identification
- Sensitive data exposure checks
- OWASP compliance verification

### 💡 **Smart Suggestions**
- Performance optimization recommendations
- Code readability improvements
- Modern best practices
- Design pattern suggestions

### 🧪 **Test Generation**
- Comprehensive unit test creation
- Multiple framework support (Jest, Mocha, Pytest, JUnit, etc.)
- Edge case coverage
- Arrange-Act-Assert pattern

### 📖 **Documentation**
- Automatic JSDoc/docstring generation
- Inline comment suggestions
- Usage example creation
- Type annotation additions

### 💬 **Interactive AI Chat**
- Natural conversation about code
- Context-aware responses
- Code explanation on demand
- Debugging assistance

## 📦 Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "AI Code Reviewer Pro"
4. Click **Install**

### From VSIX File
```bash
code --install-extension ai-code-reviewer-pro-1.0.0.vsix
```

### Manual Installation
1. Clone this repository
2. Install dependencies: `npm install`
3. Compile: `npm run compile`
4. Press `F5` to run in development mode

## 🚀 Quick Start

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### 2. Configure Extension
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run: `AI Code Reviewer: Set Gemini API Key`
3. Paste your API key
4. Click ✅ when status bar shows "AI Reviewer Ready"

### 3. Start Reviewing!
- **Review File**: `Ctrl+Shift+R` / `Cmd+Shift+R`
- **Review Selection**: Select code → `Ctrl+Shift+E` / `Cmd+Shift+E`
- **Open Chat**: `Ctrl+Shift+A` / `Cmd+Shift+A`

## 🎯 Usage Examples

### Review Current File
```
1. Open any code file
2. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. View comprehensive review in side panel
```

### Quick Code Explanation
```
1. Select code snippet
2. Press Ctrl+Shift+X (or Cmd+Shift+X on Mac)
3. Read clear explanation with examples
```

### Find Security Issues
```
1. Right-click in code editor
2. Select "🤖 AI Code Reviewer" → "🔒 Security Check"
3. Review security audit report
```

### Generate Unit Tests
```
1. Select function/class
2. Right-click → "🤖 AI Code Reviewer" → "🧪 Generate Unit Tests"
3. Choose testing framework
4. Copy generated tests
```

### Interactive Chat
```
1. Press Ctrl+Shift+A (or Cmd+Shift+A on Mac)
2. Ask questions about your code
3. Get instant AI-powered answers
```

## ⌨️ Keyboard Shortcuts

| Command | Windows/Linux | macOS |
|---------|---------------|-------|
| Review Current File | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Review Selection | `Ctrl+Shift+E` | `Cmd+Shift+E` |
| Explain Code | `Ctrl+Shift+X` | `Cmd+Shift+X` |
| Open AI Chat | `Ctrl+Shift+A` | `Cmd+Shift+A` |

## 📋 Available Commands

Access via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- `🔑 AI Code Reviewer: Set Gemini API Key`
- `🗑️ AI Code Reviewer: Clear API Key`
- `🔍 AI Code Reviewer: Review Current File`
- `📝 AI Code Reviewer: Review Selected Code`
- `💡 AI Code Reviewer: Explain Code`
- `🐛 AI Code Reviewer: Find Bugs`
- `⚡ AI Code Reviewer: Suggest Improvements`
- `🔒 AI Code Reviewer: Security Check`
- `🧪 AI Code Reviewer: Generate Unit Tests`
- `📖 AI Code Reviewer: Add Documentation`
- `📊 AI Code Reviewer: Review Entire Workspace`
- `💬 AI Code Reviewer: Open AI Chat`

## ⚙️ Configuration

Access settings via: `File` → `Preferences` → `Settings` → Search "AI Code Reviewer"

### Available Settings

```json
{
  // Gemini model to use
  "aiCodeReviewer.model": "gemini-1.5-flash", // or "gemini-1.5-pro"
  
  // AI temperature (0 = focused, 1 = creative)
  "aiCodeReviewer.temperature": 0.3,
  
  // Auto-review on file save
  "aiCodeReviewer.autoReviewOnSave": false,
  
  // Show inline code decorations
  "aiCodeReviewer.showInlineDecorations": true,
  
  // Maximum tokens per request
  "aiCodeReviewer.maxTokens": 8000
}
```

### Recommended Settings

**For Precise Reviews:**
```json
{
  "aiCodeReviewer.model": "gemini-1.5-pro",
  "aiCodeReviewer.temperature": 0.2
}
```

**For Creative Suggestions:**
```json
{
  "aiCodeReviewer.model": "gemini-1.5-flash",
  "aiCodeReviewer.temperature": 0.5
}
```

## 🎨 Context Menu Integration

Right-click in any code file to access:

```
🤖 AI Code Reviewer
  ├── 📝 Review Selected Code
  ├── 💡 Explain Code
  ├── 🐛 Find Bugs
  ├── 🔒 Security Check
  ├── 🧪 Generate Unit Tests
  └── 📖 Add Documentation
```

## 📊 Review History

View all past reviews in the Activity Bar:
1. Click "AI Code Reviewer" icon in Activity Bar
2. Browse "Review History"
3. Click any item to view details

## 💰 Pricing & Rate Limits

### Gemini API
- **Free Tier**: 60 requests/minute
- **Paid Tier**: Higher limits available

[Check current pricing](https://ai.google.dev/pricing)

### Best Practices
- Use `gemini-1.5-flash` for most reviews (faster, cheaper)
- Use `gemini-1.5-pro` for complex analysis (more accurate)
- Review selections instead of whole files when possible

## 🔐 Privacy & Security

- **API Key Storage**: Securely stored in VS Code's secret storage
- **Code Privacy**: Your code is sent to Google's Gemini API
- **No Data Storage**: This extension doesn't store your code
- **Network Only**: Requires internet connection

### Security Best Practices
- Never commit API keys to version control
- Use environment variables for shared projects
- Regularly rotate API keys
- Review Google's [AI Terms of Service](https://ai.google.dev/terms)

## 🐛 Troubleshooting

### Extension Not Working
```
1. Check status bar shows "AI Reviewer Ready"
2. Verify API key is set correctly
3. Check internet connection
4. Review Output panel: "Extension Host" logs
```

### API Key Invalid
```
1. Verify key starts with "AIza"
2. Check key hasn't expired
3. Verify API is enabled in Google Cloud Console
4. Generate new key if needed
```

### Rate Limit Errors
```
1. Wait a few seconds between requests
2. Consider upgrading to paid tier
3. Review only selections instead of full files
```

### No Response from AI
```
1. Check file size isn't too large (>10,000 lines)
2. Verify model is available
3. Try different model (flash vs pro)
4. Check Google AI Studio status page
```

## 📝 Development

### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/your-username/ai-code-reviewer-pro.git
cd ai-code-reviewer-pro

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile)
npm run watch

# Run extension
Press F5 in VS Code
```

### Project Structure
```
ai-code-reviewer-pro/
├── src/
│   ├── extension.ts           # Main extension entry
│   ├── prompts.ts             # AI prompts & instructions
│   ├── services/
│   │   ├── aiService.ts       # Gemini API integration
│   │   └── decorationService.ts
│   ├── panels/
│   │   ├── reviewPanel.ts     # Review results display
│   │   └── chatPanel.ts       # Interactive chat
│   └── providers/
│       └── historyProvider.ts # Review history
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

### Building VSIX Package
```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
npm run package

# Output: ai-code-reviewer-pro-1.0.0.vsix
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Inspired by GitHub Copilot
- Icons from [VS Code Codicons](https://microsoft.github.io/vscode-codicons/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-code-reviewer-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-code-reviewer-pro/discussions)
- **Email**: support@example.com

## 🗺️ Roadmap

- [ ] Claude AI integration
- [ ] GPT-4 support
- [ ] Diff view for suggestions
- [ ] Team collaboration features
- [ ] Custom prompt templates
- [ ] CI/CD integration
- [ ] Code metrics dashboard
- [ ] Multi-language support

## ⭐ Star History

If you find this extension helpful, please star the repository!

---

**Made with ❤️ by developers, for developers**

[⬆ Back to top](#-ai-code-reviewer-pro)