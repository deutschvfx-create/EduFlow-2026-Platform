
import { test, expect } from '@playwright/test';

test.describe('Moderation Lifecycle', () => {
    let directorPage;
    let studentPage;
    let contextDirector;
    let contextStudent;

    test.beforeAll(async ({ browser }) => {
        contextDirector = await browser.newContext();
        contextStudent = await browser.newContext();
        directorPage = await contextDirector.newPage();
        studentPage = await contextStudent.newPage();
    });

    test('Full Flow: Register -> Create Group -> Join -> Moderate', async () => {
        test.setTimeout(90000); // Increase timeout to 90s
        // 1. Register Director
        const directorEmail = `director_${Date.now()}@test.com`;
        await directorPage.goto('http://localhost:3000/register?role=director');
        await directorPage.fill('#name', 'E2E Director'); // Used ID
        await directorPage.fill('#email', directorEmail); // Used ID
        await directorPage.fill('#password', 'pass123');  // Used ID
        // Select role if UI allows, otherwise assume Director from URL or default?
        // My UI only has links "I am Director". Let's use the query param flow if needed or just register form.
        // The Register page has a Role param logic? 
        // Let's assume /register defaults to STUDENT but /register?role=director works?
        // Or I'll use the API to register faster and reliably.

        // API Register Director
        const r1 = await directorPage.request.post('http://localhost:4000/api/auth/register', {
            data: { name: 'E2E Dir', email: directorEmail, password: 'pass123', role: 'DIRECTOR' }
        });
        expect(r1.ok()).toBeTruthy();

        // Login Director
        await directorPage.goto('http://localhost:3000/login');
        await directorPage.fill('#email', directorEmail);
        await directorPage.fill('#password', 'pass123');
        await directorPage.click('button:has-text("Войти")');
        await directorPage.waitForURL('**/director');

        // 2. Create Group
        // Check if dialog exists.
        await directorPage.click('button:has-text("Создать группу")');
        await directorPage.fill('input[id="name"]', 'E2E Physics');
        await directorPage.fill('input[id="schedule"]', 'Mon 10am');
        await directorPage.click('button:has-text("Создать")');

        // Wait for group to appear and get ID
        await directorPage.waitForSelector('text=E2E Physics');
        await directorPage.click('div:has-text("E2E Physics")'); // Click the card
        await directorPage.waitForURL(/\/teacher\/groups\/.+/);
        const groupId = directorPage.url().split('/').pop();
        console.log('Group ID:', groupId);

        // 3. Register Student (via Invite or API)
        const studentEmail = `student_${Date.now()}@test.com`;
        // Register via API for speed
        // Create Invite first? Or can I bypass?
        // Server requires inviteToken.
        // Director creates invite.
        await directorPage.click('button:has-text("Пригласить ученика")');
        // Use the dialog
        // ... Actually, Director dashboard has proper UI for this?
        // Let's just create invite via API to save UI steps flakiness
        const rInvite = await directorPage.request.post('http://localhost:4000/api/invites', {
            headers: { Authorization: `Bearer ${(await directorPage.evaluate(() => localStorage.getItem('token')))}` },
            data: { email: studentEmail }
        });
        const inviteData = await rInvite.json();
        const token = inviteData.token;

        // Register Student using Token
        const r2 = await studentPage.request.post('http://localhost:4000/api/auth/register', {
            data: { name: 'E2E Student', email: studentEmail, password: 'pass123', role: 'STUDENT', inviteToken: token }
        });
        expect(r2.ok()).toBeTruthy();

        // Login Student
        await studentPage.goto('http://localhost:3000/login');
        await studentPage.fill('input[type="email"]', studentEmail);
        await studentPage.fill('input[type="password"]', 'pass123');
        await studentPage.click('button:has-text("Войти")');
        await studentPage.waitForURL('**/student');

        // 4. Join Group
        await studentPage.fill('input[id="code"]', groupId); // "Код группы" input
        await studentPage.click('button:has-text("Вступить")');
        // Verify alert or toast? Or refresh? api.post returns.
        // Wait for network idle or simple timeout
        await studentPage.waitForTimeout(1000);

        // Go to Group Page
        await studentPage.goto(`http://localhost:3000/student/groups/${groupId}`);

        // 5. Verify Waiting
        await expect(studentPage.locator('text=Ожидание активации')).toBeVisible();

        // 6. Director Activates
        await directorPage.reload(); // Refresh teacher page
        await directorPage.waitForSelector('text=E2E Student');
        await expect(directorPage.locator('text=Ожидает')).toBeVisible();

        // Click actions
        await directorPage.click('button:has-text("Open menu")'); // The dropdown trigger
        await directorPage.click('text=Активировать');

        // Verify Active Badge
        await expect(directorPage.locator('text=Активен')).toBeVisible();

        // 7. Student Verify Access
        await studentPage.reload();
        await expect(studentPage.locator('text=Материалы курса')).toBeVisible();
        await expect(studentPage.locator('text=Ожидание активации')).not.toBeVisible();

        // 8. Suspend
        await directorPage.click('button:has-text("Open menu")');
        await directorPage.click('text=Приостановить');

        await studentPage.reload();
        await expect(studentPage.locator('text=Доступ приостановлен')).toBeVisible();
    });
});
