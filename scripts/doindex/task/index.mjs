import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { newTaskExecutor } from '../lib/pool.mjs';

/**
 * @typedef {object} Page
 * @property {string} url
 * @property {string} type
 * @property {string} [file]
 */

/**
 * @typedef {Object.<key, string>} IndexRecord
 * @property {string} objectID
 * @property {string} url
 * @property {string} pageTitle
 * @property {string} content
 */

/**
 * @param {string} rootDir
 * @param {Object.<string, number>} stats
 * @param {(page: Page) => void} reportUrl
 * @param {(path: string, file: Dirent) => boolean} filter
 */
export async function readPagesIndex(rootDir, stats, reportUrl, filter = null) {
    /** @type {IndexRecord[]} */
    let result = [];

    let isPathsWalked = false;

    /**
     * @param {string} type
     * @param {string} file
     * @param {string} url
     * @param {IndexRecord[]} records
     */
    function onReady({ type, file, url, records }) {
        if (reportUrl) reportUrl({ type, url, file });

        if (records.length === 0) return;

        records = records.filter(function filterRecords(record) {
            const isValid = Boolean(record.objectID && record.url && record.pageTitle && record.content);

            if (isValid) console.log(`added ${record.objectID}`);
            else console.log(`skip: ${record.url} has invalid value!`);

            return isValid;
        });

        for (const record of records) {
            result.push(record);
        }
    }

    function isFinished() {
        return isPathsWalked;
    }

    const [pool, finish, updatePoolState] = newTaskExecutor(
        import.meta.dirname + '/task.mjs', onReady, isFinished
    );

    const folders = new Set([rootDir]);

    for (const folder of folders.values()) {
        const files = await readdir(folder, { withFileTypes: true });

        await Promise.all(files.map(async function processFile(file) {
            const filePath = join(folder, file.name);
            const relativePath = filePath.substring(rootDir.length);

            if (filter && !filter(relativePath, file)) return;

            if (file.isDirectory()) {
                folders.add(filePath);
                return;
            }

            let pageUrl = relativePath
                .replace(/\/index\.html$/, '/');

            const statsKey = 'https://kotlinlang.org/' + pageUrl;

            pool.push([pageUrl, filePath, { pageViews: stats[statsKey] || 0 }]);
        }));
    }

    isPathsWalked = true;
    updatePoolState();

    await  finish

    // do safe for algolia record.
    // ToDo: if you want use tags in algolia drop it,
    //  but remember **ALL** key and values should be escaped in-place.
    for (const record of result) {
        for (const [key, val] of Object.entries(record)) {
            if (typeof val === 'string') {
                record[key] = val
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
        }
    }

    // `objectID` should be uniq for any record
    // if it isn't, it will be failed in push to algolia without extra description
    if (!result.every(isUnique))
        throw new Error(`Object ${id} isn't uniq`);

    return result;
}

/**
 * @param {IndexRecord} r
 * @param {number} i
 * @param {IndexRecord[]} list
 * @returns {boolean}
 */
function isUnique(r, i, list) {
    const id = r.objectID;

    for (let j = i + 1, length = list.length; j < length; j++) {
        if (list[j].objectID === id)
            return false;
    }

    return true;
}
