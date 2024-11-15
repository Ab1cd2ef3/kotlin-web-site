import { Opts } from '../lib/files/execTask';
import { getType } from '../lib/files/type';
import { Metadata } from './Metadata';

const send = process?.send?.bind(process) || (() => {
});

async function onMessage({ filePath, relativePath }: Opts) {
    const [type] = await getType(relativePath, filePath);
    const url = relativePath.replace(/\/index\.html$/g, '/');
    const data: Metadata = [url, type];

    send({ event: 'result', data });
}

process.on('message', onMessage);
send({ event: 'inited' });
