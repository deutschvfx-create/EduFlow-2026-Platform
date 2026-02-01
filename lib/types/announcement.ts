export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AnnouncementTargetType =
    | "ALL"
    | "FACULTY"
    | "DEPARTMENT"
    | "GROUP";

export type Announcement = {
    id: string;
    organizationId: string;
    title: string;
    content: string;

    status: AnnouncementStatus;

    authorId: string;
    authorName: string;
    authorRole: "DIRECTOR" | "TEACHER";

    targetType: AnnouncementTargetType;
    targetId?: string;
    targetName?: string;

    createdAt: string; // ISO
    publishedAt?: string; // ISO
};
