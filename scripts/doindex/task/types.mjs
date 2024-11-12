import { loadFile } from '../lib/html.mjs';

/**
 * @param url {string}
 * @param file {string}
 * @returns {Promise<[string, import('cheerio').CheerioAPI|null]>}
 */
export async function getType(url, file) {
    if (url.endsWith('/package-list') || url.endsWith('index.yml')) return ['File_Text', null];
    if (url.endsWith('.pdf')) return ['File_Pdf', null];
    if (url.endsWith('.zip')) return ['File_Archive', null];
    if (url.endsWith('.js') || url.endsWith('.css')) return ['File_Asset', null];
    if (url.endsWith('.woff') || url.endsWith('.woff2') || url.endsWith('.ttf')) return ['File_Font', null];

    if (url.endsWith('.json') || url.endsWith('.xml') || url.endsWith('.txt'))
        return [url.toLowerCase().includes('license') && url.endsWith('.txt') ? 'File_License' : 'File_Data', null];

    if (
        url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp') ||
        url.endsWith('.svg') || url.endsWith('.ico') || url.endsWith('.gif')
    ) return ['File_Image', null];

    let pageType = 'Unknown';
    let $ = null;

    if (url.endsWith('/') || url.endsWith('.html')) {
        pageType = 'Page_Undetected';

        $ = await loadFile(file);

        if ($('meta[http-equiv=refresh]').length)
            return ['Redirect', $];

        if ($('meta[name=robots][content=noindex]').length)
            return ['Hidden', $];

        if (url === '404.html' || url === '404/') return ['Page_NotFound', $];
        if (url.startsWith('spec/')) return ['Page_Spec', $];
        if (url === 'docs/reference/grammar.html') return ['Page_Grammar', $];

        if (url.startsWith('api/')) {
            if (url.startsWith('api/latest/')) pageType = url.includes('jvm/stdlib') ? 'Page_API_stdlib' : 'Page_API_test';
            // else if (url.endsWith('/navigation.html')) return ['Page_Iframe', $];
            else if (url.includes('/older/')) return ['Page_API_OldVersion', $];
            else pageType = 'Page_API';
        }

        if (url.startsWith('community/')) pageType = 'Page_Community';

        if ($('body[data-article-props]').length)
            pageType = 'Page_Documentation';

        if ($('.global-content > article.page-content[role="main"]').length)
            pageType = 'Page_LegacyDocumentation';
    }

    return [pageType, $];
}
