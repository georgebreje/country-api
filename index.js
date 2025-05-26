import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.use((req, res, next) => {
  const clientKey = req.header('x-api-key');
  if (clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  next();
});

app.get('/country/:countryCode', async (req, res) => {
  const { countryCode } = req.params;
  const filePath = path.join(__dirname, 'CountryBoundaries', `${countryCode}.json`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(fileContent);
    res.json(json);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Country data not found' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

const PORT = process.env.PORT || 3000; // Use the port assigned by Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});