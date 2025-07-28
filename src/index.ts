/**
 * ElevenLabs TTS tool - Text-to-speech integration for Clanker
 * 
 * This tool installs a hook that converts all Clanker messages to speech
 * using the ElevenLabs API.
 */

import { createTool, ToolCategory, ToolCapability, ToolContext, ToolArguments } from '@ziggler/clanker';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

// Global state for the hook
let hookEnabled = false;
let apiKey: string | undefined;
let voiceId: string = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)
let modelId: string = 'eleven_monolingual_v1';
let outputDir: string;

/**
 * ElevenLabs TTS tool - Installs a hook to playback all messages
 */
export default createTool()
    .id('elevenlabs_tts')
    .name('ElevenLabs TTS')
    .description('ElevenLabs text-to-speech integration that hooks into Clanker to playback all messages')
    .category(ToolCategory.Utility)
    .capabilities(ToolCapability.NetworkAccess, ToolCapability.SystemExecute)
    .tags('elevenlabs', 'tts', 'text-to-speech', 'audio', 'voice', 'hook')

    // Arguments
    .stringArg('action', 'Action to perform: enable, disable, or status', {
        required: true,
        enum: ['enable', 'disable', 'status', 'test']
    })
    
    .stringArg('api_key', 'ElevenLabs API key (required for enable)', {
        required: false
    })
    
    .stringArg('voice_id', 'ElevenLabs voice ID to use', {
        required: false,
        default: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
    })
    
    .stringArg('model_id', 'ElevenLabs model to use', {
        required: false,
        default: 'eleven_monolingual_v1',
        enum: ['eleven_monolingual_v1', 'eleven_multilingual_v1', 'eleven_multilingual_v2']
    })
    
    .booleanArg('auto_play', 'Automatically play audio after generation', {
        required: false,
        default: true
    })

    // Initialize
    .onInitialize(async (context: ToolContext) => {
        // Set up output directory for audio files
        outputDir = path.join(os.tmpdir(), 'clanker-tts');
        await fs.mkdir(outputDir, { recursive: true });
        
        context.logger?.debug(`TTS output directory: ${outputDir}`);
        
        // Load saved configuration if exists
        const configPath = path.join(os.homedir(), '.clanker', 'elevenlabs-config.json');
        try {
            const config = await fs.readFile(configPath, 'utf-8');
            const parsed = JSON.parse(config);
            if (parsed.apiKey) apiKey = parsed.apiKey;
            if (parsed.voiceId) voiceId = parsed.voiceId;
            if (parsed.modelId) modelId = parsed.modelId;
            if (parsed.enabled) hookEnabled = parsed.enabled;
        } catch {
            // Config doesn't exist yet
        }
    })

    // Execute
    .execute(async (args: ToolArguments, context: ToolContext) => {
        const { action, api_key, voice_id, model_id, auto_play } = args;

        switch (action) {
            case 'enable':
                return await enableHook(api_key as string, voice_id as string, model_id as string, auto_play as boolean, context);
            
            case 'disable':
                return await disableHook(context);
            
            case 'status':
                return await getStatus(context);
            
            case 'test':
                return await testTTS('Hello! This is a test of the ElevenLabs text-to-speech integration.', auto_play as boolean, context);
            
            default:
                return {
                    success: false,
                    error: `Unknown action: ${action}`
                };
        }
    })

    // Examples
    .examples([
        {
            description: 'Enable TTS with your API key',
            arguments: {
                action: 'enable',
                api_key: 'your-api-key-here'
            },
            result: 'TTS hook enabled successfully'
        },
        {
            description: 'Test TTS functionality',
            arguments: {
                action: 'test'
            },
            result: 'Plays test message'
        },
        {
            description: 'Disable TTS hook',
            arguments: {
                action: 'disable'
            },
            result: 'TTS hook disabled'
        },
        {
            description: 'Check TTS status',
            arguments: {
                action: 'status'
            },
            result: 'Shows current TTS configuration'
        }
    ])
    
    .build();

// Enable the TTS hook
async function enableHook(
    apiKeyInput: string, 
    voiceIdInput: string, 
    modelIdInput: string, 
    autoPlay: boolean,
    context: ToolContext
): Promise<any> {
    if (!apiKeyInput) {
        return {
            success: false,
            error: 'API key is required to enable TTS. Get one at https://elevenlabs.io'
        };
    }

    // Update configuration
    apiKey = apiKeyInput;
    voiceId = voiceIdInput;
    modelId = modelIdInput;
    hookEnabled = true;

    // Save configuration
    const configPath = path.join(os.homedir(), '.clanker', 'elevenlabs-config.json');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify({
        apiKey,
        voiceId,
        modelId,
        enabled: true,
        autoPlay
    }, null, 2));

    // Install the hook into Clanker
    await installHook(context);

    context.logger?.info('ElevenLabs TTS hook enabled');
    
    return {
        success: true,
        output: `TTS hook enabled successfully!\n` +
                `Voice ID: ${voiceId}\n` +
                `Model: ${modelId}\n` +
                `Auto-play: ${autoPlay ? 'enabled' : 'disabled'}\n\n` +
                `All Clanker messages will now be converted to speech.`,
        data: {
            enabled: true,
            voiceId,
            modelId,
            autoPlay
        }
    };
}

