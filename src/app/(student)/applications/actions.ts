"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ApplicationStatus } from "@prisma/client";

const STATUSES: ApplicationStatus[] = [
  "INTERESTED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "DECLINED",
];

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = String(v || "").trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// 自分の応募先であることを確認するヘルパー。
async function assertOwner(applicationId: string, userId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true },
  });
  return app?.userId === userId;
}

export async function createApplication(formData: FormData) {
  const user = await requireUser();
  const hospitalName = String(formData.get("hospitalName") || "").trim();
  if (!hospitalName) return;
  const department = String(formData.get("department") || "").trim();
  const statusRaw = String(formData.get("status") || "INTERESTED");
  const status = STATUSES.includes(statusRaw as ApplicationStatus)
    ? (statusRaw as ApplicationStatus)
    : "INTERESTED";

  await prisma.application.create({
    data: {
      userId: user.id,
      hospitalName,
      department,
      status,
      memo: String(formData.get("memo") || "").trim(),
      visitDate: parseDate(formData.get("visitDate")),
      deadline: parseDate(formData.get("deadline")),
      examDate: parseDate(formData.get("examDate")),
    },
  });
  revalidatePath("/applications");
}

export async function updateApplication(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id || !(await assertOwner(id, user.id))) return;

  const hospitalName = String(formData.get("hospitalName") || "").trim();
  const statusRaw = String(formData.get("status") || "INTERESTED");
  const status = STATUSES.includes(statusRaw as ApplicationStatus)
    ? (statusRaw as ApplicationStatus)
    : "INTERESTED";

  await prisma.application.update({
    where: { id },
    data: {
      ...(hospitalName ? { hospitalName } : {}),
      department: String(formData.get("department") || "").trim(),
      status,
      memo: String(formData.get("memo") || "").trim(),
      visitDate: parseDate(formData.get("visitDate")),
      deadline: parseDate(formData.get("deadline")),
      examDate: parseDate(formData.get("examDate")),
    },
  });
  revalidatePath("/applications");
}

// 一覧から手早くステータスだけ変更する。
export async function setApplicationStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const statusRaw = String(formData.get("status") || "");
  if (!id || !STATUSES.includes(statusRaw as ApplicationStatus)) return;
  if (!(await assertOwner(id, user.id))) return;
  await prisma.application.update({
    where: { id },
    data: { status: statusRaw as ApplicationStatus },
  });
  revalidatePath("/applications");
}

export async function deleteApplication(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id || !(await assertOwner(id, user.id))) return;
  await prisma.application.delete({ where: { id } });
  revalidatePath("/applications");
}

// ---- タスク（提出物・準備TODO） ----
export async function createTask(formData: FormData) {
  const user = await requireUser();
  const applicationId = String(formData.get("applicationId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!applicationId || !title) return;
  if (!(await assertOwner(applicationId, user.id))) return;
  await prisma.applicationTask.create({
    data: { applicationId, title, dueDate: parseDate(formData.get("dueDate")) },
  });
  revalidatePath("/applications");
}

export async function toggleTask(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const task = await prisma.applicationTask.findUnique({
    where: { id },
    include: { application: { select: { userId: true } } },
  });
  if (!task || task.application.userId !== user.id) return;
  await prisma.applicationTask.update({
    where: { id },
    data: { done: !task.done },
  });
  revalidatePath("/applications");
}

export async function deleteTask(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const task = await prisma.applicationTask.findUnique({
    where: { id },
    include: { application: { select: { userId: true } } },
  });
  if (!task || task.application.userId !== user.id) return;
  await prisma.applicationTask.delete({ where: { id } });
  revalidatePath("/applications");
}
