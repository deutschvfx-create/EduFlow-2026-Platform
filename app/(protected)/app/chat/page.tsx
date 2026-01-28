'use client';

import { ModuleGuard } from "@/components/system/module-guard";
import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function Page() {
    return (
        <ModuleGuard module="chat">
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <FeaturePlaceholder
                    featureName="Мессенджер EduFlow"
                    plannedFeatures={[
                        "Персональные чаты между учителями и учениками",
                        "Групповые обсуждения для классов",
                        "Рассылка файлов и домашних заданий",
                        "Голосовые сообщения и видеозвонки",
                        "Push-уведомления в реальном времени"
                    ]}
                    benefits={[
                        "Мгновенная связь без сторонних мессенджеров",
                        "Вся история общения в одном месте",
                        "Безопасная среда для обучения"
                    ]}
                    className="max-w-3xl"
                />
            </div>
        </ModuleGuard>
    );
}
