import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

// APIキーが設定されているときだけ実クライアントを生成する。
// 未設定時はダミー応答を返し、キー無しでも全画面の動作確認ができるようにする。
const client = apiKey ? new Anthropic({ apiKey }) : null;

export const aiEnabled = Boolean(client);

const SYSTEM_PROMPT =
  "あなたは新卒看護師の就職活動を支援する、経験豊富なキャリアアドバイザーです。" +
  "看護師採用の観点を踏まえ、具体的で前向き、かつ実行可能なアドバイスを日本語で提供してください。" +
  "断定しすぎず、改善点は理由とセットで示してください。";

async function callClaude(prompt: string, maxTokens = 1500): Promise<string> {
  if (!client) {
    return dummyResponse(prompt);
  }
  try {
    const res = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || dummyResponse(prompt);
  } catch (err) {
    console.error("Claude API error:", err);
    return (
      "（AI添削の取得中にエラーが発生しました。時間をおいて再度お試しください。）\n\n" +
      dummyResponse(prompt)
    );
  }
}

function dummyResponse(_prompt: string): string {
  return [
    "【サンプル添削（AI未設定）】",
    "現在 ANTHROPIC_API_KEY が未設定のため、ダミーのフィードバックを表示しています。",
    "",
    "■ 良い点",
    "- 全体の構成が整っており、読み手に内容が伝わります。",
    "",
    "■ 改善できる点",
    "- 具体的なエピソードを1つ加えると説得力が増します。",
    "- 結論を冒頭でも示すと、主張が明確になります。",
    "",
    "※ 本物のAI添削を利用するには .env に ANTHROPIC_API_KEY を設定してください。",
  ].join("\n");
}

// フィードバック末尾の『点数: NN/100』からスコアを取り出す共通処理
function extractScore(feedback: string): number | null {
  const match = feedback.match(/点数[:：]\s*(\d{1,3})\s*\/\s*100/);
  return match ? Math.min(100, parseInt(match[1], 10)) : null;
}

// 自己分析：選択式ウィザードの回答と、集計で判定された強みをもとに、
// その強みを就活で武器にするための深掘りを行う。
export async function summarizeSelfAnalysis(
  answers: Record<string, string>,
  topStrengths?: string[]
): Promise<string> {
  const formatted = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a || "(未回答)"}`)
    .join("\n\n");
  const strengthsLine =
    topStrengths && topStrengths.length > 0
      ? `診断で特定された主な強み：${topStrengths.join("、")}\n\n`
      : "";
  const prompt =
    "以下は新卒看護師を目指す方の自己分析（選択式5問）の回答と、回答から判定された強みです。" +
    "この強みを就職活動で活かせるよう、次の構成で日本語でまとめてください。\n\n" +
    strengthsLine +
    "【あなたの強み】\n判定された強みを、回答内容を根拠として一人ひとりに語りかけるように説明する（2〜3個）。\n\n" +
    "【強みの深掘り】\n強みごとに、就職活動で武器にするための問いを投げかけてください。" +
    "具体的には『その強みを発揮した具体的なエピソードは？』『その時どう行動し、どんな結果が出たか？』" +
    "『その強みを入職後どう活かせるか？』を、本人が答えやすい形で1つずつ問いかける。\n\n" +
    "【志望動機・自己PRへの活かし方】\nこの強みを履歴書や面接でどう伝えると効果的か、簡潔にアドバイスする。\n\n" +
    formatted;
  return callClaude(prompt, 2000);
}

// 履歴書添削：志望動機・自己PRに明確な評価基準を設定する。
export async function reviewResume(content: Record<string, string>): Promise<string> {
  const formatted = Object.entries(content)
    .map(([k, v]) => `【${k}】\n${v || "(未記入)"}`)
    .join("\n\n");
  const prompt =
    "以下は新卒看護師の履歴書の内容です。看護師採用担当者の視点で、項目ごとに良い点と改善案を" +
    "具体的に添削してください。特に次の評価基準に沿って、満たせているか・どう改善するかを明示してください。\n\n" +
    "■志望動機の評価基準\n" +
    "(1) なぜその病院・施設なのか（他施設ではなくそこを選ぶ理由が具体的か）\n" +
    "(2) 看護観（どのような看護を大切にしたいかが示され、志望先と結びついているか）\n\n" +
    "■自己PRの評価基準\n" +
    "(1) 自身の強みと、そう言えるエビデンス（どんな経験をして、自分はそこでどう行動し、" +
    "どんな結果が得られたか＝経験・行動・結果が具体的に語られているか）\n" +
    "(2) 強みの生かし方（その強みを入職後の看護にどう活かすかが述べられているか）\n\n" +
    "各基準について「満たしている／一部不足／要改善」を示し、改善のための具体的な書き方の例も添えてください。" +
    "最後に全体講評を加えてください。\n\n" +
    formatted;
  return callClaude(prompt, 2500);
}

export async function reviewEssay(
  theme: string,
  body: string
): Promise<{ feedback: string; score: number | null }> {
  const prompt =
    "以下は新卒看護師を目指す方の小論文です。" +
    "(1)構成・論理性 (2)看護観・人間性の表れ (3)文章表現 の観点で添削し、" +
    "改善案を具体的に示してください。\n" +
    "最後の行に必ず『点数: NN/100』の形式で100点満点の評価点を1つだけ記載してください。\n\n" +
    `■お題\n${theme}\n\n■本文\n${body}`;
  const feedback = await callClaude(prompt, 2000);
  return { feedback, score: extractScore(feedback) };
}

// 面接練習：1問1回答を、看護師採用面接官の視点でレビューする。
export async function reviewInterview(
  question: string,
  answer: string
): Promise<{ feedback: string; score: number | null }> {
  const prompt =
    "以下は新卒看護師の面接練習における、ある質問への口頭回答（音声を文字起こししたもの）です。" +
    "看護師採用面接官の視点で、次の観点でレビューしてください。\n" +
    "(1) 質問に的確に答えられているか\n" +
    "(2) 具体性（経験・行動・結果などのエピソードがあるか）\n" +
    "(3) 看護観・人柄の伝わり方\n" +
    "(4) 話し方（簡潔さ・結論先行・冗長や繰り返しがないか。文字起こしのため細かな言い回しは大目に見る）\n" +
    "良い点と改善案を具体的に示し、より良い回答の方向性（言い換え例）も添えてください。\n" +
    "最後の行に必ず『点数: NN/100』の形式で100点満点の評価点を1つだけ記載してください。\n\n" +
    `■質問\n${question}\n\n■回答\n${answer}`;
  const feedback = await callClaude(prompt, 2000);
  return { feedback, score: extractScore(feedback) };
}
