import { Metadata } from './Metadata.js';
import { FileType } from '../lib/files/type.js';

export function makeFileReport([url, { type }]: Metadata) {
    return `  ${JSON.stringify(url)}: ${JSON.stringify(type)},\n`;
}

export const SITEMAP_OPEN_TEXT = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

export const SITEMAP_CLOSE_TEXT = '</urlset>';

export function makeSitemapItem(path: string) {
    return `<url><loc>https://kotlinlang.org/${path}</loc><priority>1</priority></url>\n`;
}

export type FileStats = Partial<Record<FileType, number>>;

export function makeStatsReport(stats: FileStats) {
    return Object.entries(stats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}, ${value}`).join('\n');
}
