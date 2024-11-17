import { FileType } from '../lib/files/type.js';
import { statsPromise } from '../lib/files/index.js';
import { SearchRecord } from '../lib/search/records.js';
import { Metadata } from './metadata.js';

export function makeFileReport([url, { type }]: Metadata) {
    return `  ${JSON.stringify(url)}: ${JSON.stringify(type)},\n`;
}

export const SITEMAP_OPEN_TEXT = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

export const SITEMAP_CLOSE_TEXT = '</urlset>';

export function makeSitemapItem(url: string) {
    return `<url><loc>${url}</loc><priority>1</priority></url>\n`;
}

export type FileStats = Partial<Record<FileType, number>>;

export function makeStatsReport(stats: FileStats) {
    return Object.entries(stats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}, ${value}`).join('\n');
}

const BACKWARD_COMPATIBILITY_ORDER = ['objectID', 'headings', 'mainTitle', 'pageTitle', 'content', 'url', 'type', 'parent', 'pageViews', 'product'];

export async function makeSearchItem([url, data]: Metadata) {
    let records = data.records;

    const stats = await statsPromise;
    const amount = stats[url];

    for (const record of records) {
        if (amount) record.pageViews = amount;

        // do safe for algolia record.
        // ToDo: if you want use tags in algolia drop it,
        //  but remember **ALL** key and values should be escaped in-place.
        for (const [key] of Object.entries(record)) {
            const val = record[key as keyof SearchRecord];
            if (typeof val === 'string') {
                (record as Record<string, unknown>)[key] = val
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
        }
    }

    const entries = records.map(record => Object.fromEntries(Object.entries(record).sort(
        ([a], [b]) =>
            BACKWARD_COMPATIBILITY_ORDER.indexOf(a) - BACKWARD_COMPATIBILITY_ORDER.indexOf(b)
    )));

    return `  ${JSON.stringify(url)}: ${JSON.stringify(entries, null, 2)},\n`;
}
