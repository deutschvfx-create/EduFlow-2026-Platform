'use client';

import { ModuleGuard } from "@/components/system/module-guard";
import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function Page() {
    return (
        <ModuleGuard module="announcements">
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <FeaturePlaceholder
                    featureName="Центр Объявлений"
                    plannedFeatures={[
                        "Создание важных уведомлений для всей школы",
                        "Таргетированные рассылки по группам или филиалам",
                        "Опросы и голосования среди студентов",
                        "Статистика просмотров и подтверждение прочтения",
                        "Интеграция с Telegram и WhatsApp ботами"
                    ]}
                    benefits={[
                        "Гарантированная доставка информации до студентов",
                        "Эффективный сбор обратной связи",
                        "Снижение нагрузки на администраторов"
                    ]}
                    className="max-w-3xl"
                />
            </div>
        </ModuleGuard>
    );
}
