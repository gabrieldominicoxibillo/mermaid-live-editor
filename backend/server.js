const express = require('express');
const cors = require('cors');
const path = require('path');
const diagramRoutes = require('./routes/diagram');
const exportRoutes = require('./routes/export');
const FileUtils = require('./utils/fileUtils');
const config = require('./config/config');

const app = express();
const PORT = config.PORT;

// Initialize temp directory
FileUtils.createTempDirectory();

// Middleware
app.use(cors());
app.use(express.json({ limit: config.MAX_FILE_SIZE }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/diagram', diagramRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run npm run build first.');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Mermaid Editor available at http://localhost:${PORT}`);
});

module.exports = app;
