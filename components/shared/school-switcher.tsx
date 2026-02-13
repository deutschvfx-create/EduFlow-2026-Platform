"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check, PlusCircle, Globe, School, Home, Sparkles } from "lucide-react";
import { CreateOrgModal } from "@/components/organizations/create-org-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SchoolSwitcher({ className }: { className?: string }) {
    const { userData } = useAuth();
    const { organizations, currentOrganizationId, switchOrganization } = useOrganization();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const currentOrg = organizations.find(o => o.id === currentOrganizationId);

    // If waiting for data
    if (organizations.length === 0 && !currentOrg) {
        return (
            <div className={cn("flex items-center gap-3 px-2 py-4 opacity-50", className)}>
                <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
                <div className="space-y-1">
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-2 w-12 bg-white/10 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    role="combobox"
                    aria-label="Select a school"
                    className={cn("w-full justify-between hover:bg-white/10 px-2 py-6 rounded-xl transition-all", className)}
                >
                    <div className="flex items-center gap-3 text-left min-w-0">
                        <Avatar className="h-9 w-9 rounded-lg border-2 border-white/20 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-900/20">
                            {/* Initials */}
                            <AvatarFallback className="text-white bg-transparent font-black tracking-tight">
                                {currentOrg?.name?.substring(0, 2).toUpperCase() || "SCH"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left leading-tight min-w-0">
                            <span className="truncate font-black text-inherit text-[13px] tracking-wide">
                                {currentOrg?.name || "Выберите школу"}
                            </span>
                            <span className="truncate text-inherit opacity-60 text-[10px] font-bold uppercase tracking-wider">
                                {organizations.length > 1 ? "Сменить организацию" : "Ваша организация"}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 text-inherit" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[260px] p-2 rounded-xl shadow-xl border-slate-100" align="start">
                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-2">
                    Мои организации ({organizations.length})
                </DropdownMenuLabel>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                    {organizations.map((org) => (
                        <DropdownMenuItem
                            key={org.id}
                            onSelect={() => switchOrganization(org.id)}
                            className={cn(
                                "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all",
                                currentOrganizationId === org.id
                                    ? "bg-primary/5 text-primary"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                                currentOrganizationId === org.id
                                    ? "bg-white border-primary/20 text-primary"
                                    : "bg-white border-slate-200 text-slate-400"
                            )}>
                                <School className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-xs font-bold truncate", currentOrganizationId === org.id ? "text-primary" : "text-slate-700")}>
                                    {org.name}
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase font-medium">{org.type || "Школа"}</p>
                            </div>
                            {currentOrganizationId === org.id && (
                                <Check className="ml-auto h-4 w-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>

                <DropdownMenuSeparator className="my-2 bg-slate-100" />

                <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-primary transition-all font-bold"
                >
                    <Link href="/app/home">
                        <div className="h-8 w-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            <Home className="h-4 w-4" />
                        </div>
                        <span className="text-xs">Общий обзор (Все школы)</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onSelect={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-primary transition-all font-bold"
                >
                    <div className="h-8 w-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <PlusCircle className="h-4 w-4" />
                    </div>
                    <span className="text-xs">Создать новую школу</span>
                </DropdownMenuItem>

                <CreateOrgModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
