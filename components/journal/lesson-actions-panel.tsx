'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3, Paperclip, GraduationCap, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LessonComments } from "./lesson-comments";
import { LessonAnalytics } from "./lesson-analytics";
import { LessonGrades } from "./lesson-grades";
import { StudentPersonalNote } from "./student-personal-note";
import { LessonMaterials } from "./lesson-materials";

interface LessonActionsPanelProps {
    lessonId: string;
    selectedStudent?: {
        id: string;
        name: string;
        note?: string;
    } | null;
    courseId?: string;
    groupId?: string;
}

export function LessonActionsPanel({
    lessonId,
    selectedStudent,
    courseId,
    groupId
}: LessonActionsPanelProps) {
    return (
        <Tabs defaultValue="comments" className="w-full h-full flex flex-col">
            <div className="px-6 border-b border-[hsl(var(--border))] bg-white">
                <TabsList className="bg-transparent h-14 p-0 gap-8">
                    <TabsTrigger
                        value="comments"
                        className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm text-[hsl(var(--muted-foreground))]"
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Комментарии
                    </TabsTrigger>
                    <TabsTrigger
                        value="grades"
                        className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm text-[hsl(var(--muted-foreground))]"
                    >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Оценки и отзывы
                    </TabsTrigger>
                    <TabsTrigger
                        value="materials"
                        className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm text-[hsl(var(--muted-foreground))]"
                    >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Материалы
                    </TabsTrigger>
                    <TabsTrigger
                        value="analytics"
                        className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm text-[hsl(var(--muted-foreground))]"
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Аналитика
                    </TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 p-6 overflow-auto">
                <TabsContent value="comments" className="m-0 focus-visible:outline-none">
                    <LessonComments lessonId={lessonId} />
                </TabsContent>

                <TabsContent value="grades" className="m-0 focus-visible:outline-none">
                    {selectedStudent ? (
                        <div className="space-y-6">
                            <LessonGrades
                                lessonId={lessonId}
                                studentId={selectedStudent.id}
                                studentName={selectedStudent.name}
                                courseId={courseId || ""}
                                groupId={groupId || ""}
                            />

                            <StudentPersonalNote
                                lessonId={lessonId}
                                studentId={selectedStudent.id}
                                studentName={selectedStudent.name}
                                initialNote={selectedStudent.note || ""}
                            />
                        </div>
                    ) : (
                        <Card className="bg-white border-[hsl(var(--border))] shadow-sm rounded-2xl border-dashed">
                            <CardContent className="p-12 text-center text-[hsl(var(--muted-foreground))]">
                                <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-1">Оценки и отзывы</h3>
                                <p className="text-sm">Выберите студента слева, чтобы выставить оценку и написать отзыв за этот урок</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="materials" className="m-0 focus-visible:outline-none">
                    <LessonMaterials lessonId={lessonId} />
                </TabsContent>

                <TabsContent value="analytics" className="m-0 focus-visible:outline-none">
                    <LessonAnalytics lessonId={lessonId} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
