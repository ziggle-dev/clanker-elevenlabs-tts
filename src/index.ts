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

// Settings interface for ElevenLabs TTS
interface ElevenLabsSettings {
    apiKey?: string;
    voiceId?: string;
    modelId?: string;
    enabled?: boolean;
    autoPlay?: boolean;
}

// Global state for the hook
let hookEnabled = false;
let apiKey: string | undefined;
let voiceId: string = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)
let modelId: string = 'eleven_turbo_v2_5'; // Default to newest model
let outputDir: string;
let settingsPath: string;

// Available models and voices
const AVAILABLE_MODELS = [
    { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5 (Latest, fastest)' },
    { id: 'eleven_turbo_v2', name: 'Eleven Turbo v2' },
    { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2' },
    { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1' },
    { id: 'eleven_multilingual_v1', name: 'Eleven Multilingual v1' }
];

const AVAILABLE_VOICES = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
    { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave' },
    { id: 'D38z5RcWu1voky8WS1ja', name: 'Fin' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
    { id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
    { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
    { id: 'ODq5zmih8GrVes37Dizd', name: 'Patrick' },
    { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
    { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Alice' },
    { id: 'Yko7PKHZNXotIFUBG7I9', name: 'Matilda' },
    { id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James' },
    { id: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph' },
    { id: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy' },
    { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael' },
    { id: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan' },
    { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi' },
    { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya' },
    { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },
    { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
    { id: 't0jbNlBVZ17f02VDIeMI', name: 'Jessie' },
    { id: 'wViXBPUzp2ZZixB1xQuM', name: 'Glinda' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
    { id: 'z9fAnlkpzviPz146aGWa', name: 'Nicole' },
    { id: 'zcAOhNBS3c14rBihAFp1', name: 'Giovanni' },
    { id: 'zrHiDhphv9ZnVXBqCLjz', name: 'Mimi' }
];

/**
 * ElevenLabs TTS tool - Installs a hook to playback all messages
 */
export default createTool()
    .id('elevenlabs_tts')
    .name('ElevenLabs TTS')
    .description('ElevenLabs text-to-speech integration that hooks into Clanker to playback all messages. Features interactive model and voice selection using dropdown menus. Requires the input tool v1.1.0+ for prompts.')
    .category(ToolCategory.Utility)
    .capabilities(ToolCapability.NetworkAccess, ToolCapability.SystemExecute)
    .tags('elevenlabs', 'tts', 'text-to-speech', 'audio', 'voice', 'hook')

    // Arguments
    .stringArg('action', 'Action to perform: enable, disable, or status', {
        required: true,
        enum: ['enable', 'disable', 'status', 'test']
    })
    
    .stringArg('api_key', 'ElevenLabs API key (will prompt if not provided)', {
        required: false
    })
    
    .stringArg('voice_id', 'ElevenLabs voice ID to use', {
        required: false,
        default: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
    })
    
    .stringArg('model_id', 'ElevenLabs model to use', {
        required: false,
        default: 'eleven_turbo_v2_5',
        enum: ['eleven_turbo_v2_5', 'eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_monolingual_v1', 'eleven_multilingual_v1']
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
        
        // Set up settings path
        settingsPath = path.join(os.homedir(), '.clanker', 'settings.json');
        
        // Load saved configuration from settings.json
        const settings = await loadToolSettings();
        if (settings) {
            if (settings.apiKey) apiKey = settings.apiKey;
            if (settings.voiceId) voiceId = settings.voiceId;
            if (settings.modelId) modelId = settings.modelId;
            if (settings.enabled) hookEnabled = settings.enabled;
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
            description: 'Enable TTS (will prompt for API key if needed)',
            arguments: {
                action: 'enable'
            },
            result: 'TTS hook enabled successfully'
        },
        {
            description: 'Enable TTS with specific API key',
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
            result: 'Plays test message (prompts for API key if needed)'
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
    // If no API key provided in args, try to get it from settings or prompt user
    let finalApiKey = apiKeyInput;
    if (!finalApiKey) {
        finalApiKey = await getApiKey(context) || '';
        if (!finalApiKey) {
            return {
                success: false,
                error: 'API key is required to enable TTS. Get one at https://elevenlabs.io'
            };
        }
    }

    // If no model provided, prompt for selection
    let finalModelId = modelIdInput;
    if (!finalModelId) {
        finalModelId = await selectModel(context);
        if (!finalModelId) {
            return {
                success: false,
                error: 'Model selection cancelled'
            };
        }
    }

    // If no voice provided, prompt for selection  
    let finalVoiceId = voiceIdInput;
    if (!finalVoiceId) {
        finalVoiceId = await selectVoice(context);
        if (!finalVoiceId) {
            return {
                success: false,
                error: 'Voice selection cancelled'
            };
        }
    }

    // Update configuration
    apiKey = finalApiKey;
    voiceId = finalVoiceId;
    modelId = finalModelId;
    hookEnabled = true;

    // Save configuration to settings.json
    await saveToolSettings({
        apiKey,
        voiceId,
        modelId,
        enabled: true,
        autoPlay
    });

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
    const settings = await loadToolSettings() || {};
    await saveToolSettings({
        ...settings,
        enabled: false
    });

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
    const config = await loadToolSettings() || {};
    
    const status = config.enabled ? 'enabled' : 'disabled';
    const hasApiKey = !!config.apiKey;
    
    // Get friendly names for voice and model
    const voiceName = AVAILABLE_VOICES.find(v => v.id === config.voiceId)?.name || config.voiceId || 'not selected';
    const modelName = AVAILABLE_MODELS.find(m => m.id === config.modelId)?.name || config.modelId || 'not selected';

    return {
        success: true,
        output: `ElevenLabs TTS Status:\n` +
                `Hook: ${status}\n` +
                `API Key: ${hasApiKey ? 'configured' : 'not configured'}\n` +
                `Voice: ${voiceName}\n` +
                `Model: ${modelName}\n` +
                `Auto-play: ${config.autoPlay !== false ? 'enabled' : 'disabled'}\n` +
                `Audio output: ${outputDir}`,
        data: {
            enabled: config.enabled || false,
            hasApiKey,
            voiceId: config.voiceId,
            voiceName,
            modelId: config.modelId,
            modelName,
            autoPlay: config.autoPlay !== false
        }
    };
}

// Test TTS functionality
async function testTTS(text: string, autoPlay: boolean, context: ToolContext): Promise<any> {
    // Ensure we have an API key
    const currentApiKey = await getApiKey(context);
    if (!currentApiKey) {
        return {
            success: false,
            error: 'API key not configured. Run with action="enable" first or provide your API key.'
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
    // Ensure we have an API key
    const currentApiKey = await getApiKey(context);
    if (!currentApiKey) {
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
            'xi-api-key': currentApiKey
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

// Install the hook into Clanker using the new hook system
async function installHook(context: ToolContext): Promise<void> {
    if (!context.hooks) {
        throw new Error('Hook system not available in context');
    }
    
    // Register a PostMessage hook to speak all assistant messages
    context.hooks.register({
        id: 'elevenlabs-tts-assistant',
        name: 'ElevenLabs TTS for Assistant',
        description: 'Speaks assistant messages using ElevenLabs TTS',
        event: 'PostMessage',
        matcher: (role: string) => role === 'assistant',
        priority: 10,
        handler: async (input: any, hookContext: any) => {
            // Only process assistant messages
            if (input.role !== 'assistant' || !input.content) {
                return { continue: true };
            }
            
            try {
                // Generate speech for the message
                const audioFile = await generateSpeech(input.content, context);
                
                // Get autoPlay setting
                const settings = await loadToolSettings();
                if (settings?.autoPlay !== false) {
                    await playAudio(audioFile, context);
                }
                
                return {
                    continue: true,
                    data: {
                        audioFile,
                        played: settings?.autoPlay !== false
                    }
                };
            } catch (error) {
                context.logger?.error('TTS generation failed:', error);
                return {
                    continue: true,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        },
        aiDescription: 'Converts assistant text responses to speech using ElevenLabs API',
        capabilities: ['audio-generation', 'text-to-speech']
    });
    
    context.logger?.info('TTS hook registered with new hook system');
}

// Remove the hook from Clanker
async function removeHook(context: ToolContext): Promise<void> {
    if (context.hooks) {
        context.hooks.unregister('elevenlabs-tts-assistant');
        context.logger?.info('TTS hook unregistered');
    }
}

// Helper functions for managing tool settings in .clanker/settings.json
async function loadToolSettings(): Promise<ElevenLabsSettings | null> {
    try {
        await fs.mkdir(path.dirname(settingsPath), { recursive: true });
        const settingsData = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(settingsData);
        
        // Extract elevenlabs-specific settings from tools section
        return settings.tools?.elevenlabs || null;
    } catch {
        // Settings file doesn't exist yet
        return null;
    }
}

async function saveToolSettings(toolSettings: ElevenLabsSettings): Promise<void> {
    try {
        await fs.mkdir(path.dirname(settingsPath), { recursive: true });
        
        let settings: any = {};
        try {
            const existingData = await fs.readFile(settingsPath, 'utf-8');
            settings = JSON.parse(existingData);
        } catch {
            // File doesn't exist, start with empty object
        }
        
        // Ensure tools section exists
        if (!settings.tools) {
            settings.tools = {};
        }
        
        // Update elevenlabs settings
        settings.tools.elevenlabs = toolSettings;
        
        // Save back to file
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Get API key, prompting user if necessary
async function getApiKey(context: ToolContext): Promise<string | null> {
    // First check if API key is in memory
    if (apiKey) {
        return apiKey;
    }
    
    // Try to load from settings
    const settings = await loadToolSettings();
    if (settings?.apiKey) {
        apiKey = settings.apiKey;
        return apiKey;
    }
    
    // If no API key, try to prompt user using input tool
    try {
        const result = await context.registry.execute('input', {
            prompt: 'Please enter your ElevenLabs API key:',
            title: 'ElevenLabs API Key Required',
            type: 'password'
        });
        
        if (result.success && result.output) {
            // Save the API key
            apiKey = result.output as string;
            await saveToolSettings({
                ...settings,
                apiKey
            });
            return apiKey;
        }
    } catch (error) {
        context.logger?.error(`Failed to get API key via input tool: ${error}`);
    }
    
    return null;
}

// Select model using dropdown
async function selectModel(context: ToolContext): Promise<string | null> {
    // Try to load from settings first
    const settings = await loadToolSettings();
    if (settings?.modelId) {
        return settings.modelId;
    }
    
    try {
        const result = await context.registry.execute('input', {
            prompt: 'Select the ElevenLabs model to use:',
            title: 'Model Selection',
            type: 'dropdown',
            options: AVAILABLE_MODELS.map(m => m.name),
            default_value: AVAILABLE_MODELS[0].name
        });
        
        if (result.success && result.output) {
            // Find the model ID from the selected name
            const selectedModel = AVAILABLE_MODELS.find(m => m.name === result.output);
            return selectedModel?.id || null;
        }
    } catch (error) {
        context.logger?.error(`Failed to select model via input tool: ${error}`);
    }
    
    return null;
}

// Select voice using dropdown
async function selectVoice(context: ToolContext): Promise<string | null> {
    // Try to load from settings first
    const settings = await loadToolSettings();
    if (settings?.voiceId) {
        return settings.voiceId;
    }
    
    try {
        const result = await context.registry.execute('input', {
            prompt: 'Select the voice to use:',
            title: 'Voice Selection',
            type: 'dropdown',
            options: AVAILABLE_VOICES.map(v => v.name),
            default_value: AVAILABLE_VOICES[0].name
        });
        
        if (result.success && result.output) {
            // Find the voice ID from the selected name
            const selectedVoice = AVAILABLE_VOICES.find(v => v.name === result.output);
            return selectedVoice?.id || null;
        }
    } catch (error) {
        context.logger?.error(`Failed to select voice via input tool: ${error}`);
    }
    
    return null;
}