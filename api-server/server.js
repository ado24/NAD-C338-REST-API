import express from 'express';
import { NADC338 } from '../model/NAD-C338.js';

const app = express();
const port = 3000;


app.use(express.json());
let nad = new NADC338("10.0.0.251");

// GET endpoints
app.get('/power', async (req, res) => {
    try {
        const power = await nad.getPower();
        res.json({ power });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/volume', async (req, res) => {
    try {
        const volume = await nad.getVolume();
        res.json({ volume });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/source', async (req, res) => {
    try {
        const source = await nad.getSource();
        res.json({ source });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/mute', async (req, res) => {
    try {
        const mute = await nad.getMute();
        res.json({ mute });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/brightness', async (req, res) => {
    try {
        const brightness = await nad.getBrightness();
        res.json({ brightness });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/bass', async (req, res) => {
    try {
        const bass = await nad.getBass();
        res.json({ bass });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/auto-sense', async (req, res) => {
    try {
        const autoSense = await nad.getAutoSense();
        res.json({ autoSense });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/auto-standby', async (req, res) => {
    try {
        const autoStandby = await nad.getAutoStandby();
        res.json({ autoStandby });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST/PUT endpoints
app.post('/power', async (req, res) => {
    try {
        const { state } = req.body;
        if (state === 'On') {
            await nad.powerOn();
        } else if (state === 'Off') {
            await nad.powerOff();
        }
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/volume', async (req, res) => {
    try {
        const { level } = req.body;
        await nad.setVolume(level);
        res.sendStatus(200);
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

app.listen(port, () => {
    console.log(`Node.js server running at http://localhost:${port}`);
});