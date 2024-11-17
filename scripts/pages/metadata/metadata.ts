import { FileType } from '../lib/files/type.js';
import { SearchRecord } from '../lib/search/records.js';

export type Metadata = [string, { type: FileType, records: SearchRecord[] }];
