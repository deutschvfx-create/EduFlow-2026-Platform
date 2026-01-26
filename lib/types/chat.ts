export type ChatType = "ORG" | "GROUP" | "DIRECT";

export type Chat = {
    id: string;
    type: ChatType;
    title: string;

    groupId?: string; // If linked to a student group
    groupName?: string;

    lastMessage?: string;
    lastMessageAt?: string; // ISO
    unreadCount?: number;
};

export type ChatMessage = {
    id: string;
    chatId: string;

    senderId: string;
    senderName: string;
    senderRole: "DIRECTOR" | "TEACHER" | "STUDENT";

    text: string;
    createdAt: string; // ISO
    system?: boolean;
};
