
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import * as crypto from 'crypto';

const app = express();
const prisma = new PrismaClient();
const PORT = 4000;
const SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const requireRole = (allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.sendStatus(403);
        }
        next();
    }
}

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, orgId: user.organizationId }, SECRET, { expiresIn: '1h' });
    // In a real app, refresh token would be handled here
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role, inviteToken, birthDate } = req.body;

    // Check if user exists (skip if it's a randomized student email)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let orgId;
    // Allow OWNER, DIRECTOR, ADMIN to create new Org
    const isOwner = ['OWNER', 'DIRECTOR', 'ADMIN'].includes(role);

    if (isOwner) {
        const newOrg = await prisma.organization.create({
            data: {
                name: `${name}'s Organization`,
                type: 'Custom',
                currency: 'USD'
            }
        });
        orgId = newOrg.id;
    } else {
        // STRICT SECURITY: Students must have a valid invite
        if (!inviteToken) {
            return res.status(403).json({ error: 'Invite token required for students' });
        }

        const invite = await prisma.invite.findUnique({ where: { token: inviteToken } });

        if (!invite) {
            return res.status(400).json({ error: 'Invalid invite token' });
        }

        // Check limits
        if (invite.maxUses && invite.usageCount >= invite.maxUses) {
            return res.status(400).json({ error: 'Invite limit reached' });
        }

        if (new Date() > invite.expiresAt) {
            return res.status(400).json({ error: 'Invite token expired' });
        }

        orgId = invite.organizationId;

        // Increment usage
        await prisma.invite.update({
            where: { id: invite.id },
            data: { usageCount: { increment: 1 } }
        });

        // If invite has group, auto-join?
        // Note: We'll do it after user creation.
    }

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
            organizationId: orgId,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            managed: !isOwner // If student registering via invite, they are "managed"? 
            // Actually, if they register with email/pass, they are standard users.
            // But we auto-generated credentials for them in frontend.
            // Let's assume they are managed if they used an inviteToken? 
            // Or just 'managed' field is for QR users?
            // Let's keep managed=false for now unless explicitly set.
        }
    });

    // Auto-join group if invite had one
    if (!isOwner && inviteToken) {
        const invite = await prisma.invite.findUnique({ where: { token: inviteToken } });
        if (invite && invite.groupId) {
            await prisma.groupMembership.create({
                data: {
                    userId: user.id,
                    groupId: invite.groupId,
                    status: 'PENDING'
                }
            });
        }
    }

    const token = jwt.sign({ id: user.id, role: user.role, orgId: user.organizationId }, SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

// --- INVITE ROUTES ---
// --- QR SCAN ROUTE ---
app.post('/api/students/scan', authenticateToken, requireRole(['TEACHER', 'OWNER', 'ADMIN']), async (req, res) => {
    const { qrData, groupId } = req.body;
    // @ts-ignore
    const orgId = req.user.orgId;

    try {
        const studentData = JSON.parse(qrData);
        if (studentData.type !== 'STUDENT_QR') {
            return res.status(400).json({ error: 'Invalid QR code type' });
        }

        // Create managed user
        const uuid = crypto.randomUUID();
        const email = `student_${uuid.substring(0, 8)}@school.local`;
        const password = await bcrypt.hash(uuid, 10);

        // Parse birthDate from string (expected YYYY-MM-DD) or fallback
        const birthDate = new Date(studentData.birthDate);

        const user = await prisma.user.create({
            data: {
                name: `${studentData.firstName} ${studentData.lastName}`,
                email,
                password,
                role: 'STUDENT',
                organizationId: orgId,
                birthDate: birthDate,
                managed: true
            }
        });

        // Add to group if provided
        if (groupId) {
            await prisma.groupMembership.create({
                data: {
                    userId: user.id,
                    groupId,
                    status: 'PENDING'
                }
            });
        }

        res.json({ success: true, user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to process student QR' });
    }
});

// --- INVITE ROUTES (UPDATED) ---

// Create Group Invite (Teacher)
app.post('/api/groups/:groupId/invites', authenticateToken, requireRole(['TEACHER', 'OWNER', 'ADMIN']), async (req, res) => {
    const { groupId } = req.params;
    const { expiresInMinutes, maxUses } = req.body;
    // @ts-ignore
    const orgId = req.user.orgId;

    const token = crypto.randomUUID().substring(0, 8).toUpperCase(); // Short code
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (expiresInMinutes || 60)); // Default 1h

    const invite = await prisma.invite.create({
        data: {
            token,
            organizationId: orgId,
            groupId,
            role: 'STUDENT',
            expiresAt,
            maxUses: maxUses || null
        }
    });

    res.json(invite);
});

// Join by Invite (Student)
app.post('/api/invites/join', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
    const { code } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    try {
        const invite = await prisma.invite.findUnique({ where: { token: code } });

        if (!invite) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        if (new Date() > invite.expiresAt) {
            return res.status(400).json({ error: 'Invite expired' });
        }

        if (invite.maxUses && invite.usageCount >= invite.maxUses) {
            return res.status(400).json({ error: 'Invite limit reached' });
        }

        if (!invite.groupId) {
            return res.status(400).json({ error: 'Invalid group invite' });
        }

        // Check if already member
        const existing = await prisma.groupMembership.findUnique({
            where: { userId_groupId: { userId, groupId: invite.groupId } }
        });

        if (!existing) {
            await prisma.groupMembership.create({
                data: {
                    userId,
                    groupId: invite.groupId,
                    status: 'PENDING'
                }
            });
        }

        // Increment usage
        await prisma.invite.update({
            where: { id: invite.id },
            data: { usageCount: { increment: 1 } }
        });

        res.json({ success: true, groupId: invite.groupId });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to join group' });
    }
});

// --- USER ROUTES ---
app.get('/api/users', authenticateToken, async (req, res) => {
    // @ts-ignore
    const orgId = req.user.orgId;
    const users = await prisma.user.findMany({ where: { organizationId: orgId } });
    res.json(users);
});

// --- DASHBOARD ROUTES ---
app.get('/api/dashboard/stats', authenticateToken, requireRole(['OWNER', 'ADMIN']), async (req, res) => {
    // @ts-ignore
    const orgId = req.user.orgId;

    const totalStudents = await prisma.user.count({ where: { organizationId: orgId, role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { organizationId: orgId, role: 'TEACHER' } });
    const activeGroups = await prisma.group.count({ where: { organizationId: orgId } });

    // Fetch organization type
    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { type: true } });

    res.json({
        totalStudents,
        totalTeachers,
        activeGroups,
        orgType: org?.type || 'LanguageSchool'
    });
});

