// Returns 403 unless the request carries `X-Test-Header: 1`. Logs every request.
const http = require('node:http');

const PORT = 3000;

// 3 s, 440 Hz, 16-bit mono WAV, generated in memory so no binary file is needed.
function makeWav() {
  const rate = 8000;
  const samples = rate * 3;
  const buf = Buffer.alloc(44 + samples * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 8000), 44 + i * 2);
  }
  return buf;
}

const wav = makeWav();

http
  .createServer((req, res) => {
    const ok = req.headers['x-test-header'] === '1';
    res.on('finish', () => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.url} -> ${res.statusCode}`);
      console.log('  headers:', JSON.stringify(req.headers));
    });
    if (!ok) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('missing X-Test-Header\n');
    }
    // AVPlayer probes with `Range: bytes=0-1` and expects a 206 back.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
    let start = 0;
    let end = wav.length - 1;
    if (range) {
      if (range[1] !== '') start = Number(range[1]);
      if (range[2] !== '') end = Math.min(Number(range[2]), wav.length - 1);
    }
    const headers = { 'Content-Type': 'audio/wav', 'Accept-Ranges': 'bytes' };
    if (range) {
      res.writeHead(206, {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${wav.length}`,
        'Content-Length': end - start + 1,
      });
    } else {
      res.writeHead(200, { ...headers, 'Content-Length': wav.length });
    }
    res.end(req.method === 'HEAD' ? undefined : wav.subarray(start, end + 1));
  })
  .listen(PORT, '0.0.0.0', () => console.log(`listening on :${PORT}`));
