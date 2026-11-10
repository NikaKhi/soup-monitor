import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function makeRun(id, count, broken = {}) {
    const steps = [];
    const loss = [];
    const lr = [];
    const grad_norm = [];
    const timestamps = [];

    let currentTime = Date.now();

    for (let i = 0; i < count; i++) {
        let s = i;
        if (broken.duplicate && i > 100 && i < 110) s = i - 5;
        if (broken.unsorted && i > 200 && i < 205) s = count - i;

        steps.push(s);
        loss.push(2.5 / Math.sqrt(i + 1) + Math.random() * 0.1);
        lr.push(0.001 * Math.pow(0.99, i));
        grad_norm.push(1.0 + Math.random() * 0.5);

        currentTime += 1000;
        timestamps.push(new Date(currentTime).toISOString());
    }

    // NaN и Infinity
    if (broken.nan) {
        loss[50] = NaN;
        loss[150] = NaN;
    }
    if (broken.infinity) {
        grad_norm[80] = Infinity;
    }

    if (broken.spike) {
        const mid = Math.floor(count / 2);
        loss[mid] = 999.9;
    }

    return { id, steps, loss, lr, grad_norm, timestamps };
}

const runs = [];
// 15 обычных runs по 100-500 точек
for (let i = 1; i <= 15; i++) {
    runs.push(makeRun(`run-${i}`, 100 + i * 20));
}
// 2 сломанных (NaN, Infinity)
runs.push(makeRun('run-nan', 300, { nan: true }));
runs.push(makeRun('run-inf', 300, { infinity: true }));
// 1 с дубликатами и неправильным порядком
runs.push(makeRun('run-messy', 400, { duplicate: true, unsorted: true }));

// 1 с пропусками (просто пропустим шаги, изменив шаг)
const gapRun = makeRun('run-gaps', 200);
gapRun.steps = gapRun.steps.filter((_, i) => i % 20 !== 0);
gapRun.loss = gapRun.loss.filter((_, i) => i % 20 !== 0);
gapRun.lr = gapRun.lr.filter((_, i) => i % 20 !== 0);
gapRun.grad_norm = gapRun.grad_norm.filter((_, i) => i % 20 !== 0);
gapRun.timestamps = gapRun.timestamps.filter((_, i) => i % 20 !== 0);
runs.push(gapRun);

// 1 МИЛЛИОН точек со spike
runs.push(makeRun('run-million', 1000000, { spike: true }));

// Сохраняем каждый run отдельным файлом
runs.forEach(run => {
    fs.writeFileSync(
        path.join(outputDir, `${run.id}.json`),
        JSON.stringify(run)
    );
});
console.log('Успех! Файлы созданы в public/data/');