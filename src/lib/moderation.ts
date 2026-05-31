// チャットの誹謗中傷・不適切ワードの簡易フィルタ。
// 完全な検閲ではなく、明らかな暴言・侮蔑語を投稿前にブロックするための最低限のリスト。
// 必要に応じて語を追加してください。
const BANNED_WORDS = [
  "死ね",
  "しね",
  "殺す",
  "ころす",
  "馬鹿",
  "ばか",
  "バカ",
  "アホ",
  "あほ",
  "クズ",
  "くず",
  "ブス",
  "デブ",
  "キモい",
  "きもい",
  "うざい",
  "ウザい",
  "消えろ",
  "黙れ",
  "だまれ",
  "無能",
  "カス",
  "ゴミ",
];

export type ModerationResult = {
  ok: boolean;
  matched: string[];
};

// 投稿本文に禁止ワードが含まれるか判定する。
export function checkMessage(body: string): ModerationResult {
  const normalized = body.normalize("NFKC");
  const matched = BANNED_WORDS.filter((w) => normalized.includes(w));
  return { ok: matched.length === 0, matched };
}
