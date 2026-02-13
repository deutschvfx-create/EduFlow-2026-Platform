"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import {
    getMasterStats,
    getOrganizations,
    toggleOrgStatus,
    searchGlobal,
    validateMasterKey
} from "@/lib/actions/master";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    ShieldAlert,
    Building2,
    Users,
    Activity,
    Search,
    Power,
    ExternalLink,
    Zap,
    Lock,
    Unlock,
    Settings,
    ChevronRight,
    SearchX,
    Fingerprint,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterCenterPage() {
    const { userData } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // SECURITY STATE
    const [masterPass, setMasterPass] = useState("");
    const [isSecured, setIsSecured] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [authError, setAuthError] = useState(false);

    const isMaster = userData?.uid === process.env.NEXT_PUBLIC_MASTER_ADMIN_UID;

    const handleAuthenticate = async () => {
        if (!masterPass) return;
        setVerifying(true);
        setAuthError(false);
        try {
            const isValid = await validateMasterKey(masterPass);
            if (isValid) {
                setIsSecured(false);
                loadData(masterPass);
            } else {
                setAuthError(true);
            }
        } catch (err) {
            setAuthError(true);
        } finally {
            setVerifying(false);
        }
    };

    async function loadData(key: string) {
        setLoading(true);
        try {
            const [s, o] = await Promise.all([
                getMasterStats(userData!.uid, userData!.email!, key),
                getOrganizations(userData!.uid, userData!.email!, key)
            ]);
            setStats(s);
            setOrgs(o);
        } catch (err) {
            console.error("Master Load Error:", err);
            setIsSecured(true); // Kick back to security if session/key expires
        } finally {
            setLoading(false);
        }
    }

    const handleToggleStatus = async (orgId: string, currentStatus: string) => {
        const nextStatus = currentStatus === "active" ? false : true;
        try {
            await toggleOrgStatus(userData!.uid, userData!.email!, masterPass, orgId, nextStatus);
            setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: nextStatus ? "active" : "suspended" } : o));
        } catch (err) {
            alert("Failed to toggle status: " + (err as Error).message);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const results = await searchGlobal(userData!.uid, userData!.email!, masterPass, searchQuery);
            setSearchResults(results);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setSearching(false);
        }
    };

    if (!isMaster) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
                <Lock className="h-16 w-16 text-red-500/20 mb-6" />
                <h1 className="text-2xl font-black text-foreground uppercase tracking-widest italic">Access Denied</h1>
                <p className="text-muted-foreground mt-2 max-w-sm">This terminal is restricted to the platform owner only.</p>
            </div>
        );
    }

    /* Security gate temporarily disabled by user request */
    if (false && isSecured) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="bg-background border-border overflow-hidden shadow-2xl shadow-red-500/10">
                        <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600" />
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
                            </div>
                            <CardTitle className="text-xl font-black text-foreground uppercase tracking-[0.2em] italic">Security Protocol</CardTitle>
                            <CardDescription className="text-red-500/60 font-bold uppercase tracking-widest text-[10px] mt-1">Level 5 Master Authentication Required</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Dynamic Master Key (HH Europe/Berlin)</label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        placeholder="Enter hourly passcode..."
                                        value={masterPass}
                                        onChange={(e) => setMasterPass(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                                        className={`bg-card border-border text-foreground h-14 rounded-xl px-4 font-mono tracking-[0.5em] text-center text-lg focus:border-red-500/50 transition-all ${authError ? 'border-red-500 animate-shake' : ''}`}
                                    />
                                    <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                {authError && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mt-2 animate-bounce">
                                        Invalid dynamic key. Access restricted.
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleAuthenticate}
                                disabled={verifying || !masterPass}
                                className="w-full h-14 bg-red-600 hover:bg-red-500 text-foreground font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-red-600/20 transition-all active:scale-95"
                            >
                                {verifying ? <Activity className="h-5 w-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Initialize Command <Zap className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                            <p className="text-[9px] text-muted-foreground text-center uppercase font-bold tracking-tighter italic">
                                Note: The master key refreshes every hour based on Germany time (CET).
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <ShieldCheck className="h-12 w-12 text-emerald-500 animate-bounce" />
                <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Decrypting Secure Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-red-500/20">
                        <ShieldAlert className="h-8 w-8 text-foreground" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-foreground tracking-widest uppercase italic">Command Center</h1>
                            <span className="bg-red-500/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-red-500/20">Master Session Active</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">Platform-Wide Control Panel v5.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-card/50 p-2 rounded-2xl border border-border shadow-xl">
                    <div className="px-4 text-center border-r border-border">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Orgs</p>
                        <p className="text-xl font-black text-foreground">{stats?.totalOrganizations || 0}</p>
                    </div>
                    <div className="px-4 text-center border-r border-border">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Global Users</p>
                        <p className="text-xl font-black text-foreground">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="px-4 text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Students</p>
                        <p className="text-xl font-black text-foreground">{stats?.totalStudents || 0}</p>
                    </div>
                </div>
            </div>

            {/* Smart Search */}
            <div className="relative group">
                <div className="absolute inset-0 bg-red-500/20 blur-[100px] -z-10 rounded-full" />
                <Card className="bg-background/60 border-border overflow-hidden backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            Global Smart Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Найти пользователя по email или имени..."
                                className="bg-card/50 border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={searching}
                                className="h-12 px-6 bg-red-600 hover:bg-red-500 text-foreground font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20"
                            >
                                {searching ? <Activity className="h-4 w-4 animate-spin" /> : "Поиск"}
                            </Button>
                        </div>

                        {/* Search Results */}
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 space-y-2"
                                >
                                    {searchResults.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-card/30 rounded-xl border border-border/50 hover:bg-card/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black text-xs text-muted-foreground">
                                                    {user.name?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{user.name || "Без имени"}</p>
                                                    <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold">{user.email} • {user.role}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 text-[9px] uppercase font-black tracking-widest text-muted-foreground hover:text-foreground">
                                                Control <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orgs.map((org) => (
                    <Card key={org.id} className={`bg-background/60 border-border overflow-hidden group hover:border-border transition-all duration-300 ${org.status === 'suspended' ? 'opacity-50' : ''}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-colors ${org.status === 'active' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground'}`}>
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black text-foreground tracking-tight leading-none mb-1">
                                        {org.name || "New Organization"}
                                    </CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                        ID: {org.id.substring(0, 12)}...
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${org.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                                    {org.status || "UNKNOWN"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border/50 mb-6 font-mono">
                                <div className="bg-card/30 p-2 rounded-lg border border-border/50">
                                    <p className="text-[8px] text-muted-foreground uppercase mb-1">CreatedAt</p>
                                    <p className="text-[10px] text-muted-foreground/70">{new Date(org.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-card/30 p-2 rounded-lg border border-border/50">
                                    <p className="text-[8px] text-muted-foreground uppercase mb-1">Owner Email</p>
                                    <p className="text-[10px] text-muted-foreground/70 truncate">{org.ownerId?.substring(0, 15)}...</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-card p-2 rounded-lg border border-border">
                                        <Switch
                                            checked={org.status === 'active'}
                                            onCheckedChange={() => handleToggleStatus(org.id, org.status)}
                                            className="data-[state=checked]:bg-emerald-600"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        {org.status === 'active' ? <Unlock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-red-500" />}
                                        {org.status === 'active' ? "Access Active" : "Access Suspended"}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" className="bg-white hover:bg-secondary text-black font-black uppercase tracking-widest text-[10px] rounded-lg shadow-xl shadow-white/5">
                                        View Dashboard <ExternalLink className="h-3 w-3 ml-1.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Section - Advanced Tools */}
            <div className="bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/30 animate-pulse">
                        <Activity className="h-8 w-8 text-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Live Monitor Mode</h3>
                        <p className="text-muted-foreground text-sm max-w-md mt-1 italic">Активируйте этот режим, чтобы видеть действия пользователей в реальном времени и оказывать техническую поддержку через "Ghost Mirroring".</p>
                    </div>
                </div>
                <Button className="h-14 px-10 bg-white hover:bg-secondary text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-white/10 group">
                    Start Monitoring <Zap className="h-4 w-4 ml-2 text-orange-500 group-hover:scale-125 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
