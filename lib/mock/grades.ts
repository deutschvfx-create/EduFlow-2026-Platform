import { GradeRecord } from "@/lib/types/grades";

export const MOCK_GRADES: GradeRecord[] = [
    // g1 - English A1
    {
        id: "gr1",
        groupId: "g1",
        groupName: "English A1 (Morning)",
        courseId: "c1",
        courseName: "General English A1",
        studentId: "s1",
        studentName: "Алексей Смирнов",
        type: "HOMEWORK",
        date: "2025-09-02",
        score: 95,
        comment: "Excellent work!",
        updatedAt: "2025-09-02T15:00:00Z"
    },
    {
        id: "gr2",
        groupId: "g1",
        groupName: "English A1 (Morning)",
        courseId: "c1",
        courseName: "General English A1",
        studentId: "s2",
        studentName: "Мария Иванова",
        type: "HOMEWORK",
        date: "2025-09-02",
        score: 80,
        comment: "Good attempt",
        updatedAt: "2025-09-02T15:05:00Z"
    },
    {
        id: "gr3",
        groupId: "g1",
        groupName: "English A1 (Morning)",
        courseId: "c1",
        courseName: "General English A1",
        studentId: "s1",
        studentName: "Алексей Смирнов",
        type: "QUIZ",
        date: "2025-09-05",
        score: 100,
        updatedAt: "2025-09-05T10:00:00Z"
    },

    // g2 - English B1
    {
        id: "gr4",
        groupId: "g2",
        groupName: "English B1 (Evening)",
        courseId: "c1",
        courseName: "General English A1",
        studentId: "s1", // Assuming s1 is also in g2 for mock variety? Re-checking mock students... s1 is in g1. 
        // Let's check s2. s2 is in g1 and g2.
        studentName: "Мария Иванова",
        type: "EXAM",
        date: "2025-09-10",
        score: 75,
        updatedAt: "2025-09-10T12:00:00Z"
    }
];
