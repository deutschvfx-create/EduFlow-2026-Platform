export type HelpStep = {
    title: string;
    text: string;
    targetId?: string; // ID of the element to highlight for this specific step
    tip?: string;      // Optional extra advice from Edu-Bot
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
}

export const helpSections: HelpSection[] = [
    {
        id: "general",
        title: "Основы интерфейса",
        route: "all",
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
        steps: [
            {
                title: "Список студентов",
                text: "Здесь отображаются все студенты с их статусами.",
                targetId: "students-header",
                tip: "Вы можете фильтровать список по группам или статусу оплаты."
            },
            {
                title: "Добавление",
                text: "Нажмите сюда, чтобы зарегистрировать нового ученика.",
                targetId: "students-add-btn",
                tip: "Заполните профиль полностью, чтобы система могла строить отчеты."
            },
            {
                title: "QR Сканер",
                text: "Быстрый поиск студента по его персональному коду.",
                targetId: "students-qr-btn",
                tip: "Это очень удобно для отметки посещаемости на входе."
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
                tip: "Ограничьте доступ к финансовым отчетам для рядовых учителей."
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
        steps: [
            { title: "Дисциплины", text: "Создайте предметы, которые будут в расписании." },
            { title: "Привязка", text: "Назначьте предметы конкретным группам." }
        ]
    },
    {
        id: "schedule",
        title: "Расписание",
        route: "/app/schedule",
        steps: [
            { title: "Урок", text: "Выберите день, время, преподавателя и аудиторию." },
            { title: "Зависимости", text: "Требует наличия Групп и Предметов." }
        ]
    },
    {
        id: "attendance",
        title: "Посещаемость",
        route: "/app/attendance",
        steps: [
            { title: "Отметка", text: "Отмечайте присутствие студентов на занятиях." },
            { title: "Экспорт", text: "Выгружайте отчеты о посещаемости." }
        ]
    },
    {
        id: "grades",
        title: "Оценки",
        route: "/app/grades",
        steps: [
            { title: "Журнал", text: "Выставляйте оценки за уроки, домашние задания и экзамены." },
            { title: "Настройки", text: "Этот модуль можно отключить в настройках, если оценки не нужны." }
        ]
    },
    {
        id: "announcements",
        title: "Объявления",
        route: "/app/announcements",
        steps: [
            { title: "Рассылка", text: "Создавайте новости для всех студентов или преподавателей." },
            { title: "Закрепление", text: "Важные объявления можно закрепить вверху списка." }
        ]
    },
    {
        id: "chat",
        title: "Чаты",
        route: "/app/chat",
        steps: [
            { title: "Общение", text: "Создавайте беседы с группами или личные чаты." }
        ]
    },
    {
        id: "reports",
        title: "Отчёты",
        route: "/app/reports",
        steps: [
            { title: "KPI", text: "Смотрите сводную аналитику по успеваемости и посещаемости." }
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
    }
];
