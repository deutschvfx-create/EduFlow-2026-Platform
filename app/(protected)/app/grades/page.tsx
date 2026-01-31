'use client';

import { useState, useMemo, useEffect } from "react";
import { GradeRecord, GradeType } from "@/lib/types/grades";
// import { MOCK_GRADES } from "@/lib/mock/grades";
// import { MOCK_STUDENTS } from "@/lib/mock/students";
// import { MOCK_COURSES } from "@/lib/mock/courses";
import { GradesFilters } from "@/components/grades/grades-filters";
import { GradesTable } from "@/components/grades/grades-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, AlertCircle, Plus, Loader2 } from "lucide-react";
// import { toast } from "sonner";
const toast = { success: (m: string) => alert(m), error: (m: string) => alert(m) };
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";

// Local map type
type LocalGradesMap = Record<string, GradeRecord>;

export default function GradesPage() {
    // Filters
    const [groupId, setGroupId] = useState("all");
    const [courseId, setCourseId] = useState("all");
    const [type, setType] = useState<GradeType | "all">("HOMEWORK"); // Default to homework
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Local State
    const [groups, setGroups] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [gradesData, setGradesData] = useState<LocalGradesMap>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const { currentOrganizationId } = useOrganization();

    useEffect(() => {
        Promise.all([
            import("@/lib/data/groups.repo").then(m => m.groupsRepo.getAll(currentOrganizationId!)),
            import("@/lib/data/courses.repo").then(m => m.coursesRepo.getAll(currentOrganizationId!)),
            import("@/lib/data/students.repo").then(m => m.studentsRepo.getAll(currentOrganizationId!)),
            import("@/lib/data/grades.repo").then(m => m.gradesRepo.getAll(currentOrganizationId!))
        ]).then(([g, c, s, grades]) => {
            setGroups(g);
            setCourses(c);
            setAllStudents(s);

            const map: LocalGradesMap = {};
            // @ts-ignore
            grades.forEach(r => {
                map[r.studentId] = r as any; // NOTE: This assumes 1 grade per student per context. In reality need composite key or filtering.
                // But current 'gradesData' is used as Session Grades.
                // We should ideally filter by selected context later, or map Key = `${courseId}-${studentId}-${type}`
            });
            // For now, adhering to existing 'gradesData' usage which seems to check just studentId?
            // Line 108: `const db = currentSessionGrades[studentId];`
            // Line 66: `return gradesData;`
            // Yes, assumes one active session.

            setGradesData(map);
            setIsLoaded(true);
        });
    }, []);

    // Derived: Students in Group
    const studentsInGroup = useMemo(() => {
        if (groupId === 'all') return [];
        return allStudents.filter(s => s.groups.some((g: any) => g.id === groupId));
    }, [groupId, allStudents]);

    // Initial Load / Sync with Selection
    const currentSessionGrades = useMemo(() => {
        const map: Record<string, GradeRecord> = {}; // Key: studentId

        // Find existing grades matches
        // For now, in this simplified view, we just return empty map or derived from loaded gradesData
        // Ideally we filter 'gradesData' (which should be an array or map) by groupId/courseId
        // But since we are mocking "session state" from repo:

        // Let's assume gradesData is a map by studentId -> grade for CURRENT session context
        return gradesData;
    }, [groupId, courseId, type, date]); // This is just "Source of Truth" from DB.

    // Local Edits State
    const [localEdits, setLocalEdits] = useState<Record<string, Partial<GradeRecord>>>({});

    // Reset local edits when context changes
    // useEffect(() => setLocalEdits({}), [groupId, courseId, type, date]); 
    // Actually better to keep it controlled.

    const handleScoreChange = (studentId: string, val: string) => {
        let num = parseInt(val);
        if (isNaN(num)) num = undefined as any;
        if (num > 100) num = 100;
        if (num < 0) num = 0;

        setLocalEdits(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], score: num }
        }));
    };

    const handleCommentChange = (studentId: string, val: string) => {
        setLocalEdits(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], comment: val }
        }));
    };

    const handleClear = (studentId: string) => {
        setLocalEdits(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], score: undefined, comment: undefined }
        }));
        // Also need to mark as "cleared" if it existed in DB? 
        // For mock, simply separating logic:
        // Display score = localEdit ?? dbRecord ?? empty
        // If localEdit is undefined, it might fall back to DB. 
        // We need explicit null to clear.
    };

    const getDisplayGrade = (studentId: string): Partial<GradeRecord> | undefined => {
        const db = currentSessionGrades[studentId];
        const local = localEdits[studentId];

        return {
            ...db,
            ...local,
            score: local?.score !== undefined ? local.score : db?.score,
            comment: local?.comment !== undefined ? local.comment : db?.comment
        };
    };

    // Construct flat map for table
    const displayMap: Record<string, GradeRecord> = {};
    studentsInGroup.forEach(s => {
        const d = getDisplayGrade(s.id);
        if (d) displayMap[s.id] = d as GradeRecord;
    });


    const handleSave = async () => {
        if (groupId === 'all' || courseId === 'all') {
            alert('Выберите группу и предмет');
            return;
        }

        // Simulate save
        await new Promise(r => setTimeout(r, 800));
        alert('Оценки сохранены!');
        setLocalEdits({});
    };

    // Stats
    const totalGrades = Object.keys(gradesData).length; // or better stat logic
    // Mock averages
    const avgScore = 85;

    return (
        <ModuleGuard module="grades">
            <div className="space-y-6">
                <div className="hidden laptop:flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Оценки / Экзамены</h1>
                    <p className="text-zinc-400">Выставление оценок по группам и предметам</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего оценок</CardTitle>
                            <GraduationCap className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalGrades}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-400">Средний балл</CardTitle>
                            <BarChart3 className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{avgScore}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-400">Не оценено</CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">12</div>
                        </CardContent>
                    </Card>
                </div>

                <GradesFilters
                    groups={groups}
                    courses={courses}
                    groupId={groupId}
                    onGroupChange={setGroupId}
                    courseId={courseId}
                    onCourseChange={setCourseId}
                    type={type}
                    onTypeChange={setType}
                    date={date}
                    onDateChange={setDate}
                />

                {/* Main Content */}
                <div className="space-y-4">
                    {groupId !== 'all' && courseId !== 'all' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                <div className="text-sm text-zinc-400">
                                    Студентов: <span className="text-white font-medium">{studentsInGroup.length}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setLocalEdits({})}>
                                        Сбросить изменения
                                    </Button>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleSave}>
                                        <Loader2 className="h-4 w-4 animate-spin hidden" /> {/* Logic placeholder */}
                                        Сохранить оценки
                                    </Button>
                                </div>
                            </div>

                            <GradesTable
                                students={studentsInGroup}
                                gradesMap={displayMap}
                                onScoreChange={handleScoreChange}
                                onCommentChange={handleCommentChange}
                                onClear={handleClear}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] border border-zinc-800 border-dashed rounded-lg bg-zinc-900/20">
                            <div className="p-4 rounded-full bg-zinc-900 mb-4">
                                <GraduationCap className="h-8 w-8 text-zinc-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">Оценивание не начато</h3>
                            <p className="text-zinc-500 max-w-sm text-center mb-6">Выберите группу и предмет сверху, чтобы начать сессию выставления оценок.</p>
                        </div>
                    )}
                </div>
            </div>
        </ModuleGuard>
    );
}
