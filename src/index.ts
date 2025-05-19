import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { synthesizeVoice } from "./voicepeak";
import { readFile, unlink } from "fs/promises";
import { basename } from "path";

const app = new Elysia();

// Swaggerプラグインを有効化
app.use(swagger({
    documentation: {
        info: {
            title: "Voicepeak WebAPI",
            version: "1.0.0"
        }
    }
}));

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
        const filename = basename(result.filePath);
        set.headers["Content-Type"] = "audio/wav";
        set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;
        await unlink(result.filePath);
        return data;
    } catch {
        set.status = 500;
        return { error: "音声ファイルの読み込みに失敗しました" };
    }
});

app.listen(3000);

console.log("http://localhost:3000 でサーバーが起動しました");
