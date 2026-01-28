"use client";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function StudentDashboardPage() {
    return (
        <FeaturePlaceholder
            title="Student Dashboard"
            description="Welcome to your personal learning space! Track your grades, schedule, and progress here."
            roadmap={[
                "View Class Schedule",
                "Check Grades & Attendance",
                "Access Learning Materials",
                "Message Teachers"
            ]}
        />
    );
}
