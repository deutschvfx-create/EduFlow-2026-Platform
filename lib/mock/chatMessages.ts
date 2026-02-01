import { ChatMessage } from "@/lib/types/chat";

export const MOCK_MESSAGES: ChatMessage[] = [
    // ORG Chat (c1)
    {
        id: "m1",
        chatId: "c1",
        senderId: "u1",
        senderRole: "DIRECTOR",
        text: "Внимание всем преподавателям! В пятницу санитарный день.",
        createdAt: "2025-09-24T10:00:00Z"
    },
    {
        id: "m2",
        chatId: "c1",
        senderId: "t1",
        senderRole: "TEACHER",
        text: "Принято.",
        createdAt: "2025-09-24T10:05:00Z"
    },
    {
        id: "m3",
        chatId: "c1",
        senderId: "u1",
        senderRole: "DIRECTOR",
        text: "Коллеги, собрание переносится на 15:00",
        createdAt: "2025-09-25T10:00:00Z"
    },

    // Group Chat (c2)
    {
        id: "m4",
        chatId: "c2",
        senderId: "t1",
        senderRole: "TEACHER",
        text: "Hello everyone! Welcome to the course.",
        createdAt: "2025-09-01T09:00:00Z",
        system: true
    },
    {
        id: "m5",
        chatId: "c2",
        senderId: "s1",
        senderRole: "STUDENT",
        text: "Good morning!",
        createdAt: "2025-09-01T09:05:00Z"
    },
    {
        id: "m6",
        chatId: "c2",
        senderId: "t1",
        senderRole: "TEACHER",
        text: "Домашнее задание на завтра: стр. 42",
        createdAt: "2025-09-25T14:30:00Z"
    }
];
