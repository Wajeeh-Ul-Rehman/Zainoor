require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const { initSocket } = require('./utils/socket');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // serves uploaded product images

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Change 5000 to 5001
const PORT = process.env.PORT || 5001;

// Wrapped in a plain http server (instead of app.listen directly) so
// Socket.io can attach to the same server and share port 5001.
const server = http.createServer(app);
initSocket(server);

const submissionRoutes = require('./routes/submissionRoutes');
app.use('/api/submissions', submissionRoutes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));