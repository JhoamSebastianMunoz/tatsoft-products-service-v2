import express from "express";
import bodyParser from 'body-parser';
import YAML from "yamljs";
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Legacy routes removed - API v2 only

// Import Scalar for API documentation
import { apiReference } from '@scalar/express-api-reference';

// V2 API Routes
import productsV2 from './routes/v2/products';
import categoriesV2 from './routes/v2/categories';
import imagesV2 from './routes/v2/images';
import stockV2 from './routes/v2/stock';
import reportsV2 from './routes/v2/reports';

import dotenv from "dotenv";
dotenv.config();

const app = express().use(bodyParser.json());
// Cargar archivo YAML de OpenAPI
const swaggerPath = path.resolve(__dirname, "./swagger.yaml");
const swaggerPathAlt = path.resolve(__dirname, "../swagger.yaml");
const swaggerPathUsed = fs.existsSync(swaggerPath) ? swaggerPath : swaggerPathAlt;

let swaggerDocument;
try {
  swaggerDocument = YAML.load(swaggerPathUsed);
} catch (error) {
  console.error('Error loading swagger.yaml:', error);
  swaggerDocument = { openapi: "3.0.0", info: { title: "Error", version: "1.0.0" }, paths: {} };
}

// Serve swagger.yaml as a separate endpoint for Vercel compatibility
app.get('/swagger.yaml', (req, res) => {
  const finalPath = fs.existsSync(swaggerPath) ? swaggerPath : swaggerPathAlt;
  
  if (fs.existsSync(finalPath)) {
    res.sendFile(finalPath);
  } else {
    res.status(404).json({ error: 'swagger.yaml not found' });
  }
});

// Serve OpenAPI spec as JSON for Scalar documentation
app.get('/api-docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// Serve API Documentation with Scalar
app.use('/api-docs', apiReference({
  spec: {
    url: '/api-docs-json',
  },
  theme: 'default',
  layout: 'modern',
}));

const SERVICE_VERSION = '2.0.0';

// Healthcheck dedicado para monitoreo (Vercel, probes, balanceadores)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'tatsoft-products-service',
    version: SERVICE_VERSION,
    status: 'running',
    endpoints: {
      docs: '/api-docs',
      docsJson: '/api-docs-json',
      health: '/health',
      api: '/api/v2',
    },
  });
});

const allowedOrigins = [
  'http://localhost:10102',
  'http://localhost:5173',  // Frontend en desarrollo
  'https://microservice-backend-products-v2.vercel.app' // despliegue en Vercel
];
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
};
app.use(cors(corsOptions));

// API v2 Routes - RESTful naming conventions
app.use('/api/v2/products', productsV2);
app.use('/api/v2/categories', categoriesV2);
app.use('/api/v2/images', imagesV2);
app.use('/api/v2/stock', stockV2);
app.use('/api/v2/reports', reportsV2);

// Legacy routes removed - API v2 only


// Configuración del puerto por donde correrá la aplicación
const PORT = process.env.PORT || 10102;

// Solo iniciar servidor en desarrollo (no en serverless/Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log("Servidor ejecutándose en el puerto: ", PORT);
  }).on("error", (error) => {
    throw new Error(error.message);
  });
}

export default app;
