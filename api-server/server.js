import express from 'express';
import { NADC338 } from '../model/NAD-C338.js';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
dotenv.config({'path': './api-server/properties.env'});

const app = express();

const port = process.env.API_SERVER_LISTENER_PORT;
const ip = process.env.BLUOS_IP;
const bluOsPort = parseInt(process.env.BLUOS_TCP_PORT);
const keepAliveTimeout = parseInt(process.env.KEEPALIVE_TIMEOUT);
const headersTimeout   = parseInt(process.env.HEADERS_TIMEOUT);

// Load SSL certificate and private key
//const ca = fs.readFileSync('path/to/your/ca_bundle.crt', 'utf8');

const endpointKeyPath = "./keys/server.key";
const endpointCertPath = "./certs/server.crt";
const caPath = "./certs/server.crt";

const credentials = {
    key: fs.readFileSync(endpointKeyPath),
    cert: fs.readFileSync(endpointCertPath),
    ca: fs.readFileSync(caPath)
};
let nad = new NADC338(ip, bluOsPort);

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    // Set default security headers
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
app.use((req, res, next) => {
    // Add default cache control for modification endpoints
    if (req.method !== 'GET') {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }
    next();
});

// GET endpoints
// Frequently changing state - minimal cache
app.get('/power', async (req, res) => {
    try {
        const power = await nad.getPower();
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.json({ power });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/volume', async (req, res) => {
    try {
        const volume = await nad.getVolume();
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.json({ volume });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/source', async (req, res) => {
    try {
        const source = await nad.getSource();
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.json({ source });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/mute', async (req, res) => {
    try {
        const mute = await nad.getMute();
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.json({ mute });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Less frequently changing settings - short cache
app.get('/brightness', async (req, res) => {
    try {
        const brightness = await nad.getBrightness();
        res.set({
            'Cache-Control': 'public, max-age=5',
            'Vary': 'Accept-Encoding'
        });
        res.json({ brightness });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/bass', async (req, res) => {
    try {
        const bass = await nad.getBass();
        res.set({
            'Cache-Control': 'public, max-age=5',
            'Vary': 'Accept-Encoding'
        });
        res.json({ bass });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Configuration settings - longer cache
app.get('/auto-sense', async (req, res) => {
    try {
        const autoSense = await nad.getAutoSense();
        res.set({
            'Cache-Control': 'public, max-age=60',
            'Vary': 'Accept-Encoding'
        });
        res.json({ autoSense });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/auto-standby', async (req, res) => {
    try {
        const autoStandby = await nad.getAutoStandby();
        res.set({
            'Cache-Control': 'public, max-age=60',
            'Vary': 'Accept-Encoding'
        });
        res.json({ autoStandby });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST/PUT/PATCH/DELETE endpoints
app.post('/power', async (req, res) => {
    try {
        const { state } = req.body;
        if (state === 'On') {
            await nad.powerOn();
        } else if (state === 'Off') {
            await nad.powerOff();
        }
        const power = await nad.getPower();
        res.json({ power });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.patch('/power', async (req, res) => {
    try {
        const { state } = req.body;
        if (state === 'On') {
            await nad.powerOn();
        } else if (state === 'Off') {
            await nad.powerOff();
        }
        //const power = await nad.getPower();
        res.json({ state });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/volume', async (req, res) => {
    try {
        const { level } = req.body;
        await nad.setVolume(level);
        const volume = await nad.getVolume();
        res.json({ volume });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.patch('/volume', async (req, res) => {
    try {
        const { level } = req.body;
        await nad.setVolume(level);
        //const volume = await nad.getVolume();
        res.json({ level });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/source', async (req, res) => {
    try {
        const { source } = req.body;
        await nad.setSource(source);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/mute', async (req, res) => {
    try {
        await nad.setMute();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/unmute', async (req, res) => {
    try {
        await nad.unMute();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/brightness', async (req, res) => {
    try {
        const { level } = req.body;
        await nad.setBrightness(level);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/bass', async (req, res) => {
    try {
        await nad.setBass();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.patch('/bass', async (req, res) => {
    try {
        await nad.setBass();
        res.json({ bass: 'On' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/bass', async (req, res) => {
    try {
        await nad.unsetBass();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/auto-sense', async (req, res) => {
    try {
        await nad.setAutoSense();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/auto-sense', async (req, res) => {
    try {
        await nad.unsetAutoSense();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/auto-standby', async (req, res) => {
    try {
        await nad.setAutoStandby();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/auto-standby', async (req, res) => {
    try {
        await nad.unsetAutoStandby();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`HTTPS server running at https://localhost:${port}`);
});

httpsServer.keepAliveTimeout = keepAliveTimeout;
httpsServer.headersTimeout = headersTimeout;

app.set('timeout', keepAliveTimeout);