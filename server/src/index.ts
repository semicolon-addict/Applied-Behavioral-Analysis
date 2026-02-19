///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Express server setup with CORS, JSON parsing, auth routes, and questionnaire routes
// Outcome: API server with auth endpoints and questionnaire CRUD operations
// Short Description: Main Express server entry point with auth routes and middleware registration
/////////////////////////////////////////////////////////////

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { questionnaireRoutes } from './routes/questionnaires';
import { authRoutes } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:9002', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questionnaires', questionnaireRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
