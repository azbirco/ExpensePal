const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db'); // Pinalitan ang 'db' ng connection function para sa MongoDB

// Import Routes
const authRoutes = require('./routes/auth'); 
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories'); 
const savingsRoutes = require('./routes/savings');

const app = express();

// --- CONNECT TO MONGODB ---
// Tinatawag ang function para kumonekta sa MongoDB Atlas bago mag-start ang server
connectDB(); 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/savings', savingsRoutes);

app.get('/', (req, res) => {
    res.send('🚀 ExpensePal Backend is fully operational with MongoDB!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Ang '0.0.0.0' ay pinanatili para ma-access ang server mo sa ibang devices (tulad ng phone)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying with MongoDB!`);
    console.log(`🏠 Local:   http://localhost:${PORT}`);
    // Tandaan: I-verify kung tama pa rin ang IP address na ito sa iyong network
    console.log(`🌐 Network: http://192.168.137.160:${PORT}`); 
});