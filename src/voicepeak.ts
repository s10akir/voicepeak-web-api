import { $ } from "bun";

/**
 * Voicepeakをコマンドラインから呼び出して音声合成を行う関数
 */
export async function synthesizeVoice(text: string): Promise<{ success: boolean; message: string; filePath?: string }> {
    // 出力ファイル名を一意にする（例: タイムスタンプ利用）
    const filePath = `output_${Date.now()}.wav`;

    try {
        // Voicepeak CLIを呼び出す
        const result = await $`voicepeak --say ${text} --out ${filePath}`;

        if (result.exitCode === 0) {
            return {
                success: true,
                message: `音声合成に成功しました: ${filePath}`,
                filePath
            };
        } else {
            return {
                success: false,
                message: `音声合成に失敗しました: ${result.stderr.toString()}`
            };
        }
    } catch (e: any) {
        return {
            success: false,
            message: `エラーが発生しました: ${e.message}`
        };
    }
}
