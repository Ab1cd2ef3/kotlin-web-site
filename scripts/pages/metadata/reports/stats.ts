import { Metadata } from '../Metadata';
import { FileType } from '../../lib/files/type';

export async function makeStatsReport(list: Metadata[]) {
    const summ = list.reduce((acc, [_, fileType]) => {
        acc[fileType] = (acc[fileType] || 0) + 1;
        return acc;
    }, {} as Record<FileType, number>);

    return Object.entries(summ)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}, ${value}`).join('\n');
}
