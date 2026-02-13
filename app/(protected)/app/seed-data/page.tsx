'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/auth/auth-provider';

export default function SeedDataPage() {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string[]>([]);

    const teachers = [
        {
            id: 'teacher-anna-ivanova',
            firstName: 'Анна',
            lastName: 'Иванова',
            email: 'anna.ivanova@eduflow.school',
            role: 'teacher',
            specialization: 'Немецкий язык',
            phone: '+7 (999) 123-45-67',
            status: 'ACTIVE',
            bio: 'Преподаватель немецкого языка с 10-летним стажем.',
        },
        {
            id: 'teacher-mikhail-petrov',
            firstName: 'Михаил',
            lastName: 'Петров',
            email: 'mikhail.petrov@eduflow.school',
            role: 'teacher',
            specialization: 'Английский язык',
            phone: '+7 (999) 234-56-78',
            status: 'ACTIVE',
            bio: 'Носитель языка, преподаватель английского.',
        },
        {
            id: 'teacher-elena-smirnova',
            firstName: 'Елена',
            lastName: 'Смирнова',
            email: 'elena.smirnova@eduflow.school',
            role: 'teacher',
            specialization: 'Французский язык',
            phone: '+7 (999) 345-67-89',
            status: 'ACTIVE',
            bio: 'Магистр французской филологии.',
        },
        {
            id: 'teacher-dmitry-kozlov',
            firstName: 'Дмитрий',
            lastName: 'Козлов',
            email: 'dmitry.kozlov@eduflow.school',
            role: 'teacher',
            specialization: 'Испанский язык',
            phone: '+7 (999) 456-78-90',
            status: 'ACTIVE',
            bio: 'Преподаватель испанского, сертификат DELE C2.',
        },
        {
            id: 'teacher-olga-volkova',
            firstName: 'Ольга',
            lastName: 'Волкова',
            email: 'olga.volkova@eduflow.school',
            role: 'teacher',
            specialization: 'Итальянский язык',
            phone: '+7 (999) 567-89-01',
            status: 'ACTIVE',
            bio: 'Преподаватель итальянского языка.',
        },
    ];

    const groups = [
        {
            id: 'group-german-a1-morning',
            name: 'Немецкий A1 Утро',
            code: 'DE-A1-M',
            level: 'A1',
            status: 'ACTIVE',
            studentsCount: 8,
            teachersCount: 1,
            coursesCount: 2,
            curatorTeacherId: 'teacher-anna-ivanova',
            maxStudents: 12,
            paymentType: 'PAID',
            facultyId: 'default',
            departmentId: 'default',
            schedule: 'Пн, Ср, Пт 09:00-11:00',
        },
        {
            id: 'group-english-b1-evening',
            name: 'Английский B1 Вечер',
            code: 'EN-B1-E',
            level: 'B1',
            status: 'ACTIVE',
            studentsCount: 10,
            teachersCount: 1,
            coursesCount: 3,
            curatorTeacherId: 'teacher-mikhail-petrov',
            maxStudents: 15,
            paymentType: 'PAID',
            facultyId: 'default',
            departmentId: 'default',
            schedule: 'Вт, Чт 18:00-20:00',
        },
        {
            id: 'group-french-a2-day',
            name: 'Французский A2 День',
            code: 'FR-A2-D',
            level: 'A2',
            status: 'ACTIVE',
            studentsCount: 6,
            teachersCount: 1,
            coursesCount: 2,
            curatorTeacherId: 'teacher-elena-smirnova',
            maxStudents: 10,
            paymentType: 'PAID',
            facultyId: 'default',
            departmentId: 'default',
            schedule: 'Пн, Ср 14:00-16:00',
        },
        {
            id: 'group-spanish-b2-intensive',
            name: 'Испанский B2 Интенсив',
            code: 'ES-B2-I',
            level: 'B2',
            status: 'ACTIVE',
            studentsCount: 5,
            teachersCount: 1,
            coursesCount: 4,
            curatorTeacherId: 'teacher-dmitry-kozlov',
            maxStudents: 8,
            paymentType: 'PAID',
            facultyId: 'default',
            departmentId: 'default',
            schedule: 'Пн-Пт 10:00-12:00',
        },
        {
            id: 'group-german-c1-advanced',
            name: 'Немецкий C1 Продвинутый',
            code: 'DE-C1-A',
            level: 'C1',
            status: 'ACTIVE',
            studentsCount: 4,
            teachersCount: 1,
            coursesCount: 3,
            curatorTeacherId: 'teacher-anna-ivanova',
            maxStudents: 6,
            paymentType: 'PAID',
            facultyId: 'default',
            departmentId: 'default',
            schedule: 'Сб, Вс 11:00-14:00',
        },
        {
            id: 'group-italian-a1-weekend',
            name: 'Итальянский A1 Выходные',
            code: 'IT-A1-W',
            level: 'A1',
            status: 'ACTIVE',
            studentsCount: 7,
            teachersCount: 1,
            coursesCount: 2,
            curatorTeacherId: 'teacher-olga-volkova',
            maxStudents: 10,
            paymentType: 'PAID',
            facultyId: 'default',
            departmentId: 'default',
            schedule: 'Сб, Вс 10:00-12:00',
        },
    ];

    const students = [
        {
            id: 'student-ivan-sokolov',
            firstName: 'Иван',
            lastName: 'Соколов',
            email: 'ivan.sokolov@student.edu',
            phone: '+7 (999) 111-11-11',
            status: 'ACTIVE',
            groupIds: ['group-german-a1-morning'],
        },
        {
            id: 'student-maria-kuznetsova',
            firstName: 'Мария',
            lastName: 'Кузнецова',
            email: 'maria.kuznetsova@student.edu',
            phone: '+7 (999) 222-22-22',
            status: 'ACTIVE',
            groupIds: ['group-english-b1-evening'],
        },
        {
            id: 'student-alexey-morozov',
            firstName: 'Алексей',
            lastName: 'Морозов',
            email: 'alexey.morozov@student.edu',
            phone: '+7 (999) 333-33-33',
            status: 'ACTIVE',
            groupIds: ['group-french-a2-day'],
        },
        {
            id: 'student-olga-novikova',
            firstName: 'Ольга',
            lastName: 'Новикова',
            email: 'olga.novikova@student.edu',
            phone: '+7 (999) 444-44-44',
            status: 'ACTIVE',
            groupIds: ['group-spanish-b2-intensive'],
        },
        {
            id: 'student-dmitry-lebedev',
            firstName: 'Дмитрий',
            lastName: 'Лебедев',
            email: 'dmitry.lebedev@student.edu',
            phone: '+7 (999) 555-55-55',
            status: 'ACTIVE',
            groupIds: ['group-german-c1-advanced'],
        },
        {
            id: 'student-elena-popova',
            firstName: 'Елена',
            lastName: 'Попова',
            email: 'elena.popova@student.edu',
            phone: '+7 (999) 666-66-66',
            status: 'ACTIVE',
            groupIds: ['group-italian-a1-weekend'],
        },
        {
            id: 'student-sergey-volkov',
            firstName: 'Сергей',
            lastName: 'Волков',
            email: 'sergey.volkov@student.edu',
            phone: '+7 (999) 777-77-77',
            status: 'SUSPENDED',
            groupIds: ['group-german-a1-morning'],
        },
        {
            id: 'student-anna-fedorova',
            firstName: 'Анна',
            lastName: 'Федорова',
            email: 'anna.fedorova@student.edu',
            phone: '+7 (999) 888-88-88',
            status: 'ACTIVE',
            groupIds: ['group-english-b1-evening', 'group-french-a2-day'],
        },
        {
            id: 'student-pavel-orlov',
            firstName: 'Павел',
            lastName: 'Орлов',
            email: 'pavel.orlov@student.edu',
            phone: '+7 (999) 999-99-99',
            status: 'ACTIVE',
            groupIds: ['group-spanish-b2-intensive'],
        },
        {
            id: 'student-tatyana-egorova',
            firstName: 'Татьяна',
            lastName: 'Егорова',
            email: 'tatyana.egorova@student.edu',
            phone: '+7 (999) 101-01-01',
            status: 'PENDING',
            groupIds: [],
        },
        {
            id: 'student-nikolay-kozlov',
            firstName: 'Николай',
            lastName: 'Козлов',
            email: 'nikolay.kozlov@student.edu',
            phone: '+7 (999) 202-02-02',
            status: 'ACTIVE',
            groupIds: ['group-german-c1-advanced'],
        },
        {
            id: 'student-victoria-romanova',
            firstName: 'Виктория',
            lastName: 'Романова',
            email: 'victoria.romanova@student.edu',
            phone: '+7 (999) 303-03-03',
            status: 'ACTIVE',
            groupIds: ['group-italian-a1-weekend'],
        },
        {
            id: 'student-andrey-vasiliev',
            firstName: 'Андрей',
            lastName: 'Васильев',
            email: 'andrey.vasiliev@student.edu',
            phone: '+7 (999) 404-04-04',
            status: 'ACTIVE',
            groupIds: ['group-english-b1-evening'],
        },
        {
            id: 'student-yulia-mikhailova',
            firstName: 'Юлия',
            lastName: 'Михайлова',
            email: 'yulia.mikhailova@student.edu',
            phone: '+7 (999) 505-05-05',
            status: 'ACTIVE',
            groupIds: ['group-french-a2-day'],
        },
        {
            id: 'student-maxim-petrov',
            firstName: 'Максим',
            lastName: 'Петров',
            email: 'maxim.petrov@student.edu',
            phone: '+7 (999) 606-06-06',
            status: 'ACTIVE',
            groupIds: ['group-german-a1-morning'],
        },
    ];

    const seedData = async () => {
        if (!userData?.organizationId) {
            setResult(['❌ Ошибка: organizationId не найден']);
            return;
        }

        setLoading(true);
        setResult([]);
        const logs: string[] = [];

        try {
            logs.push('🌱 Начинаем добавление тестовых данных...');
            logs.push(`📍 Organization ID: ${userData.organizationId}\n`);
            setResult([...logs]);

            // Add teachers
            logs.push('👨‍🏫 Добавляем преподавателей...');
            setResult([...logs]);

            for (const teacher of teachers) {
                await setDoc(doc(db, 'users', teacher.id), {
                    ...teacher,
                    organizationId: userData.organizationId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                logs.push(`  ✓ ${teacher.firstName} ${teacher.lastName} (${teacher.specialization})`);
                setResult([...logs]);
            }

            logs.push(`\n✅ Добавлено ${teachers.length} преподавателей\n`);
            setResult([...logs]);

            // Add groups
            logs.push('👥 Добавляем группы...');
            setResult([...logs]);

            for (const group of groups) {
                await setDoc(doc(db, 'groups', group.id), {
                    ...group,
                    organizationId: userData.organizationId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                logs.push(`  ✓ ${group.name} (${group.code})`);
                setResult([...logs]);
            }

            logs.push(`\n✅ Добавлено ${groups.length} групп\n`);
            setResult([...logs]);

            // Add students
            logs.push('👨‍🎓 Добавляем студентов...');
            setResult([...logs]);

            for (const student of students) {
                await setDoc(doc(db, 'students', student.id), {
                    ...student,
                    organizationId: userData.organizationId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                logs.push(`  ✓ ${student.firstName} ${student.lastName} (${student.status})`);
                setResult([...logs]);
            }

            logs.push(`\n✅ Добавлено ${students.length} студентов\n`);
            logs.push('='.repeat(60));
            logs.push('🎉 Тестовые данные успешно добавлены!');
            logs.push('='.repeat(60));
            logs.push(`\n📊 Итого:`);
            logs.push(`  👨‍🏫 Преподавателей: ${teachers.length}`);
            logs.push(`  👥 Групп: ${groups.length}`);
            logs.push(`  👨‍🎓 Студентов: ${students.length}`);
            logs.push(`\n✨ Обновите страницу чтобы увидеть новые данные!`);
            setResult([...logs]);

        } catch (error: any) {
            logs.push(`\n❌ Ошибка: ${error.message}`);
            setResult([...logs]);
        } finally {
            setLoading(false);
        }
    };

    if (userData?.role !== 'owner') {
        return (
            <div className="p-8">
                <Card className="p-6">
                    <p className="text-destructive">❌ Доступ запрещен. Только владелец может добавлять тестовые данные.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-4">🌱 Добавить тестовые данные</h1>
                <p className="text-muted-foreground mb-6">
                    Это добавит 5 преподавателей, 6 групп и 15 студентов в вашу организацию для тестирования.
                </p>

                <Button
                    onClick={seedData}
                    disabled={loading}
                    className="mb-6"
                >
                    {loading ? 'Добавление...' : '🚀 Добавить данные'}
                </Button>

                {result.length > 0 && (
                    <div className="bg-secondary p-4 rounded-lg font-mono text-xs space-y-1">
                        {result.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
