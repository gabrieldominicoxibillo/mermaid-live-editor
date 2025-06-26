# Mermaid Diagram Editor - Documentation V2
## Complete System Requirements & Rebuild Guide

*Last Updated: June 26, 2025*

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technical Requirements](#technical-requirements)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Complete Setup Guide](#complete-setup-guide)
5. [Configuration Management](#configuration-management)
6. [Production Deployment](#production-deployment)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)
9. [Monitoring & Logging](#monitoring--logging)
10. [Scaling & Load Balancing](#scaling--load-balancing)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Future Enhancements](#future-enhancements)

---

## 🎯 System Overview

### Core Functionality
- **Real-time Mermaid diagram editor** with live preview
- **Multi-format export** (PNG, SVG, PDF) with quality presets
- **Syntax validation** with detailed error reporting
- **Theme support** and customization options
- **Responsive web interface** for desktop and mobile

### Technology Stack
```
Frontend: React 18 + Monaco Editor + Webpack 5
Backend: Node.js 18+ + Express 4 + Mermaid CLI 10+
Process: Puppeteer + Chrome Headless
Storage: Temporary file system (auto-cleanup)
```

---

## 🔧 Technical Requirements

### Minimum System Requirements

#### Development Environment
```yaml
OS: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
Node.js: 16.x or higher (LTS recommended)
RAM: 4GB minimum, 8GB recommended
Disk: 2GB free space
Chrome/Chromium: Latest version (for Puppeteer)
```

#### Production Environment
```yaml
OS: Linux (Ubuntu 20.04+ recommended)
Node.js: 18.x LTS
RAM: 8GB minimum, 16GB recommended
CPU: 2+ cores
Disk: 10GB free space
Network: High-speed internet for CLI downloads
```

### Essential Dependencies

#### Backend Core Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "@mermaid-js/mermaid-cli": "^10.6.1",
  "puppeteer": "^21.5.2",
  "multer": "^1.4.5-lts.1",
  "uuid": "^9.0.1"
}
```

#### Frontend Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "monaco-editor": "^0.44.0",
  "monaco-editor-webpack-plugin": "^7.1.0"
}
```

#### Build Tools & Development
```json
{
  "@babel/core": "^7.23.6",
  "@babel/preset-react": "^7.23.3",
  "webpack": "^5.89.0",
  "webpack-dev-server": "^4.15.1",
  "concurrently": "^7.6.0",
  "nodemon": "^3.0.2"
}
```

---

## 🏗️ Architecture Deep Dive

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │  Frontend App   │    │  Backend API    │
│                 │    │                 │    │                 │
│ Monaco Editor   │◄──►│ React Components│◄──►│ Express Routes  │
│ Preview Panel   │    │ State Management│    │ Mermaid Service │
│ Export Dialog   │    │ API Client      │    │ Export Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                               │
                                               ▼
                        ┌─────────────────────────────────────────┐
                        │         External Services               │
                        │                                         │
                        │ @mermaid-js/mermaid-cli                │
                        │ Puppeteer + Chrome Headless            │
                        │ File System (temp files)               │
                        └─────────────────────────────────────────┘
```

### Data Flow
```
1. User types code → Monaco Editor
2. Debounced validation → Backend API
3. Syntax check → Mermaid CLI validation
4. If valid → Render request → Mermaid CLI
5. Generated SVG → Base64 encoding → Frontend
6. Display in preview → Image element
7. Export request → Quality processing → File download
```

### Component Hierarchy
```
App
├── Header
│   ├── Title & Status
│   └── ExportPanel
│       ├── Example Loader
│       └── Export Dialog
├── Main Content
│   ├── Editor Section
│   │   ├── Editor Header
│   │   ├── Monaco Editor
│   │   └── Editor Footer
│   └── Preview Section
│       ├── Preview Header
│       ├── Preview Content
│       └── Preview Footer
```

---

## 🚀 Complete Setup Guide

### 1. Project Initialization

#### Create Project Structure
```bash
mkdir mermaid-diagram-editor
cd mermaid-diagram-editor

# Initialize root package.json
npm init -y

# Create directory structure
mkdir -p backend/{config,routes,services,utils,temp}
mkdir -p frontend/{src/{components,services,styles},public}
```

#### Root Package.json Configuration
```json
{
  "name": "mermaid-diagram-editor",
  "version": "1.0.0",
  "description": "Real-time Mermaid diagram editor",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && nodemon server.js",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "start": "cd backend && node server.js",
    "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "clean": "rm -rf backend/temp/* && rm -rf frontend/dist",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

### 2. Backend Setup

#### Backend Package.json
```json
{
  "name": "mermaid-editor-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@mermaid-js/mermaid-cli": "^10.6.1",
    "puppeteer": "^21.5.2",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "eslint": "^8.57.0"
  }
}
```

#### Essential Backend Files

**server.js** (Main server file)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const diagramRoutes = require('./routes/diagram');
const exportRoutes = require('./routes/export');
const FileUtils = require('./utils/fileUtils');
const config = require('./config/config');
const logger = require('./utils/logger');

const app = express();
const PORT = config.PORT;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: config.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true, limit: config.MAX_FILE_SIZE }));

// Initialize temp directory
FileUtils.createTempDirectory();

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// API routes
app.use('/api/diagram', diagramRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Serve static files (production)
if (config.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: config.NODE_ENV === 'production' ? 
      'Internal server error' : 
      error.message
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Mermaid Editor API ready`);
});
```

### 3. Frontend Setup

#### Frontend Package.json
```json
{
  "name": "mermaid-editor-frontend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development --open",
    "analyze": "webpack-bundle-analyzer dist/static/js/*.js",
    "test": "jest",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "monaco-editor": "^0.44.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.6",
    "@babel/preset-react": "^7.23.3",
    "@babel/preset-env": "^7.23.6",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^3.3.3",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "monaco-editor-webpack-plugin": "^7.1.0",
    "webpack-bundle-analyzer": "^4.10.1",
    "jest": "^29.7.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.33.2"
  }
}
```

#### Webpack Configuration
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 
        'static/js/[name].[contenthash].js' : 
        'static/js/[name].js',
      clean: true,
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.ttf$/,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Mermaid Diagram Editor',
        minify: isProduction
      }),
      new MonacoWebpackPlugin({
        languages: ['javascript', 'typescript', 'markdown']
      })
    ],
    devServer: {
      port: 3002,
      historyApiFallback: true,
      hot: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    optimization: isProduction ? {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          monaco: {
            test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
            name: 'monaco',
            chunks: 'all'
          }
        }
      }
    } : {}
  };
};
```

---

## ⚙️ Configuration Management

### Environment Variables

#### Backend `.env` File
```env
# Server Configuration
PORT=3001
NODE_ENV=development
HOST=localhost

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGINS=http://localhost:3002,https://yourdomain.com

# File Handling
MAX_FILE_SIZE=10mb
TEMP_DIR=./temp
CLEANUP_INTERVAL=3600000

# Mermaid Configuration
DEFAULT_THEME=default
DEFAULT_WIDTH=1200
DEFAULT_HEIGHT=800
DEFAULT_SCALE=1
RENDER_TIMEOUT=30000

# Puppeteer Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

#### Production Configuration
```env
# Production Environment
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Security (Use strong, unique values)
JWT_SECRET=super-secure-production-secret-key-256-bits
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Performance
MAX_FILE_SIZE=50mb
RENDER_TIMEOUT=60000
CLEANUP_INTERVAL=1800000

# Monitoring
LOG_LEVEL=warn
LOG_FILE=/var/log/mermaid-editor/app.log

# Database (if adding persistence)
DATABASE_URL=postgresql://user:password@localhost:5432/mermaid_editor

# CDN (if using)
CDN_BASE_URL=https://cdn.yourdomain.com
ASSET_PREFIX=https://cdn.yourdomain.com/mermaid-editor
```

### Configuration Files Structure

#### Backend Config (`backend/config/config.js`)
```javascript
const path = require('path');

const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || 'localhost',
  
  // Security
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3002',
    'http://localhost:3000'
  ],
  
  // File handling
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  TEMP_DIR: process.env.TEMP_DIR || path.join(__dirname, '../temp'),
  CLEANUP_INTERVAL: parseInt(process.env.CLEANUP_INTERVAL) || 3600000,
  
  // Mermaid defaults
  DEFAULT_THEME: process.env.DEFAULT_THEME || 'default',
  DEFAULT_WIDTH: parseInt(process.env.DEFAULT_WIDTH) || 1200,
  DEFAULT_HEIGHT: parseInt(process.env.DEFAULT_HEIGHT) || 800,
  DEFAULT_SCALE: parseFloat(process.env.DEFAULT_SCALE) || 1,
  RENDER_TIMEOUT: parseInt(process.env.RENDER_TIMEOUT) || 30000,
  
  // Quality presets
  QUALITY_PRESETS: {
    low: { width: 800, height: 600, scale: 1 },
    medium: { width: 1200, height: 800, scale: 1.5 },
    high: { width: 1920, height: 1080, scale: 2 },
    ultra: { width: 3840, height: 2160, scale: 3 }
  },
  
  // Supported options
  SUPPORTED_FORMATS: ['svg', 'png', 'pdf'],
  SUPPORTED_THEMES: ['default', 'dark', 'forest', 'neutral'],
  
  // Content types
  CONTENT_TYPES: {
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'pdf': 'application/pdf'
  },
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },
  
  // Puppeteer
  PUPPETEER_CONFIG: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: process.env.PUPPETEER_ARGS?.split(',') || ['--no-sandbox'],
    headless: true,
    timeout: 30000
  }
};

module.exports = config;
```

---

## 🚀 Production Deployment

### 1. Server Deployment (Linux)

#### System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install dependencies for Puppeteer
sudo apt-get install -y chromium-browser
sudo apt-get install -y fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libdrm2 libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libxss1 libxtst6 xdg-utils
```

#### Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/mermaid-diagram-editor.git
cd mermaid-diagram-editor

# Install dependencies
npm run install-all

# Build frontend
cd frontend
npm run build
cd ..

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Create log directory
sudo mkdir -p /var/log/mermaid-editor
sudo chown $USER:$USER /var/log/mermaid-editor

# Create temp directory
mkdir -p backend/temp
```

#### PM2 Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'mermaid-editor',
    script: 'backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      LOG_LEVEL: 'warn'
    },
    log_file: '/var/log/mermaid-editor/combined.log',
    out_file: '/var/log/mermaid-editor/out.log',
    error_file: '/var/log/mermaid-editor/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

#### Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 2. Nginx Configuration

#### Install Nginx
```bash
sudo apt install nginx
sudo systemctl enable nginx
```

#### Nginx Site Configuration (`/etc/nginx/sites-available/mermaid-editor`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # File upload size limit
    client_max_body_size 50M;
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
    
    # Static files
    location / {
        root /path/to/mermaid-diagram-editor/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Logging
    access_log /var/log/nginx/mermaid-editor.access.log;
    error_log /var/log/nginx/mermaid-editor.error.log;
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/mermaid-editor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Production image
FROM node:18-alpine AS production

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy application files
COPY backend/ ./backend/
COPY --from=builder /app/frontend/dist ./frontend/dist

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node backend/health-check.js

EXPOSE 3001

CMD ["node", "backend/server.js"]
```

#### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - MAX_FILE_SIZE=50mb
    volumes:
      - ./logs:/app/logs
      - temp_data:/app/backend/temp
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "backend/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped

volumes:
  temp_data:
```

---

## 🏃‍♂️ Performance Optimization

### Backend Optimizations

#### 1. Memory Management
```javascript
// Increase Node.js memory limit
node --max-old-space-size=2048 server.js

// Garbage collection optimization
node --expose-gc --optimize-for-size server.js
```

#### 2. Process Management
```javascript
// cluster.js - CPU utilization
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  require('./server.js');
}
```

#### 3. Caching Strategy
```javascript
// In-memory caching for validation results
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache validation results
const cacheKey = crypto.createHash('md5').update(code).digest('hex');
const cached = cache.get(cacheKey);
if (cached) return cached;

// Store result
cache.set(cacheKey, result);
```

### Frontend Optimizations

#### 1. Code Splitting
```javascript
// Lazy loading components
const Editor = React.lazy(() => import('./components/Editor'));
const Preview = React.lazy(() => import('./components/Preview'));

// Bundle splitting in webpack.config.js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
      monaco: {
        test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
        name: 'monaco',
        chunks: 'all',
      }
    }
  }
}
```

#### 2. Asset Optimization
```javascript
// Image compression and optimization
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

plugins: [
  new ImageMinimizerPlugin({
    minimizer: {
      implementation: ImageMinimizerPlugin.imageminMinify,
      options: {
        plugins: [
          ['imagemin-pngquant', { quality: [0.6, 0.8] }],
          ['imagemin-svgo', { plugins: [{ name: 'preset-default' }] }]
        ]
      }
    }
  })
]
```

### Database Optimization (If Adding Persistence)

#### 1. PostgreSQL Configuration
```sql
-- Connection pooling
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

-- Indexes for common queries
CREATE INDEX idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX idx_diagrams_created_at ON diagrams(created_at);
CREATE INDEX idx_diagrams_type ON diagrams(diagram_type);
```

#### 2. Query Optimization
```javascript
// Use prepared statements
const query = 'SELECT * FROM diagrams WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2';
const result = await client.query(query, [userId, limit]);

// Connection pooling
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🔒 Security Considerations

### 1. Input Validation & Sanitization

#### Backend Input Validation
```javascript
const Joi = require('joi');

const diagramSchema = Joi.object({
  code: Joi.string().max(100000).required(),
  options: Joi.object({
    format: Joi.string().valid('svg', 'png', 'pdf'),
    theme: Joi.string().valid('default', 'dark', 'forest', 'neutral'),
    quality: Joi.string().valid('low', 'medium', 'high', 'ultra')
  })
});

// Middleware for validation
const validateDiagram = (req, res, next) => {
  const { error } = diagramSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

#### Content Security Policy
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'none'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));
```

### 2. Rate Limiting & DDoS Protection

#### Advanced Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// Different limits for different endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply different limits
app.use('/api/diagram/validate', createRateLimit(60000, 30, 'Too many validation requests'));
app.use('/api/diagram/render', createRateLimit(60000, 20, 'Too many render requests'));
app.use('/api/export', createRateLimit(300000, 5, 'Too many export requests'));
```

### 3. File System Security

#### Secure Temp File Handling
```javascript
const crypto = require('crypto');
const path = require('path');

// Generate secure filenames
const generateSecureFilename = (extension) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${random}.${extension}`;
};

// Validate file paths to prevent directory traversal
const validateFilePath = (filePath) => {
  const resolvedPath = path.resolve(filePath);
  const tempDirPath = path.resolve(config.TEMP_DIR);
  
  if (!resolvedPath.startsWith(tempDirPath)) {
    throw new Error('Invalid file path');
  }
  
  return resolvedPath;
};
```

### 4. Environment Security

#### Secrets Management
```bash
# Use environment-specific secret management
# Development: .env files
# Production: AWS Secrets Manager, HashiCorp Vault, etc.

# Example with AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

const getSecret = async (secretName) => {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
};
```

---

## 📊 Monitoring & Logging

### 1. Application Logging

#### Winston Logger Configuration
```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mermaid-editor' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Request Logging Middleware
```javascript
const morgan = require('morgan');

// Custom token for response time
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.get('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom format
const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

app.use(morgan(logFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
```

### 2. Performance Monitoring

#### Application Performance Monitoring
```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const diagramRenderDuration = new prometheus.Histogram({
  name: 'diagram_render_duration_seconds',
  help: 'Duration of diagram rendering in seconds',
  labelNames: ['format', 'theme']
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### 3. Health Checks

#### Comprehensive Health Check
```javascript
// backend/health-check.js
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const config = require('./config/config');

const healthCheck = async () => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {}
  };

  try {
    // Check file system
    await fs.access(config.TEMP_DIR);
    checks.checks.filesystem = { status: 'healthy' };
  } catch (error) {
    checks.checks.filesystem = { status: 'unhealthy', error: error.message };
    checks.status = 'unhealthy';
  }

  // Check Mermaid CLI
  try {
    await new Promise((resolve, reject) => {
      exec('npx mmdc --version', { timeout: 5000 }, (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
    checks.checks.mermaid_cli = { status: 'healthy' };
  } catch (error) {
    checks.checks.mermaid_cli = { status: 'unhealthy', error: error.message };
    checks.status = 'unhealthy';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  checks.checks.memory = {
    status: memUsageMB.heapUsed < 1000 ? 'healthy' : 'warning',
    usage: memUsageMB
  };

  return checks;
};

// If run directly (for Docker health check)
if (require.main === module) {
  healthCheck()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.status === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = healthCheck;
```

---

## 📈 Scaling & Load Balancing

### 1. Horizontal Scaling

#### Load Balancer Configuration (HAProxy)
```
# /etc/haproxy/haproxy.cfg
global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend mermaid_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/yourdomain.com.pem
    redirect scheme https if !{ ssl_fc }
    default_backend mermaid_backend

backend mermaid_backend
    balance roundrobin
    option httpchk GET /health
    server app1 10.0.1.10:3001 check
    server app2 10.0.1.11:3001 check
    server app3 10.0.1.12:3001 check
```

#### Container Orchestration (Kubernetes)
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mermaid-editor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mermaid-editor
  template:
    metadata:
      labels:
        app: mermaid-editor
    spec:
      containers:
      - name: mermaid-editor
        image: mermaid-editor:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: mermaid-editor-service
spec:
  selector:
    app: mermaid-editor
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

### 2. Caching Strategies

#### Redis Cache Implementation
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Cache rendered diagrams
const cacheRenderedDiagram = async (key, data, ttl = 3600) => {
  await redis.setex(key, ttl, JSON.stringify(data));
};

const getCachedDiagram = async (key) => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};

// Generate cache key
const generateCacheKey = (code, options) => {
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify({ code, options }))
    .digest('hex');
  return `diagram:${hash}`;
};

// Use in render service
const renderWithCache = async (code, options) => {
  const cacheKey = generateCacheKey(code, options);
  const cached = await getCachedDiagram(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const result = await mermaidService.renderDiagram(code, options);
  await cacheRenderedDiagram(cacheKey, result);
  
  return result;
};
```

#### CDN Configuration (CloudFlare)
```javascript
// CDN cache headers
app.use('/api/diagram/render', (req, res, next) => {
  // Cache rendered diagrams for 1 hour
  res.set('Cache-Control', 'public, max-age=3600');
  res.set('Vary', 'Accept-Encoding');
  next();
});

// Static asset caching
app.use(express.static('frontend/dist', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Mermaid CLI Issues

**Problem**: `ENOENT: no such file or directory, spawn mmdc`
```bash
# Solution: Install mermaid-cli globally
npm install -g @mermaid-js/mermaid-cli

# Or check local installation
npx mmdc --version

# For Docker/production environments
RUN npm install -g @mermaid-js/mermaid-cli
```

**Problem**: Puppeteer fails to launch Chrome
```bash
# Install required dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser
sudo apt-get install -y fonts-liberation libappindicator3-1 libasound2

# For Docker Alpine
RUN apk add --no-cache chromium nss freetype

# Set environment variable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

#### 2. Performance Issues

**Problem**: High memory usage during rendering
```javascript
// Solution: Implement queue and memory monitoring
const queue = require('bull');
const renderQueue = new queue('diagram rendering');

renderQueue.process(async (job) => {
  const { code, options } = job.data;
  
  // Monitor memory before rendering
  const memBefore = process.memoryUsage();
  
  try {
    const result = await mermaidService.renderDiagram(code, options);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    return result;
  } catch (error) {
    // Clean up on error
    if (global.gc) {
      global.gc();
    }
    throw error;
  }
});
```

**Problem**: Slow frontend loading
```javascript
// Solution: Implement code splitting and lazy loading
const Editor = React.lazy(() => 
  import(/* webpackChunkName: "editor" */ './components/Editor')
);
const Preview = React.lazy(() => 
  import(/* webpackChunkName: "preview" */ './components/Preview')
);

// Use Suspense wrapper
<Suspense fallback={<div>Loading...</div>}>
  <Editor />
  <Preview />
</Suspense>
```

#### 3. File System Issues

**Problem**: Permission denied on temp directory
```bash
# Solution: Fix permissions
sudo chown -R $USER:$USER /path/to/temp/directory
chmod 755 /path/to/temp/directory

# For systemd service
[Service]
User=mermaid-user
Group=mermaid-group
WorkingDirectory=/opt/mermaid-editor
```

#### 4. Network Issues

**Problem**: CORS errors in development
```javascript
// Solution: Proper CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://yourdomain.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Debug Commands

#### System Diagnostics
```bash
# Check Node.js and npm versions
node --version
npm --version

# Check Mermaid CLI
npx mmdc --version

# Check Puppeteer Chrome
node -e "console.log(require('puppeteer').executablePath())"

# Check system resources
free -h
df -h
ps aux | grep node

# Check logs
tail -f /var/log/mermaid-editor/app.log
journalctl -u mermaid-editor -f
```

#### Application Debugging
```javascript
// Enable debug mode
DEBUG=* npm run dev

// Memory debugging
node --inspect server.js
# Then open chrome://inspect

// Performance profiling
node --prof server.js
# Generate profile with: node --prof-process isolate-*.log
```

---

## 🚀 Future Enhancements

### Planned Features

#### 1. User Management & Persistence
```sql
-- Database schema for user management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  diagram_type VARCHAR(50) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diagram_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Real-time Collaboration
```javascript
// WebSocket implementation for real-time editing
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join-diagram', (diagramId) => {
    socket.join(`diagram:${diagramId}`);
  });
  
  socket.on('code-change', (data) => {
    socket.to(`diagram:${data.diagramId}`).emit('code-update', {
      code: data.code,
      cursor: data.cursor,
      user: data.user
    });
  });
});
```

#### 3. Template System
```javascript
// Template management
const templates = {
  'system-architecture': {
    name: 'System Architecture',
    category: 'Software',
    code: `graph TB
      subgraph "Frontend"
        A[React App]
        B[Redux Store]
      end
      
      subgraph "Backend"
        C[API Gateway]
        D[Microservices]
        E[Database]
      end
      
      A --> C
      C --> D
      D --> E`
  },
  'user-journey': {
    name: 'User Journey',
    category: 'UX',
    code: `journey
      title User Registration Journey
      section Discovery
        Visit homepage: 5: User
        Browse features: 4: User
      section Registration
        Click signup: 3: User
        Fill form: 2: User
        Verify email: 1: User
      section Onboarding
        Complete profile: 4: User
        First diagram: 5: User`
  }
};
```

#### 4. Advanced Export Options
```javascript
// Batch export and custom formats
const advancedExport = {
  // Export presentation slides
  exportPresentation: async (diagrams, template) => {
    const pptx = new PptxGenJS();
    
    for (const diagram of diagrams) {
      const slide = pptx.addSlide();
      const rendered = await renderDiagram(diagram.code, { format: 'png' });
      slide.addImage({ data: rendered.data, x: 1, y: 1, w: 8, h: 6 });
    }
    
    return pptx.write();
  },
  
  // Export documentation
  exportDocumentation: async (diagrams, format) => {
    if (format === 'pdf') {
      return generatePDFDocument(diagrams);
    } else if (format === 'docx') {
      return generateWordDocument(diagrams);
    }
  }
};
```

#### 5. AI-Powered Features
```javascript
// AI integration for diagram generation
const aiFeatures = {
  // Generate diagram from description
  generateFromDescription: async (description) => {
    const prompt = `Generate a Mermaid diagram based on this description: ${description}`;
    const response = await openai.createCompletion({
      model: "gpt-4",
      prompt,
      max_tokens: 1000
    });
    
    return response.data.choices[0].text;
  },
  
  // Suggest improvements
  suggestImprovements: async (diagramCode) => {
    const analysis = await analyzeDiagram(diagramCode);
    return {
      suggestions: analysis.suggestions,
      complexity: analysis.complexity,
      bestPractices: analysis.bestPractices
    };
  }
};
```

### Integration Possibilities

#### 1. Third-party Integrations
```javascript
// Confluence integration
const confluenceAPI = {
  publishDiagram: async (diagramId, spaceKey, pageTitle) => {
    const diagram = await getDiagram(diagramId);
    const rendered = await renderDiagram(diagram.code, { format: 'png' });
    
    return await confluence.content.create({
      spaceKey,
      title: pageTitle,
      body: {
        storage: {
          value: `<ac:image><ri:attachment ri:filename="diagram.png" /></ac:image>`,
          representation: 'storage'
        }
      },
      attachments: [{
        filename: 'diagram.png',
        data: rendered.data
      }]
    });
  }
};

