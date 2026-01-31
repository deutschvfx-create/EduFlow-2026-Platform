export type OrganizationType = 'SCHOOL' | 'UNIVERSITY' | 'LANGUAGE_SCHOOL';

export interface Organization {
    id: string;
    name: string;
    type: OrganizationType;
    settings?: {
        locale?: string;
        timezone?: string;
        academicYearStart?: string;
    };
    createdAt?: string;
}
