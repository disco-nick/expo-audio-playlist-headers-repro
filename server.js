// Serves assets/track.mp3, but only to requests that carry `X-Test-Header: 1`
// (anything else gets 403). Logs every request with its headers.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT ?? 3000;
const file = fs.readFileSync(path.join(__dirname, 'assets', 'track.mp3'));

http
  .createServer((req, res) => {
    res.on('finish', () => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.url} -> ${res.statusCode}`);
      console.log('  headers:', JSON.stringify(req.headers));
    });

    if (req.headers['x-test-header'] !== '1') {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('missing X-Test-Header\n');
    }

    // iOS probes with `Range: bytes=0-1` and expects a 206 back.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
    const start = range && range[1] !== '' ? Number(range[1]) : 0;
    const end = range && range[2] !== '' ? Math.min(Number(range[2]), file.length - 1) : file.length - 1;
    const headers = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 };
    if (range) headers['Content-Range'] = `bytes ${start}-${end}/${file.length}`;
    res.writeHead(range ? 206 : 200, headers);
    res.end(req.method === 'HEAD' ? undefined : file.subarray(start, end + 1));
  })
  .listen(PORT, '0.0.0.0', () => console.log(`listening on :${PORT}`));
