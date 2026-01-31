export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Course = {
    id: string;
    organizationId: string; // Multi-tenant: course belongs to organization
    name: string;
    code: string;

    facultyId: string;
    departmentId: string;

    status: CourseStatus;

    level?: string; // A1/A2/B1/B2 or "1 курс"
    description?: string;

    teacherIds: string[];
    groupIds: string[];

    createdAt: string; // ISO
};