// Slack integration
const slackAPI = {
  shareDiagram: async (diagramId, channel) => {
    const diagram = await getDiagram(diagramId);
    const rendered = await renderDiagram(diagram.code, { format: 'png' });
    
    return await slack.files.upload({
      channels: channel,
      file: Buffer.from(rendered.data, 'base64'),
      filename: `${diagram.title}.png`,
      initial_comment: `Here's the ${diagram.title} diagram`
    });
  }
};
```

#### 2. Version Control Integration
```javascript
// Git integration for diagram versioning
const gitIntegration = {
  commitDiagram: async (diagramId, message) => {
    const diagram = await getDiagram(diagramId);
    const filePath = `diagrams/${diagram.title.replace(/\s+/g, '-')}.mmd`;
    
    await git.add(filePath, diagram.code);
    await git.commit(message);
    
    return git.push();
  },
  
  createPullRequest: async (diagramId, targetBranch) => {
    const diagram = await getDiagram(diagramId);
    const branchName = `diagram-update-${Date.now()}`;
    
    await git.checkout(branchName, true);
    await commitDiagram(diagramId, `Update ${diagram.title} diagram`);
    
    return github.pulls.create({
      title: `Update ${diagram.title} diagram`,
      head: branchName,
      base: targetBranch,
      body: `Updated diagram: ${diagram.title}`
    });
  }
};
```

---

## 📝 Final Configuration Checklist

### Pre-deployment Checklist

#### Security Configuration
- [ ] Strong JWT secrets configured
- [ ] HTTPS certificates installed
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload restrictions set
- [ ] Security headers configured

#### Performance Configuration
- [ ] Process clustering enabled
- [ ] Memory limits set
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Database connections optimized
- [ ] Monitoring and logging enabled

#### Infrastructure Configuration
- [ ] Load balancer configured
- [ ] Auto-scaling rules set
- [ ] Backup strategy implemented
- [ ] Health checks enabled
- [ ] Log rotation configured
- [ ] SSL/TLS properly configured

#### Environment Configuration
- [ ] Environment variables secured
- [ ] Database migrations completed
- [ ] External service credentials configured
- [ ] Feature flags set appropriately
- [ ] Error tracking configured

### Post-deployment Verification

#### Functional Testing
- [ ] All diagram types render correctly
- [ ] Export functionality works for all formats
- [ ] API endpoints respond correctly
- [ ] Frontend loads without errors
- [ ] Real-time preview functions properly

#### Performance Testing
- [ ] Load testing completed
- [ ] Memory usage monitored
- [ ] Response times acceptable
- [ ] Concurrent user handling verified
- [ ] Resource utilization optimal

#### Security Testing
- [ ] Vulnerability scanning completed
- [ ] HTTPS redirects working
- [ ] Rate limiting functional
- [ ] Input validation tested
- [ ] Authentication/authorization verified

---

*This documentation provides a comprehensive guide for rebuilding and deploying the Mermaid Diagram Editor system. Keep this document updated as the system evolves and new requirements emerge.*
