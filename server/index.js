const express = require('express');
const cors = require('cors');
const os = require('os'); 
require('dotenv').config();
const connectDB = require('./db'); 

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth'); 
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories'); 
const savingsRoutes = require('./routes/savings');
// BAGONG ADD: Route para sa Fixed Bill Splitting at Flexible Goal Tracking
const eventRoutes = require('./routes/events'); 

const app = express();

// --- CONNECT TO MONGODB ---
connectDB();

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 

// --- ROUTES REGISTRATION ---
app.use('/api/auth', authRoutes); 
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/savings', savingsRoutes);
// BAGONG ADD: Dito papasok ang lahat ng requests na may kaugnayan sa Group Events
app.use('/api/events', eventRoutes); 

// Main Test Route
app.get('/', (req, res) => {
    res.send('🚀 ExpensePal Backend is fully operational with MongoDB!');
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

const PORT = process.env.PORT || 5000;

// --- DYNAMIC IP DETECTION ---
const getNetworkIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
};

const networkIP = getNetworkIP();

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying with MongoDB!`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${networkIP}:${PORT}`);
});