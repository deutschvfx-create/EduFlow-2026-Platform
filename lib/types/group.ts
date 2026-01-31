export type GroupStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Group = {
    id: string;
    organizationId: string; // Multi-tenant: group belongs to organization
    name: string;
    code: string;

    facultyId: string;
    departmentId: string;

    status: GroupStatus;

    level?: string; // A1/A2/B1... or "1 курс"
    paymentType?: "FREE" | "PAID";

    curatorTeacherId?: string;

    studentsCount: number;
    maxStudents: number;

    teachersCount: number;
    coursesCount: number;

    createdAt: string; // ISO
};
