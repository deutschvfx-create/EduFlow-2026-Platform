export type LessonStatus = "PLANNED" | "CANCELLED" | "SCHEDULED";

export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type Lesson = {
    id: string;
    organizationId: string; // Multi-tenant: lesson belongs to organization
    groupId: string;

    courseId: string;

    teacherId: string;

    dayOfWeek: DayOfWeek;
    startTime: string; // "09:00"
    endTime: string;   // "10:30"

    room?: string;
    status: LessonStatus;

    createdAt: string;
};
