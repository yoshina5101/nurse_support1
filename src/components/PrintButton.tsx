"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary">
      🖨️ PDFとして保存・印刷
    </button>
  );
}
