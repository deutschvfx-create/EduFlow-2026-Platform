import { safeGet, safeSet } from "@/lib/storage";

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName?: string;
    text: string;
    timestamp: string;
    roomId: string;
    file?: {
        name: string;
        type: string;
        url: string;
        size?: number;
    };
    audio?: {
        url: string;
        duration: number;
        waveData?: number[];
    };
}

const STORAGE_KEY = "uniprime.chat"; // Updated branding
const MOCK_CHAT: ChatMessage[] = [];

export const chatRepo = {
    getAll: (): ChatMessage[] => {
        return safeGet(STORAGE_KEY, MOCK_CHAT);
    },

    add: (msg: ChatMessage) => {
        const current = safeGet(STORAGE_KEY, MOCK_CHAT);
        const updated = [...current, msg];
        safeSet(STORAGE_KEY, updated);
        return msg;
    },

    clear: () => {
        safeSet(STORAGE_KEY, []);
    }
};
