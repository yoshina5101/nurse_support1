export const RESUME_FIELDS: {
  key: string;
  label: string;
  multiline?: boolean;
  hint?: string;
}[] = [
  { key: "学歴", label: "学歴（最終学歴・在学中の学校など）", multiline: true },
  {
    key: "資格・免許",
    label: "資格・免許（看護師国家試験 受験予定 等）",
    multiline: true,
  },
  {
    key: "志望動機",
    label: "志望動機",
    multiline: true,
    hint: "「なぜその病院・施設なのか」と「あなたの看護観」が伝わるように書きましょう。",
  },
  {
    key: "自己PR",
    label: "自己PR",
    multiline: true,
    hint: "強みのエビデンス（どんな経験で・どう行動し・どんな結果が出たか）と、その強みの生かし方を書きましょう。",
  },
  {
    key: "学生時代に力を入れたこと",
    label: "学生時代に力を入れたこと",
    multiline: true,
  },
  { key: "趣味・特技", label: "趣味・特技" },
];
