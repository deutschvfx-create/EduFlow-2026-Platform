export type StudentStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type PaymentStatus = "OK" | "DUE" | "UNKNOWN";

export type StudentGroup = {
    id: string;
    name: string;
};

export type Student = {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string; // ISO format: YYYY-MM-DD
    email?: string;
    phone?: string;
    createdAt: string; // ISO
    status: StudentStatus;
    groups: StudentGroup[];
    lastActivityAt?: string; // ISO
    paymentStatus?: PaymentStatus;
    notes?: string;
};
