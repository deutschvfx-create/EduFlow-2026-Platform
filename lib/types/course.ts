export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type CourseType = "MANDATORY" | "ELECTIVE" | "OPTIONAL" | "INTENSIVE";
export type GradingType = "5_POINT" | "10_POINT" | "A_F" | "PERCENTAGE";

export interface CourseModule {
    id: string;
    title: string;
    description?: string;
    hours: number;
    order?: number;
}

export interface TeacherAssignment {
    userId: string;
    role: "PRIMARY" | "ASSISTANT" | "SUBSTITUTE";
    permissions: {
        manageGrades: boolean;
        manageAttendance: boolean;
        manageGroups: boolean;
        manageMaterials: boolean;
        manageEvents: boolean;
        manageModules: boolean;
    };
}

export interface GradingConfig {
    type: GradingType;
    rounding: "UP" | "DOWN" | "NEAREST";
    minPassScore: number;
    weights: {
        exams: number;
        control: number;
        homework: number;
        participation: number;
    };
}

export interface CourseMaterial {
    id: string;
    type: "FILE" | "LINK" | "VIDEO" | "PRESENTATION";
    title: string;
    description?: string;
    url: string;
    accessLevel: "TEACHERS" | "STUDENTS" | "PARENTS" | "PUBLIC";
    uploadedAt: string;
    uploadedBy: string;
}

export interface CourseEvent {
    id: string;
    type: "EXAM" | "CONTROL" | "PROJECT" | "COLLOQUIUM";
    title: string;
    description: string;
    date: string;
}

export interface ArchiveMetadata {
    reason: string;
    archivedAt: string;
    archivedByUid: string;
    notes?: string;
}

export interface Course {
    id: string;
    organizationId: string;
    version: string;
    name: string;
    code: string;
    status: CourseStatus;
    type: CourseType;
    format?: "ONLINE" | "OFFLINE" | "HYBRID";
    grouping?: "INDIVIDUAL" | "GROUP";

    facultyId: string;
    departmentId: string;
    level?: string;

    workload: {
        hoursPerWeek: number;
        hoursPerSemester: number;
        hoursPerYear: number;
    };

    description?: string;
    objective?: string;
    modules: CourseModule[];

    teachers: TeacherAssignment[];
    teacherIds: string[]; // Keep for backward compatibility/filtering
    groupIds: string[];

    grading: GradingConfig;
    materials: CourseMaterial[];
    events: CourseEvent[];

    // Language School Additions
    basePrice?: number;
    currency?: 'RUB' | 'USD' | 'EUR' | 'TJS';

    archiveInfo?: ArchiveMetadata;
    createdAt: string;
}
