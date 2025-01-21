const http = require('http');
const net = require('net');

let client = null;

const connectToServer = (ip, port) => {
    return new Promise((resolve, reject) => {
        client = net.createConnection({ port: port, host: ip }, () => {
            client.setMaxListeners(20);
            console.log(`Connected to ${ip}:${port}`);
            resolve(client);
        });

        client.on('error', err => {
            console.error(`Error: ${err}`);
            reject(err);
        });

        client.on('close', () => {
            console.log('Connection closed');
        });
    });
};

const requestHandler = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { ip, port, cmd } = JSON.parse(body);

            if (!client) {
                try {
                    await connectToServer(ip, port);
                } catch (err) {
                    res.statusCode = 500;
                    res.end('Error: ' + err.message);
                    return;
                }
            }

            client.write(cmd + '\n');

            client.on('data', data => {
                res.end(data.toString());
            });

            client.on('error', err => {
                res.statusCode = 500;
                console.error(`Error: ${err}`);
                res.end('Error: ' + err.message);
            });
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
};

const server = http.createServer(requestHandler);

server.listen(30001, '0.0.0.0', () => {
    console.log('Server is listening on port 30001');
});

process.on('SIGINT', () => {
    if (client) {
        client.end();
        console.log('TCP connection closed');
    }
    process.exit();
});
