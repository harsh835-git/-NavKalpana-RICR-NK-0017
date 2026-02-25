const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:3001', 'http://127.0.0.1:3001'].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin/analytics', require('./routes/analytics'));
app.use('/api/admin/users', require('./routes/users'));
app.use('/api/admin/static-data', require('./routes/staticData'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitai')
  .then(() => console.log('Admin: MongoDB connected'))
  .catch(err => console.error('Admin: MongoDB error:', err));

const PORT = process.env.PORT || 5051;
app.listen(PORT, () => console.log(`Admin server running on port ${PORT}`));
