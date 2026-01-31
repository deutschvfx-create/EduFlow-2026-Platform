export type DepartmentStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Department = {
    id: string;
    organizationId: string; // Multi-tenant: department belongs to organization
    name: string;
    code: string;

    facultyId: string;
    status: DepartmentStatus;

    headTeacherId?: string;

    teachersCount: number;
    groupsCount: number;
    studentsCount: number;
    coursesCount: number;

    description?: string;
    createdAt: string; // ISO
};
