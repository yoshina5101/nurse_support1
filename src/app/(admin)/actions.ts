"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

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
