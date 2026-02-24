const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS - allow frontend origin
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Handle preflight requests

app.use(express.json());


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/workout', require('./routes/workout'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/habit', require('./routes/habit'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitai')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5050;
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
