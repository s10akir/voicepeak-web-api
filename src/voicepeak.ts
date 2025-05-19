import { tmpdir } from "os";
import { join } from "path";

/**
 * Voicepeakをコマンドラインから呼び出して音声合成を行う関数
 */

export interface VoicepeakOptions {
    text: string;         // --say
    narrator?: string;    // --narrator
    emotion?: string;     // --emotion
    speed?: number;       // --speed
    pitch?: number;       // --pitch
}

export async function synthesizeVoice(options: VoicepeakOptions): Promise<{ success: boolean; message: string; filePath?: string }> {
    const filePath = join(tmpdir(), `output_${Date.now()}.wav`);
    const args = ["--say", options.text, "--out", filePath];

    if (options.narrator) args.push("--narrator", options.narrator);
    if (options.emotion) args.push("--emotion", options.emotion);
    if (options.speed) args.push("--speed", String(options.speed));
    if (options.pitch) args.push("--pitch", String(options.pitch));

    try {
        const proc = Bun.spawn(["voicepeak", ...args]);
        const exitCode = await proc.exited;
        if (exitCode === 0) {
            return {
                success: true,
                message: `音声合成に成功しました: ${filePath}`,
                filePath
            };
        } else {
            const stderr = await new Response(proc.stderr).text();
            return {
                success: false,
                message: `音声合成に失敗しました: ${stderr}`
            };
        }
    } catch (e: any) {
        return {
            success: false,
            message: `エラーが発生しました: ${e.message}`
        };
    }
}

/**
 * voicepeak --list-narrator の出力を返す
 */
export async function listNarrator(): Promise<string> {
    const proc = Bun.spawn(["voicepeak", "--list-narrator"]);
    const stdout = await new Response(proc.stdout).text();
    return stdout;
}

/**
 * voicepeak --list-emotion <narrator> の出力を返す
 */
export async function listEmotion(narrator: string): Promise<string> {
    const proc = Bun.spawn(["voicepeak", "--list-emotion", narrator]);
    const stdout = await new Response(proc.stdout).text();
    return stdout;
}