app.post('/api/org/type', authenticateToken, requireRole(['OWNER']), async (req, res) => {
    const { type } = req.body;
    // @ts-ignore
    const orgId = req.user.orgId;

    try {
        const updatedOrg = await prisma.organization.update({
            where: { id: orgId },
            data: { type }
        });
        res.json(updatedOrg);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update organization type' });
    }
});


// --- GROUP ROUTES ---

// Create Group
app.post('/api/groups', authenticateToken, requireRole(['OWNER', 'ADMIN', 'TEACHER']), async (req, res) => {
    const { name, schedule } = req.body;
    // @ts-ignore
    const orgId = req.user.orgId;
    // @ts-ignore
    const userId = (req as any).user.id; // Teacher ID if Teacher

    const group = await prisma.group.create({
        data: {
            name,
            schedule,
            organizationId: orgId,
            teacherId: (req as any).user.role === 'TEACHER' ? userId : undefined
        }
    });
    res.json(group);
});

// Join Group (Student)
app.post('/api/groups/join', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
    const { groupCode } = req.body; // Assuming Group ID is the code for now, or we implement a code system.
    // In this prototype, we'll accept groupId directly or a code. 
    // Let's assume the QR code sends the groupId.
    const { groupId } = req.body;
    // @ts-ignore
    const userId = req.user.id;

    // Check if membership exists
    const existing = await prisma.groupMembership.findUnique({
        where: { userId_groupId: { userId, groupId } }
    });

    if (existing) {
        return res.json(existing); // Already joined (pending or active)
    }

    const membership = await prisma.groupMembership.create({
        data: {
            userId,
            groupId,
            status: 'PENDING'
        }
    });

    res.json(membership);
});


// Get Teacher Groups
app.get('/api/teacher/groups', authenticateToken, requireRole(['TEACHER', 'OWNER', 'ADMIN']), async (req, res) => {
    // @ts-ignore
    const userId = req.user.id;
    // @ts-ignore
    const role = req.user.role;

    let groups;
    if (role === 'ADMIN' || role === 'OWNER') {
        // Admin sees all groups in org
        // @ts-ignore
        const orgId = req.user.orgId;
        groups = await prisma.group.findMany({ where: { organizationId: orgId } });
    } else {
        // Teacher sees only their groups
        groups = await prisma.group.findMany({ where: { teacherId: userId } });
    }
    res.json(groups);
});

// Get Group Members (Teacher)
app.get('/api/groups/:groupId/members', authenticateToken, requireRole(['OWNER', 'ADMIN', 'TEACHER']), async (req, res) => {
    const { groupId } = req.params;
    const members = await prisma.groupMembership.findMany({
        where: { groupId },
        include: { user: { select: { id: true, name: true, email: true } } }
    });
    // Flatten result
    const result = members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        status: m.status,
        joinedAt: m.joinedAt
    }));
    res.json(result);
});

// Moderate Member (Teacher)
app.patch('/api/groups/:groupId/members/:userId', authenticateToken, requireRole(['OWNER', 'ADMIN', 'TEACHER']), async (req, res) => {
    const { groupId, userId } = req.params;
    const { status } = req.body; // "ACTIVE", "SUSPENDED"

    const updated = await prisma.groupMembership.update({
        where: { userId_groupId: { userId, groupId } },
        data: { status }
    });
    res.json(updated);
});

// Remove Member (Teacher)
app.delete('/api/groups/:groupId/members/:userId', authenticateToken, requireRole(['OWNER', 'ADMIN', 'TEACHER']), async (req, res) => {
    const { groupId, userId } = req.params;
    await prisma.groupMembership.delete({
        where: { userId_groupId: { userId, groupId } }
    });
    res.sendStatus(200);
});

// Get Student Groups (Student View)
app.get('/api/student/groups', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
    // @ts-ignore
    const userId = req.user.id;
    const memberships = await prisma.groupMembership.findMany({
        where: { userId },
        include: { group: true }
    });

    // Return groups with status
    const result = memberships.map(m => ({
        ...m.group,
        myStatus: m.status
    }));
    res.json(result);
});



// --- ROOT ---
app.get('/', (req, res) => {
    res.send('EduFlow API is running');
});

app.listen(PORT, () => {
    // Server started - logging disabled for production
});
