# ElevenLabs TTS for Clanker

A powerful text-to-speech integration for Clanker that uses ElevenLabs AI voices to read messages aloud. Version 1.1.0 introduces integration with Clanker's new hook system for seamless audio playback.

## Features

- 🎯 **Automatic TTS Hook**: Converts all assistant messages to speech automatically
- 🔊 **High-Quality Voices**: Access to ElevenLabs' premium AI voices
- 🎛️ **Configurable Settings**: Choose voice, model, and playback options
- 💾 **Secure API Key Storage**: Keys stored safely in Clanker settings
- 🔄 **Dynamic Configuration**: Prompts for API key when needed using the input tool
- 🪝 **Hook System Integration**: Leverages Clanker v0.3.0's hook system

## What's New in v1.1.0

- **Hook System Integration**: Now uses Clanker's native hook system instead of file-based hooks
- **Automatic API Key Prompting**: Uses the input tool to request API key when not configured
- **Settings Management**: API keys stored in `.clanker/settings.json` under tools section
- **Dependency Declaration**: Automatically installs required `input` tool if not present

## Installation

```bash
# Install from registry
clanker install ziggle-dev/elevenlabs-tts

# Or install from local directory (for development)
clanker install --local /path/to/clanker-elevenlabs-tts
```

The tool will automatically install its dependency (`ziggle-dev/input`) if not already installed.

## Configuration

The tool stores its configuration in `~/.clanker/settings.json`:

```json
{
  "tools": {
    "elevenlabs-tts": {
      "apiKey": "your-api-key-here",
      "voiceId": "EXAVITQu4vr4xnSDxMaL",
      "modelId": "eleven_multilingual_v2",
      "autoPlay": true
    }
  }
}
```

## Usage

### Enable TTS
```bash
clanker elevenlabs-tts enable
```

If no API key is configured, the tool will automatically prompt you to enter one using the input tool.

### Disable TTS
```bash
clanker elevenlabs-tts disable
```

### Check Status
```bash
clanker elevenlabs-tts status
```

### Test TTS
```bash
clanker elevenlabs-tts test
```

### Configure Settings
```bash
# Set a different voice
clanker elevenlabs-tts enable --voice-id Rachel

# Use a different model
clanker elevenlabs-tts enable --model-id eleven_turbo_v2

# Disable auto-play (saves files instead)
clanker elevenlabs-tts enable --auto-play false
```

## Available Voices

Some popular ElevenLabs voices:
- **Sarah** - Clear and friendly female voice (default)
- **Rachel** - Natural conversational female voice  
- **Brian** - Professional male voice
- **Matthew** - Warm male voice

Visit [ElevenLabs Voice Library](https://elevenlabs.io/voice-lab) for the full list.

## Available Models

- **eleven_multilingual_v2** - Best quality, supports 29 languages (default)
- **eleven_monolingual_v1** - English only, slightly faster
- **eleven_turbo_v2** - Fastest, lower latency

## How It Works

1. When enabled, the tool registers a `PostMessage` hook with Clanker
2. The hook intercepts all assistant messages
3. Messages are sent to ElevenLabs API for synthesis
4. Audio is cached locally to avoid repeated API calls
5. If auto-play is enabled, audio plays automatically
6. Audio files are saved to a temporary directory

## Audio File Storage

Generated audio files are stored in:
- macOS/Linux: `/tmp/clanker-tts/`
- Windows: `%TEMP%\clanker-tts\`

Files are named using a hash of the text content to enable caching.

## Troubleshooting

### No Audio Playing
- Ensure your system audio is not muted
- Check that `autoPlay` is set to `true` in settings
- Verify the `afplay` command works on your system (macOS)
- On Linux, install `sox` for audio playback

### API Key Issues
- The tool will prompt for API key if not set
- Check your ElevenLabs account for valid API key
- Ensure you have available character quota

### Network Errors
- Verify internet connection
- Check if ElevenLabs API is accessible
- Look for firewall or proxy issues

## Hook System Details

The tool uses Clanker's hook system to intercept messages:

```typescript
// Registers a PostMessage hook
context.hooks.register({
  id: 'elevenlabs-tts-hook',
  name: 'ElevenLabs TTS',
  event: HookEvent.PostMessage,
  handler: async (input, hookContext) => {
    if (input.role === 'assistant') {
      // Synthesize and play audio
    }
  }
});
```

## Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/ziggle-dev/clanker-elevenlabs-tts
cd clanker-elevenlabs-tts

# Install dependencies
npm install

# Link local Clanker for development
npm link @ziggler/clanker

# Install locally for testing
clanker install --local .
```

### Project Structure
```
clanker-elevenlabs-tts/
├── src/
│   └── index.ts       # Main tool implementation
├── package.json       # Tool metadata and dependencies
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add appropriate documentation
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/ziggle-dev/clanker-elevenlabs-tts/issues)
- **Discussions**: [Clanker Community](https://github.com/zigglers/clanker/discussions)

---

Made with ❤️ by the Ziggler team