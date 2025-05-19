import { Elysia } from "elysia";
import { synthesizeVoice } from "./voicepeak";
import { readFile } from "fs/promises";

const app = new Elysia();

app.get("/", () => "Voicepeak WebAPI サーバーが起動しました");

app.post("/synthesize", async ({ body, set }) => {
    const { text } = body as { text?: string };
    if (!text) {
        set.status = 400;
        return { error: "textパラメータが必要です" };
    }
    const result = await synthesizeVoice(text);
    if (!result.success || !result.filePath) {
        set.status = 500;
        return { error: result.message };
    }
    try {
        const data = await readFile(result.filePath);
        set.headers["Content-Type"] = "audio/wav";
        set.headers["Content-Disposition"] = `attachment; filename="${result.filePath}"`;
        return data;
    } catch {
        set.status = 500;
        return { error: "音声ファイルの読み込みに失敗しました" };
    }
});

// ダウンロード用エンドポイント
app.get("/download/:filename", async ({ params, set }) => {
    const { filename } = params as { filename: string };
    // セキュリティのためファイル名に不正な文字が含まれていないかチェック
    if (!/^[\w.\-]+$/.test(filename)) {
        set.status = 400;
        return "不正なファイル名です";
    }
    const filePath = `./${filename}`;
    try {
        const data = await readFile(filePath);
        set.headers["Content-Type"] = "audio/wav";
        set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;
        return data;
    } catch {
        set.status = 404;
        return "ファイルが見つかりません";
    }
});

app.listen(3000);

console.log("http://localhost:3000 でサーバーが起動しました");
