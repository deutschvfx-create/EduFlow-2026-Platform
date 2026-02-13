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
        <div className="flex flex-col gap-2.5">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] transition-colors group-focus-within:text-[#2563EB]" />
                <Input
                    placeholder="Поиск по имени или email..."
                    className="h-10 pl-11 bg-[#F1F5F9] border-transparent text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] rounded-full focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter shadow-none"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="flex-1 h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#2563EB]/5 hover:bg-[#F8FAFC] hover:border-[#2563EB]/30 transition-all font-inter px-3.5 shadow-sm">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                        <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ СТАТУСЫ</SelectItem>
                        <SelectItem value="ACTIVE" className="text-[10px] font-bold py-2 text-[#22C55E] rounded-full font-inter uppercase tracking-wider">АКТИВНЫЕ</SelectItem>
                        <SelectItem value="PENDING" className="text-[10px] font-bold py-2 text-[#F59E0B] rounded-full font-inter uppercase tracking-wider">ОЖИДАЮТ</SelectItem>
                        <SelectItem value="SUSPENDED" className="text-[10px] font-bold py-2 text-[#EF4444] rounded-full font-inter uppercase tracking-wider">БЛОК</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={groupFilter} onValueChange={onGroupChange}>
                    <SelectTrigger className="flex-1 h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#2563EB]/5 hover:bg-[#F8FAFC] hover:border-[#2563EB]/30 transition-all font-inter px-3.5 shadow-sm">
                        <SelectValue placeholder="Группа" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                        <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ ГРУППЫ</SelectItem>
                        {groups.map(g => (
                            <SelectItem key={g.id} value={g.id} className="text-[10px] font-bold py-2 uppercase rounded-full font-inter tracking-wider">
                                {g.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-full shrink-0 transition-colors"
                        onClick={clearFilters}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
