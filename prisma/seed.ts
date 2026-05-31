import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // 管理者（教育担当者・プリセプター）
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: password,
      name: "教育担当 花子",
      role: "ADMIN",
      plan: "PREMIUM",
    },
  });

  // 学生（新卒看護師）
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      passwordHash: password,
      name: "看護 太郎",
      role: "STUDENT",
      plan: "FREE",
    },
  });

  const premiumStudent = await prisma.user.upsert({
    where: { email: "premium@example.com" },
    update: {},
    create: {
      email: "premium@example.com",
      passwordHash: password,
      name: "看護 さくら",
      role: "STUDENT",
      plan: "PREMIUM",
    },
  });

  // チャットルーム
  const generalRoom = await prisma.chatRoom.upsert({
    where: { id: "room-general" },
    update: {},
    create: {
      id: "room-general",
      name: "就活なんでも相談",
      description: "就職活動の悩みや情報を自由に共有しましょう。",
      isPremium: false,
    },
  });

  await prisma.chatRoom.upsert({
    where: { id: "room-premium" },
    update: {},
    create: {
      id: "room-premium",
      name: "【有料】個別キャリア相談",
      description: "プレミアム会員限定の少人数相談ルームです。",
      isPremium: true,
    },
  });

  // 初期メッセージ
  const existingMessages = await prisma.chatMessage.count({
    where: { roomId: generalRoom.id },
  });
  if (existingMessages === 0) {
    await prisma.chatMessage.createMany({
      data: [
        {
          roomId: generalRoom.id,
          userId: student.id,
          body: "急性期と慢性期、最初の配属はどちらがおすすめですか？",
        },
        {
          roomId: generalRoom.id,
          userId: premiumStudent.id,
          body: "私は自分の興味で選びました！見学に行くと雰囲気が分かりますよ。",
        },
      ],
    });
  }

  // 小論文お題
  const themeCount = await prisma.essayTheme.count();
  if (themeCount === 0) {
    await prisma.essayTheme.createMany({
      data: [
        {
          title: "理想の看護師像",
          prompt:
            "あなたが目指す理想の看護師像について、これまでの経験を踏まえて800字程度で述べなさい。",
          isPremium: false,
        },
        {
          title: "チーム医療における看護師の役割",
          prompt:
            "チーム医療において看護師が果たすべき役割について、あなたの考えを800字程度で述べなさい。",
          isPremium: false,
        },
        {
          title: "【有料】高齢化社会と地域医療",
          prompt:
            "高齢化社会が進む中で、地域医療に求められる看護のあり方についてあなたの考えを1000字程度で述べなさい。",
          isPremium: true,
        },
      ],
    });
  }

  // 面接質問
  const interviewCount = await prisma.interviewQuestion.count();
  if (interviewCount === 0) {
    await prisma.interviewQuestion.createMany({
      data: [
        {
          text: "当院を志望した理由を教えてください。",
          category: "志望動機",
          isPremium: false,
          order: 1,
        },
        {
          text: "看護師を目指したきっかけは何ですか？",
          category: "自己理解",
          isPremium: false,
          order: 2,
        },
        {
          text: "学生時代に最も力を入れたことを教えてください。",
          category: "経験",
          isPremium: false,
          order: 3,
        },
        {
          text: "あなたの長所と短所を教えてください。",
          category: "自己理解",
          isPremium: false,
          order: 4,
        },
        {
          text: "どのような看護師になりたいですか？",
          category: "看護観",
          isPremium: false,
          order: 5,
        },
        {
          text: "これまでで最も困難だった経験と、それをどう乗り越えたか教えてください。",
          category: "深掘り",
          isPremium: true,
          order: 6,
        },
      ],
    });
  }

  // コンテンツ
  const contentCount = await prisma.content.count();
  if (contentCount === 0) {
    await prisma.content.createMany({
      data: [
        {
          title: "看護師就活のはじめかた",
          body: "就職活動はまず自己分析から。自分が大切にしたい価値観を整理しましょう。本記事では年間スケジュールの全体像を解説します。",
          category: "基礎",
          isPremium: false,
        },
        {
          title: "病院見学で見るべき5つのポイント",
          body: "教育体制、夜勤体制、離職率、プリセプター制度、雰囲気。見学時にチェックすべき観点をまとめました。",
          category: "病院選び",
          isPremium: false,
        },
        {
          title: "【有料】面接でよく聞かれる質問100選と回答例",
          body: "頻出質問と模範回答、NG回答例を網羅。プレミアム会員限定の特別コンテンツです。",
          category: "面接対策",
          isPremium: true,
        },
      ],
    });
  }

  // アプリ設定（利用上限・価格）のデフォルト
  const settingsDefaults: { key: string; value: string }[] = [
    { key: "freeDailyLimit", value: "3" },
    { key: "premiumDailyLimit", value: "30" },
    { key: "premiumPriceJpy", value: "980" },
    { key: "sixMonthPriceJpy", value: "4980" },
  ];
  for (const s of settingsDefaults) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("Seed completed:", {
    admin: admin.email,
    student: student.email,
    premiumStudent: premiumStudent.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
