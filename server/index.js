require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const {
  isGraphServiceConfigured,
  fetchUsedRange,
  searchExcelFiles,
  getPublicConfig,
} = require('./graphService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(compression());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', graph: isGraphServiceConfigured() });
});

app.get('/api/products', (_req, res) => {
  res.json({ message: 'Product API ready — connect to frontend catalog' });
});

app.get('/api/excel/config', (_req, res) => {
  res.json(getPublicConfig());
});

app.get('/api/excel/files', async (_req, res) => {
  try {
    if (!isGraphServiceConfigured()) {
      return res.status(503).json({
        error: 'Server Graph credentials are not configured. See .env.example.',
      });
    }

    const files = await searchExcelFiles();
    res.json({ files });
  } catch (error) {
    console.error('GET /api/excel/files failed:', error);
    res.status(500).json({ error: error.message || 'Unable to list Excel files.' });
  }
});

app.get('/api/excel/live', async (req, res) => {
  try {
    if (!isGraphServiceConfigured()) {
      return res.status(503).json({
        error: 'Server Graph credentials are not configured. See .env.example.',
      });
    }

    const sheetName = typeof req.query.sheet === 'string' ? req.query.sheet : undefined;
    const fileId = typeof req.query.fileId === 'string' ? req.query.fileId : undefined;
    const result = await fetchUsedRange(sheetName, fileId);

    res.json({
      values: result.values ?? [],
      sheetName: sheetName || process.env.EXCEL_SHEET_NAME || 'Sheet1',
      fileId: fileId || process.env.EXCEL_FILE_ID || null,
    });
  } catch (error) {
    console.error('GET /api/excel/live failed:', error);
    res.status(500).json({ error: error.message || 'Unable to load live spreadsheet data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    isGraphServiceConfigured()
      ? 'Graph application credentials: configured'
      : 'Graph application credentials: missing (live Excel API disabled)',
  );
});
