'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSpeech(text: string) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API Key is missing');
        }

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "shimmer", // A clear, female voice suited for assistants
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        return { success: true, audio: buffer.toString('base64') };
    } catch (error) {
        console.error('TTS Generation Error:', error);
        return { success: false, error: 'Failed to generate speech' };
    }
}
