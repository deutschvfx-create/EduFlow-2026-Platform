import { Lesson } from "@/lib/types/schedule";

// Helper to layout overlapping events
// Returns a map of lessonId -> { width: string, left: string, zIndex: number }
export function calculateLessonLayout(lessons: Lesson[]) {
    // 1. Group lessons by day
    // 2. For each day, find overlapping groups
    // 3. Assign columns to overlaps

    // Simplified "Stacking" approach for now:
    // If overlap, shift right and shrink width.

    const layout = new Map<string, { width: string, left: string, zIndex: number }>();

    // Sort by start time
    const sorted = [...lessons].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Simple greedy packing (not perfect but robust enough for basic usage)
    // We'll iterate and check how many active lessons exist at this start time.

    // A better approach for "visual stacking":
    // 1. Detect "Clusters" of overlapping events.
    // 2. For each cluster, assign columns.

    // Let's implement a "Column" strategy per day.
    // Find max concurrent events at any point.

    return layout;
}

// Actual implementation within the component will use a simpler localized check for now.
