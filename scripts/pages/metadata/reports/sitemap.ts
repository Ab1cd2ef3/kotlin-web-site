import { Metadata } from '../Metadata';

export async function makeSitemap(list: Metadata[]) {
    const urls = await Promise.all(list.map(async ([path, metadata]) => {
        if (!metadata.startsWith('Page')) return '';
        return `  <url><loc>https://kotlinlang.org/${path}</loc><priority>1</priority></url>\n`;
    }));

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.join('') +
        '</urlset>'
    );
}
