// チャットの誹謗中傷・不適切ワードのフィルタ。
// 完全な検閲ではなく、明らかな暴言・侮蔑語を投稿前にブロックするための仕組み。
// 表記ゆれ（全角/半角・カタカナ/ひらがな）や伏字（記号・空白・繰り返し挿入）に
// ある程度耐えられるよう、正規化してから判定する。

// 基本となる禁止ワード。正規化（後述）で全角/半角・カタカナ→ひらがな・伏字記号の
// 除去を行ったうえで照合する。漢字はかなへ変換できないため、漢字表記は別途列挙する。
// 必要に応じて語を追加してください。
const BANNED_WORDS = [
  // しね 系
  "しね",
  "死ね",
  "市ね",
  // ころす 系
  "ころす",
  "ころして",
  "殺す",
  "殺して",
  // ばか 系
  "ばか",
  "馬鹿",
  // あほ 系
  "あほ",
  "阿呆",
  // くず 系
  "くず",
  "屑",
  // 容姿中傷
  "ぶす",
  "でぶ",
  "ぶさいく",
  "不細工",
  // きもい/きしょい 系
  "きもい",
  "きしょい",
  "気持ち悪い",
  // うざい 系
  "うざい",
  "うっとうしい",
  // きえろ 系
  "きえろ",
  "消えろ",
  // だまれ 系
  "だまれ",
  "黙れ",
  // むのう 系
  "むのう",
  "無能",
  // その他侮蔑
  "かす",
  "ごみ",
  "ゴミ",
  "ぼけ",
  "のろま",
  "きちがい",
  "気違い",
  "やくたたず",
  "役立たず",
  "うんこ",
  "くそ",
  "糞",
];

export type ModerationResult = {
  ok: boolean;
  matched: string[];
};

// カタカナ→ひらがな変換
function katakanaToHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 伏字・表記ゆれに強くするための正規化。
// 1) NFKC（全角→半角、半角カナ→全角カナ など）
// 2) カタカナ→ひらがな
// 3) 小書き文字を通常文字へ（ｧ→あ 等の揺れ吸収。し→ぃ等の伏字対策）
// 4) 長音・繰り返し記号や、語の間に挟まれた記号・空白・伏字記号を除去
function normalize(input: string): string {
  let s = input.normalize("NFKC").toLowerCase();
  s = katakanaToHiragana(s);

  // 小書きかな → 通常かな（伏字や表記ゆれの吸収）
  const smallMap: Record<string, string> = {
    ぁ: "あ",
    ぃ: "い",
    ぅ: "う",
    ぇ: "え",
    ぉ: "お",
    っ: "つ",
    ゃ: "や",
    ゅ: "ゆ",
    ょ: "よ",
    ゎ: "わ",
  };
  s = s.replace(/[ぁぃぅぇぉっゃゅょゎ]/g, (ch) => smallMap[ch] ?? ch);

  // 文字の間に挟まる「伏字・区切り」を除去する。
  // 記号・空白・長音・中黒・伏字によく使われる文字（○●*＊・~ー- など）を削除。
  s = s.replace(
    /[\s　・･、。.,_\-ー〜~＝=*＊#＃○●◯◎△▽▲▼☆★※「」『』()（）\[\]【】<>＜＞@＠^"'`|/\\!！?？:：;；+＋]/g,
    ""
  );

  return s;
}

// 投稿本文に禁止ワードが含まれるか判定する。
export function checkMessage(body: string): ModerationResult {
  const normalized = normalize(body);
  const matched = BANNED_WORDS.filter((w) => normalized.includes(w));
  return { ok: matched.length === 0, matched };
}
