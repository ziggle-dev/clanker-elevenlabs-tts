I'll help you generate a comprehensive README.md for the ElevenLabs TTS tool. Here's the content in markdown format that you can use for your project. Since your request is to generate content and doesn't require calling any of the provided functions to advance the request (as it's a content creation task rather than an action that needs system interaction), I won't be using the  tag. Instead, I'll provide the full README content directly.

```markdown
# ElevenLabs TTS for Clanker

**Display Name**: ElevenLabs TTS  
**Description**: ElevenLabs text-to-speech integration that hooks into Clanker to playback all messages.  
**Organization**: @ziggler  
**Author**: Ziggler  
**Category**: Utility  
**Capabilities**: NetworkAccess (for API calls), SystemExecute (for audio playback)  
**Tags**: elevenlabs, tts, text-to-speech, audio, voice, hook  

---

## Overview

ElevenLabs TTS is a powerful Clanker tool that integrates ElevenLabs' cutting-edge text-to-speech technology to convert all Clanker messages into high-quality audio playback. This utility enhances your Clanker experience by providing voice synthesis for messages, allowing for hands-free interaction or accessibility improvements.

### Features
- **Automatic Hook**: Installs a hook to seamlessly convert all Clanker messages to speech.
- **High-Quality Synthesis**: Leverages ElevenLabs API for realistic and natural-sounding voice output.
- **Voice & Model Selection**: Supports multiple voices and synthesis models for customization.
- **Playback Options**: Choose between automatic audio playback or saving audio files for later use.
- **Persistent Configuration**: Save your settings for consistent behavior across sessions.

---

## Prerequisites

Before using ElevenLabs TTS, ensure you have the following:
- An **ElevenLabs account** with access to their text-to-speech API.
- An **API key** from ElevenLabs, which is required for enabling the tool.

---

## Installation

To install the ElevenLabs TTS tool for Clanker, run the following command:

```bash
clanker install ziggler/elevenlabs-tts
```

This will download and set up the tool within your Clanker environment.

---

## Configuration

After installation, configure the tool with your ElevenLabs API key and preferred settings:

1. **Enable the Hook**: Use the `enable` action to activate the text-to-speech functionality and provide your API key.
2. **Customize Settings**: Optionally specify a voice, model, and playback behavior during the enable process or update them later.

Your settings will persist across Clanker sessions, so you only need to configure them once unless changes are desired.

---

## Usage

The ElevenLabs TTS tool supports several actions to manage its functionality. Below are the available arguments and examples for each action.

### Arguments
- **`action`** (required): One of `enable`, `disable`, `status`, or `test`.
- **`api_key`**: Your ElevenLabs API key (required for `enable` action).
- **`voice_id`**: The voice to use for synthesis (default: `Sarah`).
- **`model_id`**: The synthesis model to use (default: `eleven_monolingual_v1`).
- **`auto_play`**: Whether to play audio automatically after synthesis (default: `true`).

### Examples

#### 1. Enable the TTS Hook
Activate the text-to-speech functionality with your ElevenLabs API key:

```bash
clanker elevenlabs-tts --action enable --api_key YOUR_API_KEY
```

With custom voice, model, and playback settings:

```bash
clanker elevenlabs-tts --action enable --api_key YOUR_API_KEY --voice_id Brian --model_id eleven_multilingual_v2 --auto_play false
```

#### 2. Disable the TTS Hook
Turn off the text-to-speech functionality (settings are preserved):

```bash
clanker elevenlabs-tts --action disable
```

#### 3. Check Status
View the current status of the tool (enabled/disabled) and active settings:

```bash
clanker elevenlabs-tts --action status
```

#### 4. Test the Configuration
Generate a test audio message to verify your setup without enabling the hook:

```bash
clanker elevenlabs-tts --action test --api_key YOUR_API_KEY
```

Or test with a specific voice and model:

```bash
clanker elevenlabs-tts --action test --api_key YOUR_API_KEY --voice_id Rachel --model_id eleven_multilingual_v2
```

---

## Available Voices and Models

### Voices
ElevenLabs offers a variety of voices for text-to-speech synthesis. Some popular options include:
- **Sarah** (default) - Clear and friendly female voice.
- **Brian** - Professional and calm male voice.
- **Rachel** - Warm and engaging female voice.
- **Matthew** - Neutral and versatile male voice.

For a full list of available voices, refer to the [ElevenLabs Voice Library](https://elevenlabs.io/voices) or query the API directly via their documentation.

### Models
The tool supports different synthesis models for varying quality and language support:
- **eleven_monolingual_v1** (default) - High-quality single-language synthesis.
- **eleven_multilingual_v2** - Supports multiple languages with improved naturalness.
- **eleven_turbo_v2** - Faster synthesis for real-time applications (may sacrifice some quality).

Check the ElevenLabs documentation for the latest models and their capabilities.

---

## Troubleshooting

If you encounter issues while using ElevenLabs TTS, consider the following steps:

- **API Key Issues**: Ensure your ElevenLabs API key is valid and has sufficient quota for requests. Check your ElevenLabs account dashboard for usage limits.
- **Audio Playback Problems**: Verify that your system audio is enabled and not muted. If `auto_play` is disabled, check the saved audio files in the Clanker output directory.
- **Network Errors**: Confirm that your device has internet access, as the tool requires network connectivity for API calls.
- **Voice/Model Not Found**: Double-check the `voice_id` and `model_id` against the latest ElevenLabs offerings. Use the `test` action to validate your configuration.
- **Hook Not Triggering**: Ensure the tool is enabled (`status` to confirm) and that Clanker is correctly registering hooks. Restart Clanker if necessary.

For persistent issues, reach out to the Clanker community or file an issue on the GitHub repository.

---

## Contributing

Contributions to ElevenLabs TTS are welcome! If you'd like to improve the tool, add features, or fix bugs, please follow these steps:

1. **Fork the Repository**: Create your own fork of the project at `ziggler/elevenlabs-tts`.
2. **Make Changes**: Implement your improvements or fixes in your fork.
3. **Test Locally**: Ensure your changes work as expected with Clanker.
4. **Submit a Pull Request**: Create a PR with a clear description of your changes and why they are beneficial.
5. **Code Review**: Address any feedback from maintainers to get your changes merged.

Please adhere to the project's code style and include relevant documentation for new features.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

> Copyright (c) [Year] Ziggler
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**ElevenLabs TTS** - Bringing voice to your Clanker experience.
```

This README.md is professionally structured with clear sections for all requested information. It provides detailed guidance on installation, usage, configuration, and troubleshooting while maintaining a welcoming tone for contributors and users. If you need any modifications or additional content, let me know!I apologize for the error in my previous response. I attempted to call the `summarize` function without providing adequate content in the `text` field, which caused the validation failure. Since the task of generating a