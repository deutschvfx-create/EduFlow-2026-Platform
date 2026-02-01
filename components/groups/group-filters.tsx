'use client';

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { Faculty } from '@/lib/types/faculty';
import { Department } from '@/lib/types/department';

interface GroupFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    facultyFilter: string;
    onFacultyChange: (val: string) => void;
    departmentFilter: string;
    onDepartmentChange: (val: string) => void;
}

export function GroupFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    facultyFilter,
    onFacultyChange,
    departmentFilter,
    onDepartmentChange
}: GroupFiltersProps) {
    const { currentOrganizationId } = useOrganization();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        if (currentOrganizationId) {
            Promise.all([
                import("@/lib/data/faculties.repo").then(m => m.facultiesRepo.getAll(currentOrganizationId)),
                import("@/lib/data/departments.repo").then(m => m.departmentsRepo.getAll(currentOrganizationId))
            ]).then(([f, d]) => {
                setFaculties(f);
                setDepartments(d);
            });
        }
    }, [currentOrganizationId]);

    const hasActiveFilters = search || statusFilter !== 'all' || facultyFilter !== 'all' || departmentFilter !== 'all';

    // Filter departments based on selected faculty
    const availableDepartments = facultyFilter === 'all'
        ? departments
        : departments.filter(d => d.facultyId === facultyFilter);

    const clearFilters = () => {
        onSearchChange('');
        onStatusChange('all');
        onFacultyChange('all');
        onDepartmentChange('all');
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Поиск по названию или коду..."
                    className="pl-9 bg-zinc-900 border-zinc-800"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Select value={facultyFilter} onValueChange={(val) => { onFacultyChange(val); onDepartmentChange('all'); }}>
                    <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Факультет" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все факультеты</SelectItem>
                        {faculties.map(f => (
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
    );
}
