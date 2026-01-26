export type FacultyStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Faculty = {
    id: string;
    name: string;
    code: string; // e.g. LANG, IT, MATH
    description?: string;
    status: FacultyStatus;

    headTeacherId?: string; // optional
    headTeacherName?: string; // optional (mock-friendly)

    departmentsCount: number;
    groupsCount: number;
    studentsCount: number;
    teachersCount: number;

    createdAt: string; // ISO
};
