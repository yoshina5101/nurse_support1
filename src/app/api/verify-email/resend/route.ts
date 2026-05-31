import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { issueEmailVerification } from "@/app/(auth-actions)/authActions";

export async function POST() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (user.emailVerified) {
    return NextResponse.json({ alreadyVerified: true });
  }

  const result = await issueEmailVerification(user.id, user.email);
  // 開発モード（SMTP未設定）では devLink を返して画面表示できるようにする
  return NextResponse.json({ sent: result.sent, devLink: result.devLink });
}
