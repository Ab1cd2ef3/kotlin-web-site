import { env } from 'node:process';
import { join } from 'node:path';
import { FileHandle, mkdir, open, writeFile } from 'node:fs/promises';

import { DIST_FOLDER, REPORT_FOLDER } from '../lib/files/index.js';
import { execFilesTask, Filter } from '../lib/files/execTask.js';
import { withSearchParser } from '../lib/search/records.js';
import { Metadata } from './metadata.js';

import {
    FileStats,
    makeFileReport,
    makeSearchItem,
    makeSitemapItem,
    makeStatsReport,
    SITEMAP_CLOSE_TEXT,
    SITEMAP_OPEN_TEXT
} from './reports.js';


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
    const [files, unknown, redirects, sitemap, types, index] = await Promise.all([
        openWithText(join(REPORT_FOLDER, 'files.json5'), '{\n'),
        open(join(REPORT_FOLDER, 'files-unknown.txt'), 'w'),
        open(join(REPORT_FOLDER, 'files-redirects.txt'), 'w'),
        openWithText(join(DIST_FOLDER, 'sitemap.xml'), SITEMAP_OPEN_TEXT),
        openWithText(join(REPORT_FOLDER, 'file-types.csv'), 'Filename, How many?\n'),
        withSearchParser && openWithText(join(REPORT_FOLDER, 'index.json5'), '{\n')
    ]);

    const fileTypes: FileStats = {};

    try {
        for (const item of list) {
            const [path, { type, records: { length: recordsSize } }] = item;

            const url = (new URL(path, 'https://kotlinlang.org/')).toString();

            await Promise.all([
                files.appendFile(makeFileReport(item), { encoding: 'utf8' }),
                type === 'Unknown' && unknown.appendFile(path + '\n', { encoding: 'utf8' }),
                type === 'Redirect' && redirects.appendFile(path + '\n', { encoding: 'utf8' }),
                type.startsWith('Page_') && sitemap.appendFile(makeSitemapItem(url), { encoding: 'utf8' }),

                (index && type.startsWith('Page_') && recordsSize > 0) && (
                    makeSearchItem([url, item[1]])
                        .then(text => index.appendFile(text, { encoding: 'utf8' })))
            ]);

            fileTypes[type] = (fileTypes[type] || 0) + 1;
        }
    } finally {
        await Promise.all([
            writeFile(types, makeStatsReport(fileTypes), 'utf8').finally(() => types.close()),
            closeWithText(files, '}'), closeWithText(sitemap, SITEMAP_CLOSE_TEXT),
            index && closeWithText(index, '}'),
            unknown.close(), redirects.close()
        ]);
    }
}

function preFilterFiles({ relativePath: path }: Parameters<Filter>[0]) {
    const isSkip = (
        // optimize by path "api/core/older" takes more than 1 minute only for filesystem iteration
        (path.startsWith('api/') && (path.endsWith('/older'))) ||
        path === 'spec' ||
        path === 'api/latest'
    );

    if (isSkip) console.log(`skip: /${path} skipped by path`);
    return !isSkip;
}

let result: Metadata[] = [];

console.time('Data successfully built');

await execFilesTask(
    DIST_FOLDER, TASK_PATH,
    async function addToReport(item: Metadata) {
        result.push(item);
    },
    env['WH_SHORT_REPORT'] ? preFilterFiles : null
);

result.sort(([path1], [path2]) => path1.localeCompare(path2));

await mkdir(REPORT_FOLDER, { recursive: true });
await writeReports(result);

console.timeEnd('Data successfully built');
