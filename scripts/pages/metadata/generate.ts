import { join, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import { execFilesTask } from '../lib/files/execTask';
import { Metadata } from './Metadata';

import { makeFileReport } from './reports/file';
import { makeSitemap } from './reports/sitemap';
import { makeStatsReport } from './reports/stats';

const ROOT_DIR = resolve('..', '..');
const DIST_FOLDER = join(ROOT_DIR, 'dist/');
const REPORT_FOLDER = join(ROOT_DIR, 'report/');
const TASK_PATH = import.meta.dirname + '/task.ts';

let result: Metadata[] = [];

async function reportFile(item: Metadata) {
    result.push(item);
}

await execFilesTask(DIST_FOLDER, TASK_PATH, reportFile);

result.sort(([path1], [path2]) => path1.localeCompare(path2));

await Promise.all([
    await mkdir(REPORT_FOLDER, { recursive: true })
        .then(async () => {
            await Promise.all([
                writeFile(join(REPORT_FOLDER, 'files.json'), await makeFileReport(result), 'utf8'),
                writeFile(join(REPORT_FOLDER, 'stats.csv'), await makeStatsReport(result), 'utf8')
            ]);
        }),

    writeFile(join(DIST_FOLDER, 'sitemap.xml'), await makeSitemap(result), 'utf8')
]);
