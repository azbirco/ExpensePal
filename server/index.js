const express = require('express');
const cors = require('cors');
const os = require('os'); 
require('dotenv').config();
const connectDB = require('./db'); 

// Import Routes
const authRoutes = require('./routes/auth'); 
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories'); 
const savingsRoutes = require('./routes/savings');

const app = express();

// --- CONNECT TO MONGODB ---
connectDB(); 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/savings', savingsRoutes);

// ITO ANG BINALIK NATIN:
app.get('/', (req, res) => {
    res.send('🚀 ExpensePal Backend is fully operational with MongoDB!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying with MongoDB!`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${networkIP}:${PORT}`);
});