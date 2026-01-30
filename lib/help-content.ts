export type HelpStep = {
    title: string;
    text: string;
    targetId?: string; // ID of the element to highlight for this specific step
    tip?: string;      // Optional extra advice from Edu-Bot
    details?: string;  // Detailed deep dive explanation

    // Automation / Interaction
    action?: 'click' | 'wait' | 'type';
    actionTargetId?: string; // If different from highlighted element
    preventInteraction?: boolean; // If true, only simulate visual click
    actionDelay?: number;

    // Logical Logic (New Stability Layer)
    version?: string;          // Version of the UI logic this step belongs to
    template_id?: string;      // Optional template context
    accessibilityId?: string;  // Priority logical identifier
    dataAction?: string;       // Action-specific logical identifier
}

export type HelpImage = {
    caption: string;
    src: string;
}

export type HelpSection = {
    id: string;
    title: string;
    route: string; // Matches current pathname to auto-open
    steps: HelpStep[];
    images?: HelpImage[];
    highlightId?: string; // Main element to highlight for this section (Start button target)
    highlightText?: string;
    moduleKey?: string;
    version?: string; // Section version
}

export const helpSections: HelpSection[] = [
    {
        id: "general",
        title: "Основы интерфейса",
        route: "all",
        version: "2.0.0",
        steps: [
            {
                title: "Боковое меню",
                text: "Здесь находятся все основные модули системы. Используйте его для навигации.",
                targetId: "mobile-nav-menu",
                tip: "Нажмите на иконку меню, чтобы открыть список всех доступных модулей."
            },
            {
                title: "Главный экран",
                text: "Вернитесь на дашборд в любое время одной кнопкой.",
                targetId: "mobile-nav-главная",
                tip: "Дашборд — это ваше рабочее место №1."
            },
            {
                title: "Edu-Bot",
                text: "Я всегда здесь, чтобы помочь вам разобраться с функциями.",
                targetId: "mobile-help-trigger",
                tip: "Если вы заблудились, просто позовите меня!"
            }
        ]
    },
    {
        id: "dashboard",
        title: "Дашборд",
        route: "/app/dashboard",
        highlightId: "dashboard-header",
        highlightText: "Начать обзор",
        steps: [
            {
                title: "Заголовок",
                text: "Здесь отображается текущее состояние системы и быстрый поиск.",
                targetId: "dashboard-header",
                tip: "Используйте поиск для нахождения студентов по имени или номеру."
            },
            {
                title: "Студенты",
                text: "Общее количество учащихся в вашей школе.",
                targetId: "dashboard-stat-students",
                tip: "Нажмите на карточку, чтобы быстро перейти к полному списку."
            },
            {
                title: "Преподаватели",
                text: "Количество активных сотрудников в системе.",
                targetId: "dashboard-stat-teachers",
                tip: "Здесь можно быстро оценить размер вашего штата."
            },
            {
                title: "Группы",
                text: "Все активные учебные группы и курсы.",
                targetId: "dashboard-stat-groups",
                tip: "Следите за наполнением групп в реальном времени."
            },
            {
                title: "Выручка",
                text: "Финансовые показатели за текущий месяц.",
                targetId: "dashboard-stat-revenue",
                tip: "Доступ к этой карточке имеют только пользователи с правами директора."
            },
            {
                title: "Быстрые действия",
                text: "Создавайте студентов, группы и учителей в один клик.",
                targetId: "dashboard-actions",
                tip: "Это самый быстрый способ начать работу с новыми данными."
            }
        ]
    },
    {
        id: "students",
        title: "Студенты",
        route: "/app/students",
        highlightId: "students-header",
        highlightText: "Обзор модуля",
        moduleKey: "students",
        version: "2.0.0",
        steps: [
            {
                title: "Список студентов",
                text: "Здесь отображаются все студенты с их статусами.",
                targetId: "students-header",
                accessibilityId: "students-title-view",
                tip: "Вы можете фильтровать список по группам или статусу оплаты."
            },
            {
                title: "Добавление",
                text: "Нажмите кнопку добавления, чтобы открыть форму регистрации.",
                targetId: "students-add-btn",
                accessibilityId: "add-student-trigger",
                dataAction: "open-registration-form",
                tip: "Кнопка всегда находится в правом верхнем углу.",
                action: 'click',
                version: "2.0.0"
            },
            {
                title: "QR Сканер",
                text: "Быстрый поиск студента по его персональному коду.",
                targetId: "students-qr-btn",
                accessibilityId: "qr-scanner-trigger",
                tip: "Это очень удобно для отметки посещаемости на входе."
            },
            {
                title: "Возврат",
                text: "Вернемся к списку студентов.",
                targetId: "students-header",
                action: 'wait',
                version: "2.0.0"
            }
        ],
        images: [
            { caption: "Добавление студента", src: "/help/students-add.png" }
        ]
    },
    {
        id: "teachers",
        title: "Преподаватели",
        route: "/app/teachers",
        highlightId: "teachers-header",
        highlightText: "Обзор модуля",
        moduleKey: "teachers",
        steps: [
            {
                title: "Штат сотрудников",
                text: "Управляйте ролями и доступом ваших учителей.",
                targetId: "teachers-header",
                tip: "Здесь можно назначить куратора для конкретной учебной группы."
            },
            {
                title: "Приглашение",
                text: "Отправьте ссылку на регистрацию новому преподавателю.",
                targetId: "teachers-invite-btn",
                tip: "Преподаватель получит письмо с данными для входа."
            },
            {
                title: "Контроль доступа",
                text: "Настройте права для каждого сотрудника системы.",
                targetId: "teachers-control-mode",
                tip: "Ограничьте доступ к финансовым отчетам для рядовых учителей.",
                details: "Режим контроля позволяет переключаться между базовым видом списка и расширенным управлением правами. В режиме контроля вы можете массово изменять доступ к модулям, блокировать учетные записи или назначать роли (Учитель, Менеджер, Администратор)."
            }
        ],
        images: [
            { caption: "Приглашение", src: "/help/teachers-invite.png" }
        ]
    },
    {
        id: "faculties",
        title: "Факультеты",
        route: "/app/faculties",
        highlightId: "faculties-header",
        highlightText: "Обзор факультетов",
        moduleKey: "faculties",
        steps: [
            {
                title: "Учебные направления",
                text: "Здесь вы можете создать структуру вашей организации (Кафедры, Факультеты).",
                targetId: "faculties-header",
                tip: "Это полезно для крупных учебных центров с разветвленной структурой."
            },
            {
                title: "Добавление",
                text: "Создайте новое направление или факультет за пару кликов.",
                targetId: "faculties-add-btn",
                tip: "Не забудьте включить модуль 'Факультеты' в настройках!"
            }
        ],
        images: [
            { caption: "Факультеты", src: "/help/faculties-add.png" }
        ]
    },
    {
        id: "departments",
        title: "Кафедры",
        route: "/app/departments",
        moduleKey: "departments",
        steps: [
            { title: "Структура", text: "Кафедры привязаны к факультетам. В настройках они зависят от модуля «Факультеты»." },
            { title: "Создание", text: "Укажите название и выберите родительский факультет." }
        ]
    },
    {
        id: "groups",
        title: "Группы",
        route: "/app/groups",
        highlightId: "groups-header",
        highlightText: "Управление группами",
        moduleKey: "groups",
        steps: [
            {
                title: "Все группы",
                text: "Список ваших учебных классов и потоков.",
                targetId: "groups-header",
                tip: "Группы — это основа расписания и журнала оценок."
            },
            {
                title: "Создание",
                text: "Сформируйте новую группу и выберите курс.",
                targetId: "groups-create-btn",
                tip: "Сначала создайте 'Предмет' в соответствующем модуле."
            }
        ]
    },
    {
        id: "courses",
        title: "Предметы",
        route: "/app/courses",
        moduleKey: "courses",
        steps: [
            { title: "Дисциплины", text: "Создайте предметы, которые будут в расписании." },
            { title: "Привязка", text: "Назначьте предметы конкретным группам." }
        ]
    },
    {
        id: "schedule",
        title: "Расписание",
        route: "/app/schedule",
        moduleKey: "schedule",
        steps: [
            { title: "Урок", text: "Выберите день, время, преподавателя и аудиторию." },
            { title: "Зависимости", text: "Требует наличия Групп и Предметов." }
        ]
    },
    {
        id: "attendance",
        title: "Посещаемость",
        route: "/app/attendance",
        moduleKey: "attendance",
        steps: [
            { title: "Отметка", text: "Отмечайте присутствие студентов на занятиях." },
            { title: "Экспорт", text: "Выгружайте отчеты о посещаемости." }
        ]
    },
    {
        id: "grades",
        title: "Оценки",
        route: "/app/grades",
        moduleKey: "grades",
        steps: [
            { title: "Журнал", text: "Выставляйте оценки за уроки, домашние задания и экзамены." },
            { title: "Настройки", text: "Этот модуль можно отключить в настройках, если оценки не нужны." }
        ]
    },
    {
        id: "announcements",
        title: "Объявления",
        route: "/app/announcements",
        moduleKey: "announcements",
        steps: [
            { title: "Рассылка", text: "Создавайте новости для всех студентов или преподавателей." },
            { title: "Закрепление", text: "Важные объявления можно закрепить вверху списка." }
        ]
    },
    {
        id: "chat",
        title: "Чаты",
        route: "/app/chat",
        moduleKey: "chat",
        steps: [
            { title: "Общение", text: "Создавайте беседы с группами или личные чаты." }
        ]
    },
    {
        id: "settings",
        title: "Настройки",
        route: "/app/settings",
        highlightId: "settings-header",
        highlightText: "Конфигурация",
        steps: [
            {
                title: "Модульность",
                text: "Включайте только то, что нужно вашей организации.",
                targetId: "settings-toggle-group",
                tip: "Отключайте 'Оценки' или 'Факультеты', если они вам не нужны."
            },
            {
                title: "Шаблоны",
                text: "Используйте готовые пресеты для быстрой настройки под ваш бизнес.",
                targetId: "settings-templates",
                tip: "Шаблон 'Языковая школа' идеально подходит для малых курсов."
            }
        ],
        images: [
            { caption: "Переключатели", src: "/help/settings-toggle.png" }
        ]
    },
    {
        id: "reports",
        title: "Отчёты",
        route: "/app/reports",
        highlightId: "reports-header",
        highlightText: "Начать обзор",
        moduleKey: "reports",
        steps: [
            {
                title: "Аналитика",
                text: "Здесь собраны все ключевые показатели вашей школы.",
                targetId: "reports-header",
                tip: "Используйте фильтры сверху, чтобы уточнить данные по группам или учителям.",
                details: "Раздел отчетов агрегирует данные из всех модулей системы. Вы можете отслеживать посещаемость, успеваемость и нагрузку преподавателей в реальном времени. Графики в центре страницы показывают динамику за выбранный период (неделя, месяц или год)."
            }
        ]
    }
];
