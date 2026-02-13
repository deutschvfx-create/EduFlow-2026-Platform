const { Resend } = require('resend');
const path = require('path');

// Node 20.6+ supports --env-file

async function testEmail() {
    const key = process.env.RESEND_API_KEY;
    console.log('--- Resend Email Test ---');
    console.log('API Key Prefix:', key ? key.substring(0, 7) + '...' : 'MISSING');

    if (!key) {
        console.error('❌ Error: RESEND_API_KEY is not defined in .env.local');
        return;
    }

    const resend = new Resend(key);
    const to = 'test-recipient@example.com'; // User should change this to their personal email for sandbox testing
    const from = 'Uni Prime <postmaster@unipri.me>';

    console.log(`Attempting to send test email to: ${to}`);
    console.log(`From address: ${from}`);

    try {
        const { data, error } = await resend.emails.send({
            from: from,
            to: [to],
            subject: 'Uni Prime - Test Email',
            html: '<h1>Test Email</h1><p>If you see this, Resend is working correctly.</p>'
        });

        if (error) {
            console.error('❌ Resend API Error:', JSON.stringify(error, null, 2));
            if (error.message.includes('can only send testing emails to your own email address')) {
                console.log('ℹ️ Tip: You are in Resend Sandbox mode. Change the "to" address to your verified Resend email.');
            }
        } else {
            console.log('✅ Email sent successfully!');
            console.log('Resend Response Data:', data);
        }
    } catch (e) {
        console.error('❌ Critical Failure:', e.message || e);
    }
}

testEmail();
