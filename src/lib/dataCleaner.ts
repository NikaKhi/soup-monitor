import type { Point } from './downsample';

export interface CleanResult {
    points: Point[];
    hadNaN: boolean;
    hadInfinity: boolean;
}

export function cleanLoss(
    steps: number[],
    loss: number[]
): CleanResult {
    const points: Point[] = [];
    let hadNaN = false;
    let hadInfinity = false;

    for (let i = 0; i < steps.length; i++) {
        const y = loss[i];

        if (Number.isNaN(y)) {
            hadNaN = true;
            continue; // пропускаем — линия разорвётся
        }
        if (!Number.isFinite(y)) {
            hadInfinity = true;
            continue;
        }
        points.push({ x: steps[i], y });
    }

    // Сортируем по X (чтобы шаги шли по порядку)
    points.sort((a, b) => a.x - b.x);

    // Убираем дубликаты (оставляем последний)
    const deduped: Point[] = [];
    for (const p of points) {
        if (deduped.length > 0 && deduped[deduped.length - 1].x === p.x) {
            deduped[deduped.length - 1] = p;
        } else {
            deduped.push(p);
        }
    }

    return { points: deduped, hadNaN, hadInfinity };
}