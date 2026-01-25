import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl shadow-indigo-500/10 z-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight text-white">EduFlow 2026</CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Enter your credentials to access the platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-200">Email</Label>
                        <Input id="email" placeholder="m@example.com" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-200">Password</Label>
                        <Input id="password" type="password" className="bg-zinc-950 border-zinc-700 text-zinc-100" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Role (Demo Only)</Label>
                        <Select>
                            <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-100">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                <SelectItem value="DIRECTOR">Director</SelectItem>
                                <SelectItem value="TEACHER">Teacher</SelectItem>
                                <SelectItem value="STUDENT">Student</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Sign In</Button>
                </CardFooter>
            </Card>
            {/* Background decoration */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
        </div>
    )
}
