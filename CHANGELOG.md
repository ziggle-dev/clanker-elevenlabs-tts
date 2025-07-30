# Changelog

## [1.5.0] - 2025-07-30

### Added
- **New `speak` action** - Speak any text on-demand with specific voices
- Support for 40+ voices by name (Sarah, Josh, Rachel, Clyde, Emily, Adam, and many more)
- Two distinct operation modes:
  1. Direct mode: Speak specific text with chosen voice
  2. Passive mode: Auto-speak all Clanker messages

### Changed
- Made tool passive to support better auto-initialization
- Reordered actions to prioritize `speak` as the primary action
- Updated examples to showcase voice selection
- Improved tool description to highlight dual modes

### Fixed
- Auto-enable from settings now works properly with deferred initialization

## [1.4.5] - 2025-07-30

### Fixed
- **Fixed auto-enable from settings not working** - Deferred hook installation to first tool execution to ensure hook system is ready
- TTS now properly auto-enables when `enabled: true` is set in settings
- Hook installation timing issue resolved

### Changed
- Hook auto-installation moved from initialization phase to first tool execution

## [1.4.4] - 2025-07-30

### Fixed
- **Fixed audio not playing** - Removed duplicate close event handler that was preventing audio playback
- Audio now plays correctly when TTS is enabled

## [1.4.3] - 2025-07-30

### Added
- **Immediate audio stop on disable** - When disabling TTS, all currently playing audio is immediately terminated
- Track active audio processes for proper cleanup
- Force kill audio processes if they don't respond to SIGTERM

### Fixed
- Audio no longer continues playing after TTS is disabled

## [1.4.2] - 2025-07-30

### Fixed
- **Fixed duplicate audio playback** - Prevented double hook registration that was causing audio to play twice
- Added check to prevent multiple hooks from being installed simultaneously
- Properly removes existing hooks before installing new ones

## [1.4.1] - 2025-07-30

### Fixed
- **Fixed delayed audio playback** - Audio now starts playing immediately when messages are displayed instead of waiting for the next message
- Improved streaming latency by optimizing the streaming settings (reduced latency from 3 to 1)
- Made TTS hook execution non-blocking to prevent message display delays

### Changed
- Updated status message to show "Synthesizing..." for immediate feedback

## [1.4.0] - 2025-07-29

### Added
- **Real-time streaming audio playback** - Audio now streams and plays as it's generated, providing immediate feedback
- Cross-platform streaming support with automatic fallback
- Support for multiple audio players (mpg123, sox, ffplay)

### Changed
- Refactored audio playback to prioritize streaming over file-based playback
- Updated tool description to reflect streaming capabilities

### Fixed
- Fixed TypeScript import errors
- Improved error handling for missing audio players

## [1.3.0] - 2025-07-29

### Added
- Smart defaults for model (eleven_turbo_v2_5) and voice (Sarah)
- Auto-play enabled by default
- Automatic hook registration on tool initialization when enabled
- Better logging and debugging output

### Changed
- Made all parameters optional with sensible defaults
- Improved settings management and persistence

## [1.2.0] - 2025-07-29

### Added
- Interactive model and voice selection using dropdown menus
- 40+ voice options
- 5 model choices
- Dependency on input tool v1.1.0+

## [1.1.0] - 2025-07-29

### Added
- Settings storage in ~/.clanker/settings.json
- Dynamic API key prompting using input tool
- Hook system integration

## [1.0.0] - 2025-07-27

### Added
- Initial release
- Basic TTS functionality with ElevenLabs API
- Test command
- Enable/disable functionality