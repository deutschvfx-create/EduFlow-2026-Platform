'use client';

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MOCK_FACULTIES } from "@/lib/mock/faculties";
import { MOCK_DEPARTMENTS } from "@/lib/mock/departments";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";

interface CourseFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    facultyFilter: string;
    onFacultyChange: (val: string) => void;
    departmentFilter: string;
    onDepartmentChange: (val: string) => void;
    teacherFilter: string;
    onTeacherChange: (val: string) => void;
}

export function CourseFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    facultyFilter,
    onFacultyChange,
    departmentFilter,
    onDepartmentChange,
    teacherFilter,
    onTeacherChange
}: CourseFiltersProps) {
    const hasActiveFilters = search || statusFilter !== 'all' || facultyFilter !== 'all' || departmentFilter !== 'all' || teacherFilter !== 'all';

    // Filter departments based on selected faculty
    const availableDepartments = facultyFilter === 'all'
        ? MOCK_DEPARTMENTS
        : MOCK_DEPARTMENTS.filter(d => d.facultyId === facultyFilter);

    const clearFilters = () => {
        onSearchChange('');
        onStatusChange('all');
        onFacultyChange('all');
        onDepartmentChange('all');
        onTeacherChange('all');
    }

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Поиск по названию или коду..."
                        className="pl-9 bg-zinc-900 border-zinc-800"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            <SelectItem value="ACTIVE">Активные</SelectItem>
                            <SelectItem value="INACTIVE">Неактивные</SelectItem>
                            <SelectItem value="ARCHIVED">Архив</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Сбросить фильтры">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Select value={facultyFilter} onValueChange={(val) => { onFacultyChange(val); onDepartmentChange('all'); }}>
                    <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Факультет" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все факультеты</SelectItem>
                        {MOCK_FACULTIES.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={onDepartmentChange} disabled={availableDepartments.length === 0}>
                    <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder={availableDepartments.length === 0 && facultyFilter !== 'all' ? "Нет кафедр" : "Кафедра"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все кафедры</SelectItem>
                        {availableDepartments.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={teacherFilter} onValueChange={onTeacherChange}>
                    <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Преподаватель" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все преподаватели</SelectItem>
                        {MOCK_TEACHERS.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
