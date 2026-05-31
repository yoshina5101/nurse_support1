// 自己分析ウィザード：選択式5問。各選択肢に「強みタグ」を付与し、
// 回答の集計（ルールベース）で上位の強みを算出する。

export type StrengthKey =
  | "empathy" // 共感力・寄り添い
  | "communication" // コミュニケーション
  | "teamwork" // 協調性・チームワーク
  | "leadership" // 主体性・リーダーシップ
  | "diligence" // 誠実さ・丁寧さ
  | "resilience" // 粘り強さ・ストレス耐性
  | "learning" // 学習意欲・向上心
  | "observation"; // 観察力・気づき

export const STRENGTHS: Record<
  StrengthKey,
  { label: string; description: string }
> = {
  empathy: {
    label: "共感力・寄り添い",
    description: "相手の気持ちを汲み取り、心に寄り添うことができる",
  },
  communication: {
    label: "コミュニケーション力",
    description: "相手に合わせてわかりやすく伝え、対話を大切にできる",
  },
  teamwork: {
    label: "協調性・チームワーク",
    description: "周囲と協力し、チームの一員として動ける",
  },
  leadership: {
    label: "主体性・リーダーシップ",
    description: "自ら考えて動き、必要なときに周囲を引っ張れる",
  },
  diligence: {
    label: "誠実さ・丁寧さ",
    description: "一つひとつの仕事に責任を持ち、丁寧に取り組める",
  },
  resilience: {
    label: "粘り強さ・ストレス耐性",
    description: "困難な状況でも諦めず、前向きに乗り越えられる",
  },
  learning: {
    label: "学習意欲・向上心",
    description: "新しいことを学び、成長し続けようとする",
  },
  observation: {
    label: "観察力・気づき",
    description: "小さな変化やサインに気づき、先回りして動ける",
  },
};

export type WizardOption = {
  label: string;
  strengths: StrengthKey[];
};

export type WizardQuestion = {
  id: string;
  question: string;
  options: WizardOption[];
};

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "q1",
    question: "看護師を目指したきっかけに、最も近いものは？",
    options: [
      {
        label: "身近な人の入院・闘病に寄り添った経験から",
        strengths: ["empathy", "diligence"],
      },
      {
        label: "人と関わり、支える仕事がしたいと思ったから",
        strengths: ["communication", "teamwork"],
      },
      {
        label: "専門的な知識・技術を身につけて成長したいから",
        strengths: ["learning", "leadership"],
      },
      {
        label: "誰かの役に立てたときの達成感が忘れられないから",
        strengths: ["resilience", "empathy"],
      },
    ],
  },
  {
    id: "q2",
    question: "実習やアルバイトで、あなたが力を発揮したのは？",
    options: [
      {
        label: "相手の話をじっくり聞き、不安を和らげること",
        strengths: ["empathy", "communication"],
      },
      {
        label: "チームで役割を分担し、協力して進めること",
        strengths: ["teamwork", "communication"],
      },
      {
        label: "問題に気づき、自分から動いて改善したこと",
        strengths: ["leadership", "observation"],
      },
      {
        label: "地道な作業を最後まで丁寧にやり切ったこと",
        strengths: ["diligence", "resilience"],
      },
    ],
  },
  {
    id: "q3",
    question: "困難な場面に直面したとき、あなたはどう動く？",
    options: [
      {
        label: "原因を冷静に考え、粘り強く取り組む",
        strengths: ["resilience", "diligence"],
      },
      {
        label: "周りに相談し、協力して解決しようとする",
        strengths: ["teamwork", "communication"],
      },
      {
        label: "まず自分にできることを探して、主体的に動く",
        strengths: ["leadership", "learning"],
      },
      {
        label: "相手の立場を想像し、気持ちに配慮しながら対応する",
        strengths: ["empathy", "observation"],
      },
    ],
  },
  {
    id: "q4",
    question: "周りの人からよく言われる、あなたの良いところは？",
    options: [
      {
        label: "やさしい・話しやすい・親身になってくれる",
        strengths: ["empathy", "communication"],
      },
      {
        label: "真面目・丁寧・任せると安心",
        strengths: ["diligence", "resilience"],
      },
      {
        label: "よく気がつく・細かいことに気づく",
        strengths: ["observation", "empathy"],
      },
      {
        label: "頼りになる・引っ張ってくれる",
        strengths: ["leadership", "teamwork"],
      },
    ],
  },
  {
    id: "q5",
    question: "これからの看護師生活で、特に大切にしたいことは？",
    options: [
      {
        label: "患者さん一人ひとりに寄り添うこと",
        strengths: ["empathy", "diligence"],
      },
      {
        label: "学び続けて、看護の知識・技術を高めること",
        strengths: ["learning", "leadership"],
      },
      {
        label: "チームの中で信頼される存在になること",
        strengths: ["teamwork", "communication"],
      },
      {
        label: "どんな時も諦めず、前向きに取り組むこと",
        strengths: ["resilience", "leadership"],
      },
    ],
  },
];

// 回答（questionId -> 選択肢index）から強みを集計し、上位を返す。
export function aggregateStrengths(
  answers: Record<string, number>
): { key: StrengthKey; count: number }[] {
  const tally = new Map<StrengthKey, number>();
  for (const q of WIZARD_QUESTIONS) {
    const idx = answers[q.id];
    const opt = q.options[idx];
    if (!opt) continue;
    for (const s of opt.strengths) {
      tally.set(s, (tally.get(s) ?? 0) + 1);
    }
  }
  return [...tally.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

// 選択ラベルの一覧（保存・AIへの受け渡し用）。
export function answersToLabels(
  answers: Record<string, number>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of WIZARD_QUESTIONS) {
    const opt = q.options[answers[q.id]];
    if (opt) out[q.question] = opt.label;
  }
  return out;
}
