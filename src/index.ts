import { Elysia } from "elysia";
import { exec } from "bun";
import { synthesizeVoice } from "./voicepeak";

const app = new Elysia();

app.get("/", () => "Voicepeak WebAPI サーバーが起動しました");

app.post("/synthesize", async ({ body }) => {
    const { text } = await body.json();
    if (!text) {
        return { error: "textパラメータが必要です" };
    }
    const result = await synthesizeVoice(text);
    return result;
});

app.listen(3000);

console.log("http://localhost:3000 でサーバーが起動しました");
