import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { downsampleMinMax } from '../lib/downsample';
import { cleanLoss } from '../lib/dataCleaner';

interface ChartProps {
    steps: number[];
    values: number[];
    label: string;
}

export function Chart({ steps, values, label }: ChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const plotRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const cleaned = cleanLoss(steps, values);
        const downsampled = downsampleMinMax(cleaned.points, 1000);

        const xs = downsampled.map(p => p.x);
        const ys = downsampled.map(p => p.y);

        if (plotRef.current) {
            plotRef.current.destroy();
        }

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 300,
            series: [
                {},
                {
                    label: label,
                    stroke: '#3b82f6', // синий цвет
                    width: 1,
                },
            ],
            axes: [
                { label: 'Step' },
                { label: label },
            ],
        };

        plotRef.current = new uPlot(opts, [xs, ys], containerRef.current);

        return () => {
            plotRef.current?.destroy();
            plotRef.current = null;
        };
    }, [steps, values, label]);

    return <div ref={containerRef} style={{ width: '100%', marginBottom: '20px' }} />;
}