export type HelpStep = {
    title: string;
    text: string;
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
    highlightId?: string; // Main element to highlight for this section
    highlightText?: string;
}

export const helpSections: HelpSection[] = [
    {
        id: "general",
        title: "Основы интерфейса",
        route: "all",
        steps: [
            { title: "Боковое меню", text: "Здесь находятся все основные модули системы. Используйте его для навигации." },
            { title: "Поиск", text: "Вверху каждой страницы есть поиск для быстрого нахождения данных." },
            { title: "Edu-Bot", text: "Я всегда здесь, чтобы помочь вам разобраться с функциями." }
        ]
    },
    {
        id: "dashboard",
        title: "Дашборд",
        route: "/app/dashboard",
        highlightId: "dashboard-stats",
        highlightText: "Важные показатели",
        steps: [
            { title: "Обзор", text: "Здесь вы видите ключевые показатели вашей школы/университета." },
            { title: "Статистика", text: "Графики показывают динамику посещаемости и финансов." }
        ]
    },
    {
        id: "students",
        title: "Студенты",
        route: "/app/students",
        highlightId: "students-add-btn",
        highlightText: "Кнопка добавления",
        steps: [
            { title: "Добавить студента", text: "Нажмите кнопку «Добавить студента» в верхнем правом углу." },
            { title: "Сканировать QR", text: "Используйте сканер для быстрого поиска или регистрации." },
            { title: "Статус", text: "Управляйте статусом (Активен/Ожидает/Заблокирован) в таблице." }
        ],
        images: [
            { caption: "Добавление студента", src: "/help/students-add.png" }
        ]
    },
    {
        id: "teachers",
        title: "Преподаватели",
        route: "/app/teachers",
        highlightId: "teachers-invite-btn",
        highlightText: "Пригласить преподавателя",
        steps: [
            { title: "Приглашение", text: "Отправьте приглашение по Email через кнопку «Пригласить»." },
            { title: "Роли", text: "Назначайте роли: Учитель (ведет занятия), Куратор (управляет группой), Админ." },
            { title: "Блокировка", text: "Вы можете временно ограничить доступ преподавателю." }
        ],
        images: [
            { caption: "Приглашение", src: "/help/teachers-invite.png" }
        ]
    },
    {
        id: "faculties",
        title: "Факультеты",
        route: "/app/faculties",
        highlightId: "faculties-add-btn",
        highlightText: "Создать факультет",
        steps: [
            { title: "Создание", text: "Создайте факультет для группировки кафедр и направлений." },
            { title: "Руководство", text: "Назначьте декана или ответственного." }
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
        steps: [
            { title: "Формирование", text: "Создайте учебную группу и назначьте куратора." },
            { title: "Наполнение", text: "Добавляйте студентов в группу через их профили или массово." }
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
        highlightId: "settings-toggle-group",
        highlightText: "Переключатели модулей",
        steps: [
            { title: "Модульность", text: "Включайте только то, что нужно вашей организации." },
            { title: "Шаблоны", text: "Используйте «Университет» или «Языковой курс» для быстрой настройки." },
            { title: "Зависимости", text: "Отключение родительского модуля (например, Группы) отключит зависимые (Расписание)." }
        ],
        images: [
            { caption: "Переключатели", src: "/help/settings-toggle.png" }
        ]
    }
];
