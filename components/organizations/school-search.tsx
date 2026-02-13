"use client";

import { useState } from "react";
import { Search, Loader2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { OrganizationService } from "@/lib/services/firestore";
import { Membership } from "@/lib/services/firestore";

interface SchoolSearchProps {
    memberships?: Membership[];
    onJoinRequest: (org: { id: string, name: string }) => void;
    className?: string;
}

export function SchoolSearch({ memberships = [], onJoinRequest, className }: SchoolSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await OrganizationService.searchOrganizations(val);
            // Filter out orgs the user is already a member of (if memberships provided)
            const filteredResults = results.filter(org =>
                !memberships.some(m => m.organizationId === org.id)
            );
            setSearchResults(filteredResults);
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleExplore = (orgId: string) => {
        localStorage.setItem('edu_org_id', orgId);
        router.push('/app/dashboard');
    };

    return (
        <div className={`w-full space-y-6 ${className}`}>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -track-y-1/2 h-5 w-5 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors -translate-y-1/2" />
                <Input
                    placeholder="Найти школу по названию..."
                    className="h-14 pl-12 bg-white/80 backdrop-blur-md border-[#DDE7EA] focus:border-primary focus:ring-primary/20 rounded-2xl font-bold text-[#0F3D4C] shadow-lg shadow-black/5"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
            </div>

            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-white/80 backdrop-blur-xl border border-[#DDE7EA] rounded-3xl p-4 shadow-xl space-y-2 max-h-[400px] overflow-y-auto"
                    >
                        <h4 className="text-[10px] font-black text-[#0F3D4C]/40 uppercase tracking-widest px-2 mb-2">Найдено школ</h4>
                        {searchResults.map((org) => (
                            <div
                                key={org.id}
                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-black">
                                        {org.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0F3D4C]">{org.name}</p>
                                        <p className="text-[10px] text-[#0F3D4C]/40 uppercase font-black">{org.type || "Школа"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); handleExplore(org.id); }}
                                        className="text-[10px] font-black uppercase tracking-widest h-8 px-4 rounded-lg border-[#0F3D4C]/10 text-[#0F3D4C]/40 hover:text-primary hover:border-primary/20"
                                    >
                                        <Eye className="h-3 w-3 mr-2" /> Осмотреться
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => { e.stopPropagation(); onJoinRequest({ id: org.id, name: org.name }); }}
                                        className="text-primary font-black text-[10px] h-8 px-4 border border-primary/20 hover:bg-primary hover:text-white rounded-lg"
                                    >
                                        Вступить
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </motion.div >
                )}
            </AnimatePresence >
        </div >
    );
}
