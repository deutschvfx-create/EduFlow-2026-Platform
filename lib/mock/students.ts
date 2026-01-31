import { Student } from "@/lib/types/student";

export const MOCK_STUDENTS: Student[] = [
    {
        id: "s1",
        organizationId: "org_1",
        firstName: "Алексей",
        lastName: "Смирнов",
        birthDate: "2010-05-15",
        email: "alex.smirnov@example.com",
        createdAt: "2025-09-01T10:00:00Z",
        status: "ACTIVE",
        groupIds: ["g1"],
        lastActivityAt: "2026-01-24T14:30:00Z",
        paymentStatus: "OK",
        paidUntil: "2026-03-05T12:00:00Z"
    },
    {
        id: "s2",
        organizationId: "org_1",
        firstName: "Мария",
        lastName: "Иванова",
        birthDate: "2011-03-22",
        email: "m.ivanova@example.com",
        createdAt: "2025-09-05T11:20:00Z",
        status: "ACTIVE",
        groupIds: ["g1", "g2"],
        lastActivityAt: "2026-01-25T09:00:00Z",
        paymentStatus: "DUE",
        paidUntil: "2026-01-30T15:00:00Z"
    },
    {
        id: "s3",
        organizationId: "org_1",
        firstName: "Дмитрий",
        lastName: "Козлов",
        birthDate: "2009-11-10",
        createdAt: "2026-01-10T15:00:00Z",
        status: "PENDING",
        groupIds: [],
        paymentStatus: "UNKNOWN",
        paidUntil: "2026-02-15T10:00:00Z"
    },
    {
        id: "s4",
        organizationId: "org_1",
        firstName: "Елена",
        lastName: "Соколова",
        birthDate: "2010-01-05",
        createdAt: "2025-01-15T09:00:00Z",
        status: "SUSPENDED",
        groupIds: ["g3"],
        lastActivityAt: "2025-12-20T10:00:00Z",
        paymentStatus: "DUE",
        paidUntil: "2026-01-28T18:00:00Z"
    },
    {
        id: "s5",
        organizationId: "org_1",
        firstName: "Николай",
        lastName: "Петров",
        birthDate: "2008-07-30",
        createdAt: "2024-09-01T08:00:00Z",
        status: "ARCHIVED",
        groupIds: [],
        lastActivityAt: "2025-05-30T12:00:00Z",
        paymentStatus: "OK",
        paidUntil: "2026-01-20T12:00:00Z"
    }
];

export const MOCK_GROUPS = [
    { id: "all", name: "Все группы" },
    { id: "g1", name: "English A1" },
    { id: "g2", name: "Math Club" },
    { id: "g3", name: "German B1" },
    { id: "g4", name: "Robotics" }
];

export const MOCK_ATTENDANCE = [
    { id: "a1", studentId: "s1", scheduleId: "sc1", date: "2026-01-27T10:00:00Z", status: "PRESENT", subject: "English A1", teacher: "Mr. Wilson" },
    { id: "a2", studentId: "s1", scheduleId: "sc2", date: "2026-01-25T10:00:00Z", status: "PRESENT", subject: "English A1", teacher: "Mr. Wilson" },
    { id: "a3", studentId: "s1", scheduleId: "sc3", date: "2026-01-23T10:00:00Z", status: "LATE", subject: "English A1", teacher: "Mr. Wilson" },
    { id: "a4", studentId: "s1", scheduleId: "sc4", date: "2026-01-21T10:00:00Z", status: "PRESENT", subject: "English A1", teacher: "Mr. Wilson" },
    { id: "a5", studentId: "s1", scheduleId: "sc5", date: "2026-01-19T10:00:00Z", status: "ABSENT", subject: "English A1", teacher: "Mr. Wilson" },
];

export const MOCK_GRADES = [
    { id: "g1", studentId: "s1", courseId: "c1", value: 5, date: "2026-01-26T14:00:00Z", type: "HOMEWORK", subject: "English A1", comment: "Excellent work on grammar!" },
    { id: "g2", studentId: "s1", courseId: "c1", value: 4, date: "2026-01-20T14:00:00Z", type: "QUIZ", subject: "English A1", comment: "Good vocabulary usage." },
    { id: "g3", studentId: "s1", courseId: "c1", value: 5, date: "2026-01-15T14:00:00Z", type: "EXAM", subject: "English A1", comment: "Perfect listening score." },
];

export const MOCK_PAYMENTS = [
    { id: "p1", studentId: "s1", amount: 12500, date: "2026-01-14T12:45:00Z", status: "PAID", method: "Карта (T-Pay)", description: "Оплата обучения — Февраль" },
    { id: "p2", studentId: "s1", amount: 12500, date: "2025-12-15T10:30:00Z", status: "PAID", method: "Наличные", description: "Оплата обучения — Январь" },
    { id: "p3", studentId: "s1", amount: 12500, date: "2025-11-12T11:00:00Z", status: "PAID", method: "Карта (T-Pay)", description: "Оплата обучения — Декабрь" },
];
