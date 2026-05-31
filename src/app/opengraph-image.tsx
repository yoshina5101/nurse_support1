import { ImageResponse } from "next/og";

// SNSシェア用のOGP画像（1200×630）。ロゴ風の灯り＋キャッチコピー。
export const runtime = "edge";
export const alt = "あかり｜新卒看護師の就活支援アプリ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdfbf7",
          fontFamily: "sans-serif",
        }}
      >
        {/* 灯りマーク */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "#ffe6dc",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 70,
              height: 96,
              borderRadius: "50% 50% 50% 50% / 38% 38% 62% 62%",
              backgroundColor: "#f96a3d",
              transform: "rotate(0deg)",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "#18675c",
            marginBottom: 16,
          }}
        >
          あかり
        </div>
        <div style={{ fontSize: 34, color: "#3f4a48" }}>
          新卒看護師の就活を、そばで照らす。
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 24,
            color: "#7a857f",
          }}
        >
          自己分析 ・ 履歴書 ・ 小論文 ・ 面接練習 をAIがサポート
        </div>
      </div>
    ),
    { ...size }
  );
}
