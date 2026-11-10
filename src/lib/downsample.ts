export interface Point {
    x: number;
    y: number;
}

export function downsampleMinMax(
    data: Point[],
    targetBuckets: number
): Point[] {
    if (data.length <= targetBuckets * 2) {
        // Если точек мало — возвращаем как есть
        return data;
    }

    const xMin = data[0].x;
    const xMax = data[data.length - 1].x;
    const bucketWidth = (xMax - xMin) / targetBuckets;

    const result: Point[] = [];
    let bucketStart = 0;

    for (let b = 0; b < targetBuckets; b++) {
        const bucketXMin = xMin + b * bucketWidth;
        const bucketXMax = bucketXMin + bucketWidth;

        const bucketPoints: Point[] = [];
        while (
            bucketStart < data.length &&
            data[bucketStart].x < bucketXMax
        ) {
            bucketPoints.push(data[bucketStart]);
            bucketStart++;
        }

        if (bucketPoints.length === 0) continue;

        let minPoint = bucketPoints[0];
        let maxPoint = bucketPoints[0];
        for (const p of bucketPoints) {
            if (p.y < minPoint.y) minPoint = p;
            if (p.y > maxPoint.y) maxPoint = p;
        }

        if (minPoint.x <= maxPoint.x) {
            result.push(minPoint);
            if (minPoint.x !== maxPoint.x) result.push(maxPoint);
        } else {
            result.push(maxPoint);
            result.push(minPoint);
        }
    }

    return result;
}