export type TeacherStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type TeacherRole = "teacher" | "curator" | "admin" | "TEACHER" | "ADMIN" | "CURATOR";

export type TeacherPermissions = {
    canCreateGroups: boolean;
    canManageStudents: boolean; // activate/suspend/remove from group
    canMarkAttendance: boolean;
    canGradeStudents: boolean;
    canSendAnnouncements: boolean;
    canUseChat: boolean;
    canInviteStudents: boolean;
};

export type Teacher = {
    id: string;
    organizationId: string; // Multi-tenant: teacher belongs to organization
    firstName: string;
    lastName: string;
    birthDate?: string; // YYYY-MM-DD
    email?: string;
    phone?: string;
    specialization?: string;
    status: TeacherStatus;
    role: TeacherRole;
    permissions: TeacherPermissions;
    groupIds: string[];
    createdAt: string; // ISO
    lastActivityAt?: string; // ISO
};
