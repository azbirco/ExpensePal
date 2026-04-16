const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); 

const authRoutes = require('./routes/auth'); 
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories'); 
const savingsRoutes = require('./routes/savings');

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/savings', savingsRoutes);

app.get('/', (req, res) => {
    res.send('🚀 ExpensePal Backend is fully operational!');
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// '0.0.0.0' allows the server to accept connections from any IP in the network
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying!`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Network: http://192.168.1.33:${PORT}`);
});