// Disable the TTS hook
async function disableHook(context: ToolContext): Promise<any> {
    hookEnabled = false;

    // Update saved configuration
    const configPath = path.join(os.homedir(), '.clanker', 'elevenlabs-config.json');
    try {
        const config = await fs.readFile(configPath, 'utf-8');
        const parsed = JSON.parse(config);
        parsed.enabled = false;
        await fs.writeFile(configPath, JSON.stringify(parsed, null, 2));
    } catch {
        // Config doesn't exist
    }

    // Remove the hook
    await removeHook(context);

    context.logger?.info('ElevenLabs TTS hook disabled');

    return {
        success: true,
        output: 'TTS hook disabled. Messages will no longer be converted to speech.'
    };
}

// Get current status
async function getStatus(context: ToolContext): Promise<any> {
    const configPath = path.join(os.homedir(), '.clanker', 'elevenlabs-config.json');
    let config: any = {};
    
    try {
        const configData = await fs.readFile(configPath, 'utf-8');
        config = JSON.parse(configData);
    } catch {
        // No config exists
    }

    const status = config.enabled ? 'enabled' : 'disabled';
    const hasApiKey = !!config.apiKey;

    return {
        success: true,
        output: `ElevenLabs TTS Status:\n` +
                `Hook: ${status}\n` +
                `API Key: ${hasApiKey ? 'configured' : 'not configured'}\n` +
                `Voice ID: ${config.voiceId || 'default'}\n` +
                `Model: ${config.modelId || 'eleven_monolingual_v1'}\n` +
                `Auto-play: ${config.autoPlay !== false ? 'enabled' : 'disabled'}\n` +
                `Audio output: ${outputDir}`,
        data: {
            enabled: config.enabled || false,
            hasApiKey,
            voiceId: config.voiceId,
            modelId: config.modelId,
            autoPlay: config.autoPlay !== false
        }
    };
}

// Test TTS functionality
async function testTTS(text: string, autoPlay: boolean, context: ToolContext): Promise<any> {
    if (!apiKey) {
        return {
            success: false,
            error: 'API key not configured. Run with action="enable" first.'
        };
    }

    try {
        const audioFile = await generateSpeech(text, context);
        
        if (autoPlay) {
            await playAudio(audioFile, context);
        }

        return {
            success: true,
            output: `Test speech generated successfully!\nAudio file: ${audioFile}`,
            data: {
                audioFile,
                played: autoPlay
            }
        };
    } catch (error) {
        return {
            success: false,
            error: `TTS test failed: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

// Generate speech using ElevenLabs API
async function generateSpeech(text: string, context: ToolContext): Promise<string> {
    if (!apiKey) {
        throw new Error('API key not configured');
    }

    // Clean text for TTS (remove markdown, special characters, etc.)
    const cleanText = text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/[*_~`#]/g, '') // Remove markdown formatting
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .trim();

    if (!cleanText) {
        throw new Error('No speakable text after cleaning');
    }

    // Generate unique filename
    const hash = crypto.createHash('md5').update(cleanText).digest('hex');
    const audioFile = path.join(outputDir, `${hash}.mp3`);

    // Check if audio already exists
    try {
        await fs.access(audioFile);
        context.logger?.debug('Audio file already exists, using cached version');
        return audioFile;
    } catch {
        // File doesn't exist, generate it
    }

    context.logger?.debug(`Generating speech for: ${cleanText.substring(0, 50)}...`);

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
        },
        body: JSON.stringify({
            text: cleanText,
            model_id: modelId,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    // Save audio file
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(audioFile, buffer);

    context.logger?.info(`Speech generated: ${audioFile}`);
    return audioFile;
}

// Play audio file
async function playAudio(audioFile: string, context: ToolContext): Promise<void> {
    const platform = os.platform();
    let command: string;

    switch (platform) {
        case 'darwin': // macOS
            command = `afplay "${audioFile}"`;
            break;
        case 'linux':
            // Try multiple players in order of preference
            try {
                await execAsync('which mpg123');
                command = `mpg123 -q "${audioFile}"`;
            } catch {
                try {
                    await execAsync('which play');
                    command = `play -q "${audioFile}"`;
                } catch {
                    command = `aplay "${audioFile}"`;
                }
            }
            break;
        case 'win32': // Windows
            command = `powershell -c "(New-Object Media.SoundPlayer '${audioFile}').PlaySync()"`;
            break;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }

    context.logger?.debug(`Playing audio with: ${command}`);
    await execAsync(command);
}

// Install the hook into Clanker
async function installHook(context: ToolContext): Promise<void> {
    // Create a hook script that Clanker will execute
    const hookScript = `
// ElevenLabs TTS Hook
if (typeof global.clankerHooks === 'undefined') {
    global.clankerHooks = {};
}

global.clankerHooks.elevenlabsTTS = {
    onMessage: async (message) => {
        try {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            
            // Call the elevenlabs_tts tool to generate speech
            await execAsync(\`clanker -p "use elevenlabs_tts to test '\${message.replace(/'/g, "\\'")}' "\`);
        } catch (error) {
            console.error('TTS hook error:', error);
        }
    }
};
`;

    // Write hook to Clanker hooks directory
    const hooksDir = path.join(os.homedir(), '.clanker', 'hooks');
    await fs.mkdir(hooksDir, { recursive: true });
    await fs.writeFile(path.join(hooksDir, 'elevenlabs-tts.js'), hookScript);

    context.logger?.info('TTS hook installed');
}

// Remove the hook from Clanker
async function removeHook(context: ToolContext): Promise<void> {
    const hookPath = path.join(os.homedir(), '.clanker', 'hooks', 'elevenlabs-tts.js');
    try {
        await fs.unlink(hookPath);
        context.logger?.info('TTS hook removed');
    } catch {
        // Hook file doesn't exist
    }
}