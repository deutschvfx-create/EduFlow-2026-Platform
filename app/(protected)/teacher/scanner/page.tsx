"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function TeacherScannerPage() {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [scanResult, setScanResult] = useState<{ status: 'success' | 'error', message: string, studentId?: string } | null>(null);

    const handleScan = (text: string) => {
        if (text && !isPaused) {
            setIsPaused(true);
            setScannedData(text);

            // Mock processing
            // Expected format: "student:ID"
            if (text.startsWith("student:")) {
                const studentId = text.split(":")[1];
                setScanResult({
                    status: 'success',
                    message: `Студент найден: ${studentId}`,
                    studentId: studentId
                });
            } else {
                setScanResult({
                    status: 'error',
                    message: "Неверный формат QR кода"
                });
            }
        }
    };

    const handleReset = () => {
        setScanResult(null);
        setScannedData(null);
        setIsPaused(false);
    };

    const handleAction = (action: 'present' | 'grade') => {
        // Implement action logic here
        console.log(`Action: ${action} for ${scannedData}`);
        handleReset();
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-md mx-auto w-full min-h-[calc(100vh-4rem)]">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Сканер QR</h1>
                <p className="text-muted-foreground text-sm">
                    Наведите камеру на QR код студента
                </p>
            </div>

            <Card className="overflow-hidden border-0 shadow-lg bg-black/5 rounded-3xl">
                <div className="aspect-square relative bg-black">
                    {!isPaused && (
                        <Scanner
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    handleScan(result[0].rawValue);
                                }
                            }}
                            styles={{
                                container: { width: "100%", height: "100%" }
                            }}
                        />
                    )}
                    {isPaused && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
                            <p>Обработка...</p>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog open={!!scanResult} onOpenChange={(open) => !open && handleReset()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {scanResult?.status === 'success' ? (
                                <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                            ) : (
                                <AlertCircle className="text-red-500 h-6 w-6" />
                            )}
                            {scanResult?.status === 'success' ? 'Успешно' : 'Ошибка'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-lg text-center">{scanResult?.message}</p>
                        {scanResult?.studentId && (
                            <div className="flex justify-center mt-4">
                                <Badge variant="outline" className="text-lg px-4 py-1">
                                    ID: {scanResult.studentId}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        {scanResult?.status === 'success' ? (
                            <>
                                <Button onClick={() => handleAction('present')} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                                    Отметить присутствие
                                </Button>
                                <Button onClick={() => handleAction('grade')} variant="outline" className="w-full sm:w-auto">
                                    Поставить оценку
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleReset} variant="secondary" className="w-full">
                                Попробовать снова
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
