'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";
import { Student } from "@/lib/types/student";
import { GradeRecord } from "@/lib/types/grades";

interface GradesTableProps {
    students: Student[];
    gradesMap: Record<string, GradeRecord>;
    onScoreChange: (studentId: string, score: string) => void;
    onCommentChange: (studentId: string, comment: string) => void;
    onClear: (studentId: string) => void;
}

export function GradesTable({ students, gradesMap, onScoreChange, onCommentChange, onClear }: GradesTableProps) {
    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-card/50 rounded-lg border border-border border-dashed">
                <p className="text-muted-foreground mb-2">В этой группе нет студентов</p>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-background/50">
                    <TableRow className="border-border hover:bg-card">
                        <TableHead className="w-[30%]">Студент</TableHead>
                        <TableHead className="w-[150px] text-center">Оценка (0-100)</TableHead>
                        <TableHead className="w-[150px] text-center">Статус</TableHead>
                        <TableHead>Комментарий</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map(student => {
                        const grade = gradesMap[student.id];
                        const hasScore = grade?.score !== undefined && grade?.score !== null;

                        return (
                            <TableRow key={student.id} className="border-border hover:bg-secondary/50">
                                <TableCell className="font-medium text-foreground">
                                    {student.lastName} {student.firstName}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="-"
                                        className={`bg-background text-center ${hasScore ? 'border-primary/50 focus:border-primary' : 'border-border'}`}
                                        value={grade?.score ?? ''}
                                        onChange={(e) => onScoreChange(student.id, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    {hasScore ? (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                            Оценено
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground border-border">
                                            Не оценено
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Комментарий..."
                                        className="bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background text-foreground"
                                        value={grade?.comment ?? ''}
                                        onChange={(e) => onCommentChange(student.id, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    {hasScore && (
                                        <Button variant="ghost" size="icon" onClick={() => onClear(student.id)} className="h-8 w-8 text-muted-foreground hover:text-red-400">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
