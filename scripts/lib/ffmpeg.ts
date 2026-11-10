// Path to the bundled ffmpeg binary (ffmpeg-static ships CJS typings, so load it via require).
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const bin = require('ffmpeg-static') as string | null;
if (!bin) throw new Error('ffmpeg-static binary missing — run: npm rebuild ffmpeg-static');

export const FFMPEG: string = bin;
