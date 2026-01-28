'use client';

import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FacultyFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
}

export function FacultyFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
}: FacultyFiltersProps) {
    const hasActiveFilters = search || statusFilter !== 'all';

    const clearFilters = () => {
        onSearchChange('');
        onStatusChange('all');
    }

    const filters = [
        { label: "Все секции", value: "all" },
        { label: "Активные", value: "ACTIVE" },
        { label: "Неактивные", value: "INACTIVE" },
        { label: "Архив", value: "ARCHIVED" },
    ];

    return (
        <div className="space-y-6 mb-8">
            {/* Search Bar Section */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                    placeholder="Поиск по названию или коду факультета..."
                    className="h-12 pl-12 bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-2xl text-base placeholder:text-zinc-600 transition-all shadow-xl"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="h-4 w-4 text-zinc-500" />
                    </button>
                )}
            </div>

            {/* Pill Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 mr-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <Filter className="h-3 w-3" />
                    Фильтр:
                </div>
                {filters.map((f) => {
                    const isActive = statusFilter === f.value;
                    return (
                        <Button
                            key={f.value}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => onStatusChange(f.value)}
                            className={`relative rounded-full px-5 h-9 font-bold text-xs transition-all ${isActive
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-lg shadow-indigo-500/20'
                                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700'
                                }`}
                        >
                            {f.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-filter-pill"
                                    className="absolute inset-x-0 -bottom-px h-px bg-white/20"
                                />
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
