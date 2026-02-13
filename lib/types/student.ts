export type StudentStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type AcademicStatus = "ACTIVE" | "PAUSED" | "FROZEN" | "COMPLETED" | "DROPPED" | "GRADUATED" | "EXPELLED";

export type PaymentStatus = "OK" | "DUE" | "UNKNOWN";

export type AuditEvent = {
    id: string;
    at: string; // ISO
    by: string; // User ID/Name
    action: string;
    description: string;
};

export type AcademicProgress = {
    startLevel: string;
    currentLevel: string;
    teacherRecommendation?: string;
    academicComment?: string;
};

export type Student = {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    birthDate: string; // YYYY-MM-DD
    gender?: "M" | "F"; // Gender: M (Male) or F (Female)
    email?: string;
    phone?: string;
    level?: string; // legacy or shorthand
    createdAt: string;
    status: StudentStatus;
    academicStatus: AcademicStatus; // ERP field
    groupIds: string[];
    lastActivityAt?: string;
    paymentStatus?: PaymentStatus;
    paidUntil?: string;
    validUntil?: string; // Card validity date (ISO string or DD.MM.YYYY)
    notes?: string; // Internal admin notes
    passportPhotoUrl?: string; // Official passport photo URL
    academicProgress?: AcademicProgress;
    auditLog?: AuditEvent[];
    publicSettings?: {
        showPhoto: boolean;
        showGender: boolean;
        showLevel: boolean;
        showGroup: boolean;
    };
};
