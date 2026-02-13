'use client';

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { Faculty } from '@/lib/types/faculty';
import { Department } from '@/lib/types/department';
import { Teacher } from '@/lib/types/teacher';
import { useModules } from '@/hooks/use-modules';

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
    const { currentOrganizationId } = useOrganization();
    const { modules } = useModules();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        if (currentOrganizationId) {
            Promise.all([
                import("@/lib/data/faculties.repo").then(m => m.facultiesRepo.getAll(currentOrganizationId)),
                import("@/lib/data/departments.repo").then(m => m.departmentsRepo.getAll(currentOrganizationId)),
                import("@/lib/data/teachers.repo").then(m => m.teachersRepo.getAll(currentOrganizationId))
            ]).then(([f, d, t]) => {
                setFaculties(f);
                setDepartments(d);
                setTeachers(t);
            });
        }
    }, [currentOrganizationId]);

    const hasActiveFilters = search || statusFilter !== 'all' || facultyFilter !== 'all' || departmentFilter !== 'all' || teacherFilter !== 'all';

    // Filter departments based on selected faculty
    const availableDepartments = facultyFilter === 'all'
        ? departments
        : departments.filter(d => d.facultyId === facultyFilter);

    const clearFilters = () => {
        onSearchChange('');
        onStatusChange('all');
        onFacultyChange('all');
        onDepartmentChange('all');
        onTeacherChange('all');
    }

    return (
        <div className="flex flex-col gap-2.5 mb-6">
            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] transition-colors group-focus-within:text-[#0F4C3D]" />
                <Input
                    placeholder="Поиск по названию или коду..."
                    className="h-10 pl-11 bg-[#F1F5F9] border-transparent text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] rounded-full focus:bg-white focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter shadow-none"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 hover:bg-[#F8FAFC] hover:border-[#0F4C3D]/30 transition-all font-inter px-3.5 shadow-sm">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                        <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ СТАТУСЫ</SelectItem>
                        <SelectItem value="ACTIVE" className="text-[10px] font-bold py-2 text-[#22C55E] rounded-full font-inter uppercase tracking-wider">АКТИВНЫЕ</SelectItem>
                        <SelectItem value="INACTIVE" className="text-[10px] font-bold py-2 text-[#64748B] rounded-full font-inter uppercase tracking-wider">НЕАКТИВНЫЕ</SelectItem>
                        <SelectItem value="ARCHIVED" className="text-[10px] font-bold py-2 text-[#EF4444] rounded-full font-inter uppercase tracking-wider">АРХИВ</SelectItem>
                    </SelectContent>
                </Select>

                {modules.faculties && (
                    <Select value={facultyFilter} onValueChange={(val) => { onFacultyChange(val); onDepartmentChange('all'); }}>
                        <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 hover:bg-[#F8FAFC] hover:border-[#0F4C3D]/30 transition-all font-inter px-3.5 shadow-sm">
                            <SelectValue placeholder="Факультет" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1">
                            <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ ФАКУЛЬТЕТЫ</SelectItem>
                            {faculties.map(f => (
                                <SelectItem key={f.id} value={f.id} className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {modules.departments && (
                    <Select value={departmentFilter} onValueChange={onDepartmentChange} disabled={availableDepartments.length === 0}>
                        <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 hover:bg-[#F8FAFC] hover:border-[#0F4C3D]/30 transition-all font-inter px-3.5 shadow-sm">
                            <SelectValue placeholder={availableDepartments.length === 0 && facultyFilter !== 'all' ? "НЕТ КАФЕДР" : "КАФЕДРА"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1">
                            <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ КАФЕДРЫ</SelectItem>
                            {availableDepartments.map(d => (
                                <SelectItem key={d.id} value={d.id} className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select value={teacherFilter} onValueChange={onTeacherChange}>
                    <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 hover:bg-[#F8FAFC] hover:border-[#0F4C3D]/30 transition-all font-inter px-3.5 shadow-sm">
                        <SelectValue placeholder="Преподаватель" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1">
                        <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ ПРЕПОДАВАТЕЛИ</SelectItem>
                        {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id} className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">{t.firstName} {t.lastName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-full shrink-0 transition-colors"
                        onClick={clearFilters}
                        title="Сбросить фильтры"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
