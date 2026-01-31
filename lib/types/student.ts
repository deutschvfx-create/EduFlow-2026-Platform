export type StudentStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type PaymentStatus = "OK" | "DUE" | "UNKNOWN";

export type Student = {
    id: string;
    organizationId: string; // Multi-tenant: student belongs to organization
    firstName: string;
    lastName: string;
    birthDate: string; // ISO format: YYYY-MM-DD
    email?: string;
    phone?: string;
    createdAt: string; // ISO
    status: StudentStatus;
    groupIds: string[];
    lastActivityAt?: string; // ISO
    paymentStatus?: PaymentStatus;
    paidUntil?: string; // ISO format: YYYY-MM-DDTHH:mm:ssZ
    notes?: string;
};
