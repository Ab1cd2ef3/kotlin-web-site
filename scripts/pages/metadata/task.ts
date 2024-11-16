import { Opts } from '../lib/files/execTask.js';
import { getType } from '../lib/files/type.js';
import { Metadata } from './Metadata.js';

const send = process?.send?.bind(process) || (() => {
});

async function onMessage({ filePath, relativePath }: Opts) {
    const [type] = await getType(relativePath, filePath);
    const url = relativePath.replace(/\/index\.html$/g, '/');
    const data: Metadata = [url, { type }];

    send({ event: 'result', data });
}

process.on('message', onMessage);
send({ event: 'inited' });
