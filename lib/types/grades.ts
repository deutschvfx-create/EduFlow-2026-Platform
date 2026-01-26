export type GradeType = "HOMEWORK" | "QUIZ" | "EXAM" | "PROJECT" | "PARTICIPATION";

export type GradeRecord = {
    id: string;

    groupId: string;
    groupName: string;

    courseId: string;
    courseName: string;

    studentId: string;
    studentName: string;

    type: GradeType;
    date: string; // YYYY-MM-DD

    score?: number; // 0..100 (optional if not graded yet)
    comment?: string;

    updatedAt: string; // ISO
};
