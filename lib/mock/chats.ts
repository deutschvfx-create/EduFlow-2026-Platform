import { Chat } from "@/lib/types/chat";

export const MOCK_CHATS: Chat[] = [
    {
        id: "c1",
        type: "ORG",
        title: "Общий чат школы",
        lastMessage: "Коллеги, собрание переносится на 15:00",
        lastMessageAt: "2025-09-25T10:00:00Z",
        unreadCount: 2
    },
    {
        id: "c2",
        type: "GROUP",
        title: "English A1 (Morning)",
        groupId: "g1",
        groupName: "English A1",
        lastMessage: "Домашнее задание на завтра: стр. 42",
        lastMessageAt: "2025-09-25T14:30:00Z",
        unreadCount: 0
    },
    {
        id: "c3",
        type: "GROUP",
        title: "Math Club (Advanced)",
        groupId: "g2",
        groupName: "Math Club",
        lastMessage: "Кто сможет прийти на доп. занятие?",
        lastMessageAt: "2025-09-24T18:00:00Z",
        unreadCount: 5
    },
    {
        id: "c4",
        type: "GROUP",
        title: "German A2",
        groupId: "g5",
        groupName: "German A2",
        lastMessage: "Guten Tag!",
        lastMessageAt: "2025-09-20T09:00:00Z",
        unreadCount: 0
    },
    {
        id: "c5",
        type: "DIRECT",
        title: "Ирина Васильева",
        lastMessage: "Можете проверить отчет?",
        lastMessageAt: "2025-09-25T09:15:00Z",
        unreadCount: 1
    },
    {
        id: "c6",
        type: "DIRECT",
        title: "Олег Сидоров",
        lastMessage: "Спасибо, принято.",
        lastMessageAt: "2025-09-22T16:00:00Z",
        unreadCount: 0
    }
];
