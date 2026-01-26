export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "UNKNOWN";

export type AttendanceRecord = {
    id: string;
    lessonId?: string; // Legacy
    scheduleId: string; // New
    studentId: string;
    studentName?: string; // Optional/Derived
    date?: string; // ISO
    status: AttendanceStatus;
    note?: string;
    updatedAt?: string; // ISO
};
