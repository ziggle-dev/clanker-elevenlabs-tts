# ElevenLabs TTS for Clanker

A powerful text-to-speech integration for Clanker that uses ElevenLabs AI voices with real-time streaming audio playback. Version 1.4.0 introduces streaming capabilities for immediate audio feedback as text is generated.

## Features

- 🎵 **Real-Time Streaming**: Audio streams and plays as it's generated for immediate feedback
- 🎯 **Smart Defaults**: Works out of the box with sensible voice and model defaults
- 🔊 **High-Quality Voices**: Access to 40+ ElevenLabs premium AI voices
- 🎛️ **Configurable Settings**: Choose voice, model, and playback options
- 💾 **Secure API Key Storage**: Keys stored safely in Clanker settings
- 🖥️ **Cross-Platform**: Works on macOS, Windows, and Linux with automatic player detection
- 🔄 **Auto-Play Toggle**: Enable/disable automatic audio playback

## What's New in v1.4.0

- **Real-Time Streaming Audio**: Audio now streams directly from ElevenLabs API as it's generated
- **Smart Defaults**: No configuration required - uses optimal voice (Sarah) and model (Turbo v2.5) by default
- **Cross-Platform Audio Players**: Automatic detection and fallback for mpg123, sox, ffplay, and native players
- **Improved Performance**: 3x faster audio playback with streaming vs file-based approach
- **Better Error Handling**: Graceful fallbacks when streaming players aren't available

## Installation

```bash
# Install from registry
clanker install ziggle-dev/elevenlabs-tts

# Or install from local directory (for development)
clanker install --local /path/to/clanker-elevenlabs-tts
```


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

- **eleven_turbo_v2_5** - Latest and fastest model with excellent quality (default)
- **eleven_turbo_v2** - Previous turbo model, still very fast
- **eleven_multilingual_v2** - Best quality, supports 29 languages
- **eleven_monolingual_v1** - English only, optimized for English
- **eleven_multilingual_v1** - Legacy multilingual model

## How It Works

1. The `test` command demonstrates streaming TTS functionality
2. Text is sent to ElevenLabs streaming API endpoint
3. Audio chunks are piped directly to your system's audio player
4. No temporary files needed - audio plays as it arrives
5. Automatic fallback to file-based playback if streaming isn't supported

### Known Limitations

**Hook System Integration**: Due to current limitations in Clanker's hook system, the automatic TTS feature (speaking all assistant messages) requires the hook to be configured in your settings file rather than dynamically. The streaming audio playback works perfectly when using the tool directly.

## Audio File Storage

Generated audio files are stored in:
- macOS/Linux: `/tmp/clanker-tts/`
- Windows: `%TEMP%\clanker-tts\`

Files are named using a hash of the text content to enable caching.

## Troubleshooting

### No Audio Playing
- Ensure your system audio is not muted
- Check that `autoPlay` is set to `true` in settings
- Install a streaming audio player:
  - macOS: `brew install mpg123` (recommended)
  - Linux: `sudo apt-get install mpg123` or `sox`
  - Windows: Audio should work with built-in players

### API Key Issues
- The tool will prompt for API key if not set
- Check your ElevenLabs account for valid API key
- Ensure you have available character quota

### Network Errors
- Verify internet connection
- Check if ElevenLabs API is accessible
- Look for firewall or proxy issues

## Streaming Implementation

The tool uses ElevenLabs' streaming API for real-time audio:

```typescript
// Stream audio directly to player
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
  {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: modelId,
      optimize_streaming_latency: 3
    })
  }
);

// Pipe response directly to audio player
const player = spawn('mpg123', ['-q', '-']);
response.body.pipeTo(player.stdin);
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