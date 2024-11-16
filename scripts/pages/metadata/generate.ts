import { join, resolve } from 'node:path';
import { FileHandle, mkdir, open, writeFile } from 'node:fs/promises';

import { execFilesTask } from '../lib/files/execTask.js';
import { Metadata } from './Metadata.js';

import {
    FileStats,
    makeFileReport,
    makeSitemapItem,
    makeStatsReport,
    SITEMAP_CLOSE_TEXT,
    SITEMAP_OPEN_TEXT
} from './reports.js';

const ROOT_DIR = resolve('..', '..');
const DIST_FOLDER = join(ROOT_DIR, 'dist/');
const REPORT_FOLDER = join(ROOT_DIR, 'reports/');

const TASK_PATH = import.meta.dirname + '/task';

async function openWithText(path: string, text: string) {
    const file = await open(path, 'w');
    await file.write(text);
    return file;
}

async function closeWithText(file: FileHandle, text: string) {
    await file.write(text);
    await file.close();
}

async function writeReports(list: Metadata[]) {
    const fileTypes: FileStats = {};

    const [files, unknown, redirects, sitemap] = await Promise.all([
        openWithText(join(REPORT_FOLDER, 'files-types.json5'), '{\n'),
        open(join(REPORT_FOLDER, 'files-unknown.txt'), 'w'),
        open(join(REPORT_FOLDER, 'files-redirects.txt'), 'w'),
        openWithText(join(DIST_FOLDER, 'sitemap.xml'), SITEMAP_OPEN_TEXT)
    ]);

    for (const item of list) {
        const [url, { type }] = item;
        await files.appendFile(makeFileReport(item), { encoding: 'utf8' });

        await Promise.all([
            type === 'Unknown' && unknown.appendFile(url + '\n', { encoding: 'utf8' }),
            type === 'Redirect' && redirects.appendFile(url + '\n', { encoding: 'utf8' }),
            type.startsWith('Page_') && sitemap.appendFile(makeSitemapItem(url), { encoding: 'utf8' })
        ]);

        fileTypes[type] = (fileTypes[type] || 0) + 1;
    }

    await Promise.all([
        writeFile(join(REPORT_FOLDER, 'stats.csv'), makeStatsReport(fileTypes), 'utf8'),
        closeWithText(files, '}'), closeWithText(sitemap, SITEMAP_CLOSE_TEXT),
        unknown.close(), redirects.close()
    ]);
}

let result: Metadata[] = [];

console.time('Data successfully built');

await execFilesTask(DIST_FOLDER, TASK_PATH, async function addToReport(item: Metadata) {
    result.push(item);
});

result.sort(([path1], [path2]) => path1.localeCompare(path2));

await mkdir(REPORT_FOLDER, { recursive: true });
await writeReports(result);

console.timeEnd('Data successfully built');
