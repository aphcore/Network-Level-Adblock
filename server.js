const blacklist = [
    "doubleclick.net", //google ads
    "pagead2", //google ads
    "vungle.com", // 3rd party monetization & analytics
    "adrevenue", // ads
    "unityads", //unity ads
    "cdn.iads.unity3d.com", //unity ads
    'applovin.com', //3rd party ads
    'applvn.com', // ^^
    'mtgglobals.com', // unsure
    'mediation.unity3d.com', //unity ads
    'amazon-adsystem',
    'tapad.com',
    'innovid.com',
    'doubleverify.com',
    'openx.net',
    'adsrvr.org',
    'adsafeprotected',
    'appier',
    'rubiconproject',
    'ck-ie.com',
    'adsqtungsten',
    'smilewanted',
    'pippio.com',
    'admanmedia.com',
    'admixer.net',
    'smaato.net',
    'adtelligent.com',
    'adprime.com',
    'lijit.com',
    'bidr.io',
    'imcdn.com',
    'imcod.net',
    'tb.dapcerevis.shop',
    'oilwellsublot',
    'freezyquieten',
    'cogentcommunications.ru','aniskip.com','iconify.design','outhitcanius.shop','wingcutchuroya.top','blurtdocetic.shop',
    'uncalmgermane.top'
]
const whitelist = [

]

function isBlacklisted(hostname) {
    return blacklist.some(blocked => hostname.includes(blocked));
}

function isWhitelisted(hostname) {
    return whitelist.some(white => hostname.includes(white))
}

const http = require('http');
const net = require('net');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
    proxy.web(req, res, { target: req.url, changeOrigin: true }, (err) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Proxy error: ' + err.message);
        }
    });
});

server.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = new URL(`http://${req.url}`);
    if (!isWhitelisted(hostname) && isBlacklisted(hostname)) {
        console.log("BLOCKED:: "+hostname)
        clientSocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        clientSocket.end();
        return;
    }
    console.log(hostname)
    const serverSocket = net.connect(port || 443, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });
    serverSocket.on('error', (err) => {
        console.error('Server socket error:', err.message);
        clientSocket.end();
    });
    clientSocket.on('error', (err) => {
        console.error('Client socket error:', err.message);
        serverSocket.end();
    });
});

server.listen(8080, () => {
    console.log('Transparent proxy with HTTPS tunneling running on port 8080');
    const dns = require('node:dns');
    const os = require('node:os');
    const options = { family: 4 };
    dns.lookup(os.hostname(), options, (err, addr) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`IPv4 address: ${addr}`);
        }
    });
});
