
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Hash password
    const password = await bcrypt.hash('Demo12345!', 10)

    // 1. Create Organization
    const org = await prisma.organization.create({
        data: {
            name: 'Global Language Academy',
            type: 'LanguageSchool',
            country: 'USA',
            currency: 'USD'
        }
    })

    // 2. Create Owner
    const owner = await prisma.user.create({
        data: {
            email: 'owner@demo.com',
            name: 'Alice Owner',
            password,
            role: 'OWNER',
            organizationId: org.id
        }
    })

    // 3. Create Teachers
    const teacher1 = await prisma.user.create({
        data: {
            email: 'teacher1@demo.com',
            name: 'John Teacher',
            password,
            role: 'TEACHER',
            organizationId: org.id
        }
    })

    const teacher2 = await prisma.user.create({
        data: {
            email: 'teacher2@demo.com',
            name: 'Sarah Teacher',
            password,
            role: 'TEACHER',
            organizationId: org.id
        }
    })

    // 4. Create Groups
    const groupA1 = await prisma.group.create({
        data: {
            name: 'English A1 - Morning',
            organizationId: org.id,
            teacherId: teacher1.id,
            schedule: 'Mon, Wed 09:00'
        }
    })

    const groupB2 = await prisma.group.create({
        data: {
            name: 'English B2 - Standard',
            organizationId: org.id,
            teacherId: teacher2.id,
            schedule: 'Tue, Thu 18:00'
        }
    })

    // 5. Create Students
    const studentsUserData = []
    for (let i = 1; i <= 20; i++) {
        studentsUserData.push({
            email: `student${i}@demo.com`,
            name: `Student ${i}`,
            password,
            role: 'STUDENT',
            organizationId: org.id
        })
    }

    // Bulk create students isn't supported for relations easily in one go with creating Groups relation
    // So we create them and then link them
    for (const s of studentsUserData) {
        const student = await prisma.user.create({ data: s })

        // Add to groups randomly
        if (Math.random() > 0.5) {
            await prisma.user.update({
                where: { id: student.id },
                data: { studentGroups: { connect: { id: groupA1.id } } }
            })
        } else {
            await prisma.user.update({
                where: { id: student.id },
                data: { studentGroups: { connect: { id: groupB2.id } } }
            })
        }

        // Create Payment
        await prisma.payment.create({
            data: {
                amount: 99.00,
                currency: 'USD',
                status: Math.random() > 0.2 ? 'PAID' : 'OVERDUE',
                dueDate: new Date(),
                userId: student.id
            }
        })

        // Create Attendance (Sample)
        await prisma.attendance.create({
            data: {
                date: new Date(),
                status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
                userId: student.id,
                groupId: Math.random() > 0.5 ? groupA1.id : groupB2.id
            }
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
