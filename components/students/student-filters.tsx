'use client';

import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { Group } from '@/lib/types/group';

interface StudentFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    groupFilter: string;
    onGroupChange: (val: string) => void;
}

export function StudentFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    groupFilter,
    onGroupChange
}: StudentFiltersProps) {
    const { currentOrganizationId } = useOrganization();
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        if (currentOrganizationId) {
            import("@/lib/data/groups.repo").then(({ groupsRepo }) => {
                groupsRepo.getAll(currentOrganizationId).then(setGroups);
            });
        }
    }, [currentOrganizationId]);

    const hasActiveFilters = search || statusFilter !== 'all' || groupFilter !== 'all';

    const clearFilters = () => {
        onSearchChange('');
        onStatusChange('all');
        onGroupChange('all');
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Поиск по имени, фамилии, ID..."
                    className="pl-9 bg-zinc-900 border-zinc-800"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="ACTIVE">Активные</SelectItem>
                        <SelectItem value="PENDING">Ожидают</SelectItem>
                        <SelectItem value="SUSPENDED">Заблокированы</SelectItem>
                        <SelectItem value="ARCHIVED">Архив</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={groupFilter} onValueChange={onGroupChange}>
                    <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Группа" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все группы</SelectItem>
                        {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
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
