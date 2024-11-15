import { Cheerio, load } from 'cheerio';
import { AnyNode, Element, Node } from 'domhandler';
import { readFile } from 'node:fs/promises';

export function nextElement(node?: Node): Element | null {
    let result: Node | undefined | null = node;

    do {
        result = result?.nextSibling;
    }
    while (result && !(result instanceof Element));

    return result instanceof Element ? result : null;
}

function findElementWith(direction: 'previous' | 'next', node: Node, test: (el: Element) => boolean): Element | null {
    const prop = direction === 'previous' ? 'previousSibling' : 'nextSibling';
    let result = null;

    let candidate: Node | null = node;
    while (candidate?.[prop]) {
        candidate = candidate[prop];
        if (candidate instanceof Element && test(candidate)) {
            result = candidate;
            break;
        }
    }

    return result;
}

export function findPrevElementWith(node: Node, test: (el: Element) => boolean): Element | null {
    return findElementWith('previous', node, test);
}

export function findNextElementWith(node: Node, test: (el: Element) => boolean): Element | null {
    return findElementWith('next', node, test);
}

export async function loadText(text: Parameters<typeof load>[0]) {
    return load(text, { xml: false });
}

export async function loadFile(file: string) {
    return await loadText(await readFile(file));
}

function cloneAttrsString(node: Element) {
    return Object.entries((node.attribs || {})).map(([key, value]) => {
        const val = typeof value === 'string' ? `="${value}"` : '';
        return `${key}${val}`;
    }).join(' ');

}

export function replaceNode(
    article: Cheerio<AnyNode>,
    selector: string,
    cb: ($node: Cheerio<AnyNode>, attrs: string, content: string) => string
) {
    const listStrong = article.find(selector);

    for (let i = 0, length = listStrong.length; i < length; i++) {
        const $node = listStrong.eq(i);
        const newNode = cb($node, cloneAttrsString(listStrong[i]), $node.html() || '');
        if (newNode) $node.replaceWith(newNode);
    }
}
