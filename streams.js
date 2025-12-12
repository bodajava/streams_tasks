// //1
// const fs = require('node:fs');
// const path = require('node:path');
// const filePath = path.resolve('./data.text');

// const readStream = fs.createReadStream(filePath, {
//     encoding: 'utf8'
// });
// readStream.on('open', (fd) => {
//     console.log({ ms: 'stream is open', fd });
//     console.log('===================================================');
// });

// readStream.on('readable', () => {
//     console.log({ ms: 'readable event fired' });

// });

// readStream.on('data', (chunk) => {
//     console.log('================ DATA EVENT ===================');
//     console.log({ chunk });
//     console.log('===============================================');
// });

// readStream.on('end', () => {
//     console.error('file reading complete');
// });

// readStream.on('ready', () => {
//     console.error({ ms: 'ready' });
// });

// readStream.on('error', (err) => {
//     console.error('Error:', err);
// });
//2
// const path = require('node:path');
// const fs = require('node:fs');

// const sourcePath = path.resolve('./sor.text');
// const destPath = path.resolve('./dest.text');

// const readableStream = fs.createReadStream(sourcePath);
// const writeStream = fs.createWriteStream(destPath);


// readableStream.pipe(writeStream);

// writeStream.on('finish', () => {
//     console.log('File copied using streams');
// });

// writeStream.on('error', (err) => {
//     console.error('Write error:', err);
// });
//3
// const fs = require('fs');
// const zlib = require('zlib');
// const { pipeline } = require('stream');
// const path = require('path');
// const inputPath = path.resolve('./data.txt');
// const outputPath = path.resolve('./data.txt.gz');

// const gzip = zlib.createGzip();
// const source = fs.createReadStream(inputPath);
// const destination = fs.createWriteStream(outputPath);

// pipeline(
//     source,
//     gzip,
//     destination,
//     (err) => {
//         if (err) {
//             console.error('Pipeline failed.', err.message);
//         } else {
//             console.log('File successfully compressed.');
//         }
//     }
// );
