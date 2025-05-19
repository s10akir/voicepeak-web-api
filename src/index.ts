import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { synthesizeVoice, listNarrator, listEmotion } from "./voicepeak";
import { readFile, unlink } from "fs/promises";
import { basename } from "path";

const app = new Elysia();

app
    // Swaggerプラグインを有効化
    .use(swagger({
        documentation: {
            info: {
                title: "Voicepeak WebAPI",
                version: "1.0.0"
            }
        }
    }))

    // 音声合成API
    .post("/synthesize", async ({ body, set }) => {
        const { text, narrator, emotion, speed, pitch } = body as {
            text?: string;
            narrator?: string;
            emotion?: string;
            speed?: number;
            pitch?: number;
        };
        if (!text) {
            set.status = 400;
            return { error: "textパラメータが必要です" };
        }
        const result = await synthesizeVoice({ text, narrator, emotion, speed, pitch });
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
    })

    // ナレーター一覧API
    .get("/list-narrator", async () => {
        const narrators = await listNarrator();
        return narrators;
    })

    // 感情一覧API
    .get("/list-emotion", async ({ query, set }) => {
        const narrator = query.narrator as string;
        if (!narrator) {
            set.status = 400;
            return { error: "narratorパラメータが必要です" };
        }
        const emotions = await listEmotion(narrator);
        return emotions;
    })

    // サーバー起動
    .listen(3000);

console.log("http://localhost:3000 でサーバーが起動しました");
