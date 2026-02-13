"use server";

import { Resend } from 'resend';

const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY in environment variables");
    return new Resend(key);
};

export async function sendVerificationCodeAction(to: string, code: string, orgName: string) {
    const key = process.env.RESEND_API_KEY;
    console.log(`📧 [EmailAction] Attempting to send verification code to ${to} for ${orgName}`);
    console.log(`🔑 [EmailAction] API Key Prefix: ${key ? key.substring(0, 7) + "..." : "MISSING"}`);

    try {
        const resend = getResend();
        // Use verified unipri.me domain instead of resend.dev sandbox
        const fromEmail = "Uni Prime <postmaster@unipri.me>";

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject: `Ваш код подтверждения — Uni Prime`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Добро пожаловать в Uni Prime</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
                        Пожалуйста, подтвердите вашу электронную почту, чтобы завершить регистрацию в системе.
                    </p>
                    <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 900; letter-spacing: 0.2em; color: #0f172a;">${code}</span>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">
                        Введите этот код в окне подтверждения на сайте. 
                        Код действителен в течение 10 минут.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        Если вы не регистрировались в системе Uni Prime, просто проигнорируйте это письмо.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("❌ [EmailAction] Resend API Error:", JSON.stringify(error, null, 2));
            if (error.message.includes("can only send testing emails to your own email address")) {
                throw new Error("RESEND_SANDBOX_LIMIT");
            }
            throw new Error(error.message);
        }

        console.log("✅ [EmailAction] Verification email sent successfully:", data?.id);
        return data;
    } catch (e: any) {
        console.error("❌ [EmailAction] Critical Failure:", e.message || e);
        throw e;
    }
}

export async function sendWelcomeEmailAction(to: string, password: string, name: string) {
    try {
        const resend = getResend();
        const fromEmail = "Uni Prime <postmaster@unipri.me>";

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject: `Добро пожаловать в Uni Prime! Ваша регистрация завершена`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #0f3d4c; margin: 0;">Uni Prime</h1>
                        <p style="color: #64748b; font-size: 14px;">Будущее образования начинается здесь</p>
                    </div>
                    
                    <h2 style="color: #0f172a;">Здравствуйте, ${name}!</h2>
                    <p style="color: #475569; line-height: 1.6;">
                        Поздравляем! Ваш аккаунт успешно создан. Теперь у вас есть доступ ко всем возможностям нашей образовательной платформы.
                    </p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0;">
                        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Ваши данные для входа:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 80px;">Email:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${to}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Пароль:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${password}</td>
                            </tr>
                        </table>
                        <p style="color: #ef4444; font-size: 12px; margin-top: 12px;">* Пожалуйста, сохраните эти данные и не передавайте их третьим лицам.</p>
                    </div>
 
                    <h3 style="color: #0f172a;">Как зайти с нового устройства:</h3>
                    <ol style="color: #475569; line-height: 1.6; padding-left: 20px;">
                        <li>Откройте приложение или сайт на новом телефоне.</li>
                        <li>Нажмите кнопку <b>"Войти"</b>.</li>
                        <li>Введите ваш Email и пароль, указанные выше.</li>
                    </ol>
 
                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://unipri.me" style="background-color: #0f3d4c; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Перейти в личный кабинет
                        </a>
                    </div>
 
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        Это автоматическое уведомление. Пожалуйста, не отвечайте на него.
                    </p>
                </div>
            `,
        });

        if (error) throw new Error(error.message);
        return data;
    } catch (e) {
        console.error("Failed to send welcome email:", e);
        throw e;
    }
}
