import { Elysia, t } from "elysia";
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
    .post(
        "/synthesize",
        async ({ body, set }) => {
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
            if (text.length > 140) {
                set.status = 400;
                return { error: "textは140文字以内で指定してください" };
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
        },
        {
            body: t.Object({
                text: t.String({ description: "読み上げるテキスト（必須、最大140文字）", maxLength: 140 }),
                narrator: t.Optional(t.String({ description: "話者名（例: 女声1）" })),
                emotion: t.Optional(t.String({ description: "感情表現（例: happy=80,sad=20）" })),
                speed: t.Optional(t.Number({ description: "話速（50-200）" })),
                pitch: t.Optional(t.Number({ description: "ピッチ（-300～300）" })),
            }),
            response: {
                200: t.Any({ description: "合成音声のWAVバイナリ" }),
                400: t.Object({ error: t.String() }),
                500: t.Object({ error: t.String() }),
            },
            description: "Voicepeakで音声合成を行い、WAVファイルを返します"
        }
    )

    // ナレーター一覧API
    .get(
        "/list-narrator",
        async () => {
            const narrators = await listNarrator();
            return narrators;
        },
        {
            response: {
                200: t.String({ description: "利用可能なナレーター一覧（テキスト）" })
            },
            description: "利用可能なナレーター（話者）の一覧をテキストで返します"
        }
    )

    // 感情一覧API
    .get(
        "/list-emotion",
        async ({ query, set }) => {
            const narrator = query.narrator as string;
            if (!narrator) {
                set.status = 400;
                return { error: "narratorパラメータが必要です" };
            }
            const emotions = await listEmotion(narrator);
            return emotions;
        },
        {
            query: t.Object({
                narrator: t.String({ description: "感情一覧を取得したいナレーター名" })
            }),
            response: {
                200: t.String({ description: "指定ナレーターの感情一覧（テキスト）" }),
                400: t.Object({ error: t.String() })
            },
            description: "指定したナレーターの感情一覧をテキストで返します"
        }
    )

    // サーバー起動
    .listen(3000);

console.log("http://localhost:3000 でサーバーが起動しました");
