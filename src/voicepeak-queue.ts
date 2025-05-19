import type { VoicepeakOptions } from "./voicepeak";
import { synthesizeVoice } from "./voicepeak";

type Job = {
    options: VoicepeakOptions;
    resolve: (result: any) => void;
    reject: (err: any) => void;
};

const queue: Job[] = [];
let running = false;

async function processQueue() {
    if (running || queue.length === 0) return;
    running = true;
    const job = queue.shift()!;
    try {
        const result = await synthesizeVoice(job.options);
        job.resolve(result);
    } catch (e) {
        job.reject(e);
    }
    running = false;
    processQueue(); // 次のジョブを処理
}

export function enqueueSynthesize(options: VoicepeakOptions): Promise<any> {
    return new Promise((resolve, reject) => {
        queue.push({ options, resolve, reject });
        processQueue();
    });
}
