import http from 'http';
import net from 'net';

let client;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000; // 5 seconds
const maxListeners = 30;

const errorCodes = ["ECONNRESET", "ECONNREFUSED", "ENETUNREACH", "ETIMEDOUT"];

const connectToServer = async (ip, port) => {
    return new Promise((resolve, reject) => {
        client = net.createConnection({ port: port, host: ip }, () => {
            client.setMaxListeners(maxListeners);
            console.log(`Connected to ${ip}:${port}`);
            reconnectAttempts = 0; // Reset attempts on successful connection
            resolve(client);
        });

        client.on('error', err => {
            if (errorCodes.includes(err.code)) {
                console.error(`Connection error: ${err.message}`);
                client.destroy();
                attemptReconnect(ip, port);
            } else {
                console.error(`Error: ${err}`);
                reject(err);
            }
        });

        client.on('close', () => {
            console.log('Connection closed');
        });
    });
};

const attemptReconnect = (ip, port) => {
    if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`Reconnection attempt ${++reconnectAttempts}...`);
        setTimeout(() => connectToServer(ip, port), reconnectInterval);
    } else {
        console.error('Max reconnection attempts reached. Giving up.');
    }
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
