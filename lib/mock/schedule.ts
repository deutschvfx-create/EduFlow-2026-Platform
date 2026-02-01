import { Lesson } from "@/lib/types/schedule";

export const MOCK_SCHEDULE: Lesson[] = [
    // ENG-A1-M (g1) Lessons
    {
        id: "l1",
        organizationId: "org_1",
        groupId: "g1",
        courseId: "c1",
        teacherId: "t1",
        dayOfWeek: "MON",
        startTime: "09:00",
        endTime: "10:30",
        room: "101",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l2",
        organizationId: "org_1",
        groupId: "g1",
        courseId: "c1",
        teacherId: "t1",
        dayOfWeek: "WED",
        startTime: "09:00",
        endTime: "10:30",
        room: "101",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l3",
        organizationId: "org_1",
        groupId: "g1",
        courseId: "c1",
        teacherId: "t1",
        dayOfWeek: "FRI",
        startTime: "09:00",
        endTime: "10:30",
        room: "101",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },

    // ENG-B1-E (g2) Lessons
    {
        id: "l4",
        organizationId: "org_1",
        groupId: "g2",
        courseId: "c1",
        teacherId: "t1",
        dayOfWeek: "TUE",
        startTime: "18:00",
        endTime: "19:30",
        room: "102",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l5",
        organizationId: "org_1",
        groupId: "g2",
        courseId: "c1",
        teacherId: "t1",
        dayOfWeek: "THU",
        startTime: "18:00",
        endTime: "19:30",
        room: "102",
        status: "CANCELLED",
        createdAt: "2025-09-01T10:00:00Z"
    },

    // Math Club (g3)
    {
        id: "l6",
        organizationId: "org_1",
        groupId: "g3",
        courseId: "c2",
        teacherId: "t2",
        dayOfWeek: "WED",
        startTime: "15:00",
        endTime: "16:30",
        room: "205",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l7",
        organizationId: "org_1",
        groupId: "g3",
        courseId: "c6",
        teacherId: "t5",
        dayOfWeek: "FRI",
        startTime: "15:00",
        endTime: "16:30",
        room: "Comp-1",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },

    // German (g5)
    {
        id: "l8",
        organizationId: "org_1",
        groupId: "g5",
        courseId: "c4",
        teacherId: "t3",
        dayOfWeek: "MON",
        startTime: "11:00",
        endTime: "12:30",
        room: "103",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l9",
        organizationId: "org_1",
        groupId: "g5",
        courseId: "c4",
        teacherId: "t3",
        dayOfWeek: "THU",
        startTime: "11:00",
        endTime: "12:30",
        room: "103",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    }
];
