import { describe, it, expect } from 'vitest';
import { downsampleMinMax } from './downsample';
import type { Point } from './downsample';

describe('downsampleMinMax', () => {
    it('сохраняет одиночный spike при любом размере бакета', () => {
        const data: Point[] = [];
        for (let i = 0; i < 1000000; i++) {
            data.push({ x: i, y: 0.5 });
        }
        data[500000].y = 999;

        for (const buckets of [100, 500, 1000, 2000]) {
            const result = downsampleMinMax(data, buckets);
            const maxY = Math.max(...result.map(p => p.y));
            expect(maxY).toBe(999);
        }
    });
});