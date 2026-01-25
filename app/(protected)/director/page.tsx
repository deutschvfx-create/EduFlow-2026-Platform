import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react"

export default function DirectorDashboard() {
    return (
        <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Director Overview</h1>
                <p className="text-zinc-400">Manage your language school performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Students", value: "1,204", icon: Users, trend: "+12% this month" },
                    { title: "Active Groups", value: "45", icon: BookOpen, trend: "+3 new" },
                    { title: "Monthly Revenue", value: "$45,231", icon: DollarSign, trend: "+8% vs last month" },
                    { title: "Attendance Rate", value: "94%", icon: TrendingUp, trend: "Top tier" }
                ].map((stat, i) => (
                    <Card key={i} className="bg-zinc-900 border-zinc-800 backdrop-blur hover:bg-zinc-900/80 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-200">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-500">{stat.trend}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-zinc-500">
                        {/* Chart placeholder */}
                        <div className="w-full h-full bg-zinc-950/50 rounded flex items-center justify-center border border-zinc-800 border-dashed">
                            Chart Visualization (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Recent Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince"].map((u, i) => (
                                <div key={i} className="flex items-center border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                    <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                        {u[0]}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-zinc-200">{u}</p>
                                        <p className="text-xs text-zinc-500">English • Intermediate • Start Today</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
