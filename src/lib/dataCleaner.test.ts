import { describe, it, expect } from 'vitest';
import { cleanLoss } from './dataCleaner';

describe('cleanLoss', () => {
    it('не превращает NaN в 0', () => {
        const result = cleanLoss([1, 2, 3], [1, NaN, 3]);
        expect(result.points).toEqual([{ x: 1, y: 1 }, { x: 3, y: 3 }]);
        expect(result.hadNaN).toBe(true);
    });

    it('сортирует и убирает дубликаты', () => {
        const result = cleanLoss([3, 1, 1, 2], [3, 1, 1.5, 2]);

        expect(result.points.map(p => p.x)).toEqual([1, 2, 3]);

        expect(result.points.find(p => p.x === 1)?.y).toBe(1.5);
    });
});