import { AttendanceRecord } from "@/lib/types/attendance";

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    // Lesson l1 (g1) - Student s1, s2
    {
        id: "a1",
        lessonId: "l1",
        scheduleId: "l1",
        studentId: "s1",
        status: "PRESENT",
        updatedAt: "2025-09-01T10:30:00Z"
    },
    {
        id: "a2",
        lessonId: "l1",
        scheduleId: "l1",
        studentId: "s2",
        status: "LATE",
        note: "Опоздала на 10 мин",
        updatedAt: "2025-09-01T10:35:00Z"
    },
    // Lesson l2 (g1)
    {
        id: "a3",
        lessonId: "l2",
        scheduleId: "l2",
        studentId: "s1",
        status: "PRESENT",
        updatedAt: "2025-09-03T10:30:00Z"
    },
    {
        id: "a4",
        lessonId: "l2",
        scheduleId: "l2",
        studentId: "s2",
        status: "ABSENT",
        note: "Заболела",
        updatedAt: "2025-09-03T10:00:00Z"
    }
];
