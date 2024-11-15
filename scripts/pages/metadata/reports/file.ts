import { Metadata } from '../Metadata';

export async function makeFileReport(list: Metadata[]) {
    return JSON.stringify(Object.fromEntries(list));
}
