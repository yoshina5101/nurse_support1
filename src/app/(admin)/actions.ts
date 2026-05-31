"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { setSetting, type SettingKey } from "@/lib/settings";

// ---- ユーザー管理 ----
export async function createStudent(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const plan = String(formData.get("plan") || "FREE") as "FREE" | "PREMIUM";

  if (!name || !email || password.length < 6) return;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "STUDENT", plan },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  // 管理者アカウントの誤削除を防止
  if (!target || target.role === "ADMIN") return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function toggleSuspend(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role === "ADMIN") return;
  await prisma.user.update({
    where: { id },
    data: { status: target.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
  });
  revalidatePath("/admin/users");
}

export async function togglePlan(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;
  await prisma.user.update({
    where: { id },
    data: { plan: target.plan === "FREE" ? "PREMIUM" : "FREE" },
  });
  revalidatePath("/admin/users");
}

// ---- 通報管理 ----
export async function resolveReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  await prisma.report.update({
    where: { id },
    data: {
      status: action === "dismiss" ? "DISMISSED" : "RESOLVED",
      resolvedAt: new Date(),
    },
  });
  revalidatePath("/admin/reports");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const messageId = String(formData.get("messageId") || "");
  const reportId = String(formData.get("reportId") || "");
  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true },
  });
  if (reportId) {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
  }
  revalidatePath("/admin/reports");
}

// ---- コンテンツ管理 ----
export async function createContent(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const category = String(formData.get("category") || "お役立ち").trim();
  const isPremium = formData.get("isPremium") === "on";
  if (!title || !body) return;
  await prisma.content.create({
    data: { title, body, category, isPremium },
  });
  revalidatePath("/admin/contents");
}

export async function toggleContentPremium(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const target = await prisma.content.findUnique({ where: { id } });
  if (!target) return;
  await prisma.content.update({
    where: { id },
    data: { isPremium: !target.isPremium },
  });
  revalidatePath("/admin/contents");
}

export async function deleteContent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.content.delete({ where: { id } });
  revalidatePath("/admin/contents");
}

// ---- 小論文お題管理 ----
export async function createEssayTheme(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim();
  const isPremium = formData.get("isPremium") === "on";
  if (!title || !prompt) return;
  await prisma.essayTheme.create({ data: { title, prompt, isPremium } });
  revalidatePath("/admin/essay-themes");
}

export async function updateEssayTheme(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim();
  const isPremium = formData.get("isPremium") === "on";
  if (!id || !title || !prompt) return;
  await prisma.essayTheme.update({
    where: { id },
    data: { title, prompt, isPremium },
  });
  revalidatePath("/admin/essay-themes");
}

export async function deleteEssayTheme(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.essayTheme.delete({ where: { id } });
  revalidatePath("/admin/essay-themes");
}

// ---- 面接質問管理 ----
export async function createInterviewQuestion(formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") || "").trim();
  const category = String(formData.get("category") || "一般").trim();
  const order = parseInt(String(formData.get("order") || "0"), 10) || 0;
  const isPremium = formData.get("isPremium") === "on";
  if (!text) return;
  await prisma.interviewQuestion.create({
    data: { text, category, order, isPremium },
  });
  revalidatePath("/admin/interview-questions");
}

export async function updateInterviewQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const text = String(formData.get("text") || "").trim();
  const category = String(formData.get("category") || "一般").trim();
  const order = parseInt(String(formData.get("order") || "0"), 10) || 0;
  const isPremium = formData.get("isPremium") === "on";
  if (!id || !text) return;
  await prisma.interviewQuestion.update({
    where: { id },
    data: { text, category, order, isPremium },
  });
  revalidatePath("/admin/interview-questions");
}

export async function deleteInterviewQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.interviewQuestion.delete({ where: { id } });
  revalidatePath("/admin/interview-questions");
}

// ---- アプリ設定（利用上限・価格） ----
export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const entries: [SettingKey, string][] = [
    ["freeDailyLimit", String(formData.get("freeDailyLimit") ?? "").trim()],
    [
      "premiumDailyLimit",
      String(formData.get("premiumDailyLimit") ?? "").trim(),
    ],
    ["premiumPriceJpy", String(formData.get("premiumPriceJpy") ?? "").trim()],
  ];
  for (const [key, value] of entries) {
    // 数値として妥当なものだけ保存（premiumDailyLimit は -1=無制限を許可）
    if (value === "") continue;
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) continue;
    if (key === "premiumDailyLimit") {
      if (n < -1) continue;
    } else if (n < 0) {
      continue;
    }
    await setSetting(key, String(n));
  }
  revalidatePath("/admin/settings");
}
