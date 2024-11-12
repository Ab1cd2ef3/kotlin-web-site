import { load } from 'cheerio';
import { readFile } from 'node:fs/promises';
import { Element } from 'domhandler';

/** @typedef {import('domhandler').Node} Node */

/**
 * @template {Node} TNode
 * @param {TNode} [node]
 * @returns {Element|null}
 */
export function nextElement(node) {
    let result = node;
    do {
        result = result?.nextSibling || null;
    }
    while (node && !(node instanceof Element));
    return result;
}

/**
 * @template {Node} TNode
 * @param {TNode} node
 * @param {(el: Element) => boolean} test
 * @param {'previous' | 'next'} direction
 * @returns {Element|null}
 */
function findElementWith(direction, node, test) {
    const prop = direction + 'Sibling';
    let result = null;

    let candidate = node;
    while (candidate[prop]) {
        candidate = candidate[prop];
        if (candidate instanceof Element && test(candidate)) {
            result = candidate;
            break;
        }
    }

    return result;
}

/**
 * @template {Node} TNode
 * @param {TNode} node
 * @param {(el: Element) => boolean} test
 * @returns {Element|null}
 */
export function findPrevElementWith(node, test) {
    return findElementWith('previous', node, test);
}

/**
 * @template {Node} TNode
 * @param {TNode} node
 * @param {(el: Element) => boolean} test
 * @returns {Element|null}
 */
export function findNextElementWith(node, test) {
    return findElementWith('next', node, test);
}

/**
 * @param text
 */
export async function loadText(text) {
    return load(text, { xml: false });
}

/**
 * @param {string} file
 */
export async function loadFile(file) {
    return await loadText(await readFile(file));
}

/**
 * @param {import('cheerio').Element} node
 */
function cloneAttrsString(node) {
    return Object.entries((node.attribs || {})).map(([key, value]) => {
        const val = typeof value === 'string' ? `="${value}"` : '';
        return `${key}${val}`;
    }).join(' ');
}

/**
 * @param {import('cheerio').Cheerio} article
 * @param {string} selector
 * @param {($node: import('cheerio').Cheerio<Element>, attrs: string, content: string) => string} cb
 */
export function replaceNode(article, selector, cb) {
    const listStrong = article.find(selector);

    for (let i = 0, length = listStrong.length; i < length; i++) {
        const $node = listStrong.eq(i);
        const newNode = cb($node, cloneAttrsString(listStrong[i]), $node.html());
        if (newNode) $node.replaceWith(newNode);
    }
}

