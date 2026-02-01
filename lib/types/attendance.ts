export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "UNKNOWN";

export type AttendanceRecord = {
    id: string;
    organizationId: string;
    lessonId?: string; // Legacy
    scheduleId: string; // New
    studentId: string;
    date?: string; // ISO
    status: AttendanceStatus;
    note?: string;
    updatedAt?: string; // ISO
};
