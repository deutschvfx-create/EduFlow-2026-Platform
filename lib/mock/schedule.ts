import { Lesson } from "@/lib/types/schedule";

export const MOCK_SCHEDULE: Lesson[] = [
    // ENG-A1-M (g1) Lessons
    {
        id: "l1",
        groupId: "g1",
        groupName: "English A1 (Morning)",
        courseId: "c1",
        courseName: "General English A1",
        teacherId: "t1",
        teacherName: "Ирина Васильева",
        dayOfWeek: "MON",
        startTime: "09:00",
        endTime: "10:30",
        room: "101",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l2",
        groupId: "g1",
        groupName: "English A1 (Morning)",
        courseId: "c1",
        courseName: "General English A1",
        teacherId: "t1",
        teacherName: "Ирина Васильева",
        dayOfWeek: "WED",
        startTime: "09:00",
        endTime: "10:30",
        room: "101",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l3",
        groupId: "g1",
        groupName: "English A1 (Morning)",
        courseId: "c1",
        courseName: "General English A1",
        teacherId: "t1",
        teacherName: "Ирина Васильева",
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
        groupId: "g2",
        groupName: "English B1 (Evening)",
        courseId: "c1",
        courseName: "General English A1", // Reusing course for simplicity in mock
        teacherId: "t1",
        teacherName: "Ирина Васильева",
        dayOfWeek: "TUE",
        startTime: "18:00",
        endTime: "19:30",
        room: "102",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l5",
        groupId: "g2",
        groupName: "English B1 (Evening)",
        courseId: "c1",
        courseName: "General English A1",
        teacherId: "t1",
        teacherName: "Ирина Васильева",
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
        groupId: "g3",
        groupName: "Math Club (Advanced)",
        courseId: "c2",
        courseName: "Advanced Mathematics",
        teacherId: "t2",
        teacherName: "Олег Сидоров",
        dayOfWeek: "WED",
        startTime: "15:00",
        endTime: "16:30",
        room: "205",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l7",
        groupId: "g3",
        groupName: "Math Club (Advanced)",
        courseId: "c6",
        courseName: "Computer Science 101",
        teacherId: "t5",
        teacherName: "Сергей Петров",
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
        groupId: "g5",
        groupName: "German A2",
        courseId: "c4",
        courseName: "German Language Basics",
        teacherId: "t3",
        teacherName: "Екатерина Михайлова",
        dayOfWeek: "MON",
        startTime: "11:00",
        endTime: "12:30",
        room: "103",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    },
    {
        id: "l9",
        groupId: "g5",
        groupName: "German A2",
        courseId: "c4",
        courseName: "German Language Basics",
        teacherId: "t3",
        teacherName: "Екатерина Михайлова",
        dayOfWeek: "THU",
        startTime: "11:00",
        endTime: "12:30",
        room: "103",
        status: "PLANNED",
        createdAt: "2025-09-01T10:00:00Z"
    }
];
