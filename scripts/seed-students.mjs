import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function seedStudents() {
    console.log('🌱 Начинаем добавление студентов...\n');

    const organizationId = process.env.NEXT_PUBLIC_ORGANIZATION_ID || 'default-org';
    console.log(`📍 Organization ID: ${organizationId}\n`);

    let count = 0;
    for (const student of students) {
        try {
            await setDoc(doc(db, 'students', student.id), {
                ...student,
                organizationId: organizationId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            console.log(`✓ ${student.firstName} ${student.lastName} (${student.status})`);
            count++;
        } catch (error) {
            console.error(`✗ Ошибка при добавлении ${student.firstName}:`, error.message);
        }
    }

    console.log(`\n✅ Добавлено ${count} из ${students.length} студентов`);
    console.log('🎉 Готово! Обнови страницу студентов.\n');
    process.exit(0);
}

seedStudents().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
});
