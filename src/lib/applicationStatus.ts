import type { ApplicationStatus } from "@prisma/client";

// 選考ステータスの表示ラベルと色。
export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; badge: string }
> = {
  INTERESTED: { label: "気になる", badge: "bg-gray-100 text-gray-600" },
  APPLIED: { label: "応募済み", badge: "bg-blue-100 text-blue-700" },
  SCREENING: { label: "書類選考中", badge: "bg-indigo-100 text-indigo-700" },
  INTERVIEW: { label: "面接", badge: "bg-amber-100 text-amber-700" },
  OFFER: { label: "内定", badge: "bg-brand-100 text-brand-700" },
  REJECTED: { label: "不採用", badge: "bg-red-100 text-red-600" },
  DECLINED: { label: "辞退", badge: "bg-gray-100 text-gray-500" },
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "INTERESTED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "DECLINED",
];
