'use client';

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function PaymentsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <FeaturePlaceholder
                featureName="Финансовый Центр"
                plannedFeatures={[
                    "Интеграция с платежными шлюзами (Stripe, CloudPayments)",
                    "Автоматическое выставление счетов и квитанций",
                    "Личный кабинет родителя для оплаты в один клик",
                    "Учет скидок, рассрочек и бонусных программ",
                    "Глубокая аналитика задолженностей и прогнозирование выручки"
                ]}
                benefits={[
                    "Прозрачность денежных потоков",
                    "Снижение задержек по оплатам",
                    "Полная автоматизация бухгалтерии"
                ]}
                className="max-w-3xl"
            />
        </div>
    )
}
