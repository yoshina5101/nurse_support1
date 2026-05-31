import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromAddress = process.env.MAIL_FROM || "no-reply@nurse-career.example";

// SMTPが設定されているときだけ実送信。未設定時はリンクをログに出すだけの
// フォールバック（開発・この環境ではメール送信できないため）。
const transporter =
  host && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

export const emailEnabled = Boolean(transporter);

type SendArgs = { to: string; subject: string; text: string };

// メールを送信する。SMTP未設定時は false を返し、呼び出し側でリンクを
// 画面に表示するなどのフォールバックができるようにする。
export async function sendMail({ to, subject, text }: SendArgs): Promise<boolean> {
  if (!transporter) {
    console.log(
      `\n[MAIL:fallback] SMTP未設定のため送信しません。\n  To: ${to}\n  件名: ${subject}\n  本文:\n${text}\n`
    );
    return false;
  }
  try {
    await transporter.sendMail({ from: fromAddress, to, subject, text });
    return true;
  } catch (err) {
    console.error("sendMail error:", err);
    return false;
  }
}
