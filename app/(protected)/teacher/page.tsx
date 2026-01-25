import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"

export default function TeacherDashboard() {
    return (
        <div className="p-6 md:p-8 space-y-6 bg-zinc-950 min-h-screen text-zinc-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teacher Workspace</h1>
                    <p className="text-zinc-400">Manage your classes and assignments.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Start Lesson
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Attendance Tracker: Group A1</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-3">
                                {["Alice Johnson", "Barry Allen", "Clark Kent", "Diana Prince", "Hal Jordan"].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                                        <span className="text-sm font-medium">{s}</span>
                                        <div className="flex gap-2">
                                            <button className="h-8 px-3 rounded text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                                                Present
                                            </button>
                                            <button className="h-8 px-3 rounded text-xs font-semibold bg-zinc-800 text-yellow-500 border border-zinc-700 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-colors">
                                                Late
                                            </button>
                                            <button className="h-8 px-3 rounded text-xs font-semibold bg-zinc-800 text-red-500 border border-zinc-700 hover:bg-red-500/10 hover:border-red-500/50 transition-colors">
                                                Absent
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-zinc-200">Flashcard Constructor</CardTitle>
                        <Button variant="secondary" size="sm">Create Set</Button>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px] border-t border-zinc-800/50">
                        <div className="bg-zinc-800 w-48 h-32 rounded-xl mb-4 shadow-xl shadow-black/40 rotate-3 border border-zinc-700 flex items-center justify-center">
                            <span className="text-zinc-500 text-lg">Front</span>
                        </div>
                        <p className="text-zinc-400 text-sm">Create interactive learning materials</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
