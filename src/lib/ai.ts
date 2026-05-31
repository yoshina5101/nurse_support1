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

export async function summarizeSelfAnalysis(
  answers: Record<string, string>
): Promise<string> {
  const formatted = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a || "(未回答)"}`)
    .join("\n\n");
  const prompt =
    "以下は新卒看護師を目指す方の自己分析の回答です。これをもとに、" +
    "(1)強み (2)弱み・課題 (3)向いていそうな職場・診療科の傾向 (4)就活で意識すると良い点 " +
    "の4観点で、それぞれ箇条書きで簡潔にまとめてください。\n\n" +
    formatted;
  return callClaude(prompt);
}

export async function reviewResume(content: Record<string, string>): Promise<string> {
  const formatted = Object.entries(content)
    .map(([k, v]) => `【${k}】\n${v || "(未記入)"}`)
    .join("\n\n");
  const prompt =
    "以下は新卒看護師の履歴書の内容です。看護師採用担当者の視点で、項目ごとに" +
    "良い点と改善案を具体的に添削してください。最後に全体講評を加えてください。\n\n" +
    formatted;
  return callClaude(prompt);
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
  const match = feedback.match(/点数[:：]\s*(\d{1,3})\s*\/\s*100/);
  const score = match ? Math.min(100, parseInt(match[1], 10)) : null;
  return { feedback, score };
}
