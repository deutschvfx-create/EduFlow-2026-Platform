import { safeGet, safeSet } from "@/lib/storage";

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    roomId: string;
}

const STORAGE_KEY = "eduflow.chat";
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
    }
};
