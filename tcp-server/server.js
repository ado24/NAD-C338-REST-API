import http from 'http';
import net from 'net';
import dotenv from 'dotenv';
dotenv.config({'path': './tcp-server/properties.env'});

let client;
let reconnectAttempts = 0;

const nadTcpPort = parseInt(process.env.NAD_TCP_PORT);
const maxReconnectAttempts = process.env.MAX_RECONNECT_ATTEMPTS;
const reconnectInterval = process.env.RECONNECT_INTERVAL; // 5 seconds
const maxListeners = parseInt(process.env.MAX_LISTENERS);
const serverListenerIp = process.env.SERVER_LISTENER_IP;
const logLevel = process.env.LOG_LEVEL;

const errorCodes = ["ECONNRESET", "ECONNREFUSED", "ENETUNREACH", "ETIMEDOUT"];

export const connectToServer = async (ip, port) => {
    return new Promise((resolve, reject) => {
        client = net.createConnection({ port: port, host: ip }, () => {
            client.setMaxListeners(maxListeners);
            if (logLevel !== "none")
                console.log(`Connected to ${ip}:${port}`);
            reconnectAttempts = 0; // Reset attempts on successful connection
            resolve(client);
        });

        client.on('error', /** @param {Error & { code?: string }} err */ err => {
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
            if (logLevel !== "none")
                console.log('Connection closed');
        });
    });
};

export const attemptReconnect = (ip, port) => {
    if (reconnectAttempts < maxReconnectAttempts) {
        if (logLevel !== "none")
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

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
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

            // Remove existing listeners to avoid adding multiple listeners
            client.removeAllListeners('data');
            client.removeAllListeners('error');

            client.once('data', data => {
                res.end(data.toString());
            });

            client.once('error', err => {
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

server.listen(nadTcpPort, serverListenerIp, () => {
    if (logLevel !== "none")
        console.log(`TCP server running at ${serverListenerIp}:${nadTcpPort}`);
});

process.on('SIGINT', () => {
    if (client) {
        client.end();
        if (logLevel !== "none")
            console.log('TCP connection closed');
    }
    process.exit();
});
