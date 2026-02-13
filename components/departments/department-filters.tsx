'use client';

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { Faculty } from '@/lib/types/faculty';

interface DepartmentFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    facultyFilter: string;
    onFacultyChange: (val: string) => void;
}

export function DepartmentFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    facultyFilter,
    onFacultyChange
}: DepartmentFiltersProps) {
    const { currentOrganizationId } = useOrganization();
    const [faculties, setFaculties] = useState<Faculty[]>([]);

    useEffect(() => {
        if (currentOrganizationId) {
            import("@/lib/data/faculties.repo").then(({ facultiesRepo }) => {
                facultiesRepo.getAll(currentOrganizationId).then(setFaculties);
            });
        }
    }, [currentOrganizationId]);

    const hasActiveFilters = search || statusFilter !== 'all' || facultyFilter !== 'all';

    const clearFilters = () => {
        onSearchChange('');
        onStatusChange('all');
        onFacultyChange('all');
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по названию или коду..."
                    className="pl-9 bg-card border-border"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Select value={facultyFilter} onValueChange={onFacultyChange}>
                    <SelectTrigger className="w-[180px] bg-card border-border">
                        <SelectValue placeholder="Факультет" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все факультеты</SelectItem>
                        {faculties.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px] bg-card border-border">
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
