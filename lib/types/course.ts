export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Course = {
    id: string;
    name: string;
    code: string;

    facultyId: string;
    facultyName: string;
    facultyCode: string;

    departmentId: string;
    departmentName: string;
    departmentCode: string;

    status: CourseStatus;

    level?: string; // A1/A2/B1/B2 or "1 курс"
    description?: string;

    teacherIds: string[];
    teacherNames: string[]; // For easier display

    groupIds: string[];
    groupNames: string[]; // For easier display

    createdAt: string; // ISO
};
