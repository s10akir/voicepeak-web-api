/**
 * Voicepeakをコマンドラインから呼び出して音声合成を行う関数
 */
export async function synthesizeVoice(text: string): Promise<{ success: boolean; message: string; filePath?: string }> {
    const filePath = `output_${Date.now()}.wav`;

    try {
        const proc = Bun.spawn([
            "voicepeak",
            "--say", text,
            "--out", filePath
        ]);
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
