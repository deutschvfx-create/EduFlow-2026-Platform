
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <Card className="bg-card border-border border-dashed min-h-[400px] flex items-center justify-center">
                <CardContent className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Construction className="h-12 w-12 opacity-50" />
                    <p className="text-lg">Раздел "{title}" находится в разработке</p>
                    <p className="text-sm opacity-60">Скоро здесь появится функционал</p>
                </CardContent>
            </Card>
        </div>
    )
}
