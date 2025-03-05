import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/sqlServer';
import userRoutes from './routes/userRoutes';
import incidentRoutes from './routes/incidentRoutes';
import pollRoutes from './routes/pollRoutes';
import billsRoutes from './routes/billsRoutes';
import chatRoutes from './routes/chatRoutes';
import { setupScheduledTasks } from './utils/scheduledTasks';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/chat', chatRoutes);

// Setup scheduled tasks
setupScheduledTasks();

const PORT = process.env.PORT || 8085;

const startServer = async () => {
    try {
        // Connect to SQL Server
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on  http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();