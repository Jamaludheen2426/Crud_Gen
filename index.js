// Advanced CRUD Generator Server v2.0 - Vercel Compatible
const express = require('express');
const path = require('path');
const fs = require('fs');
const { 
    generateController, 
    generateService, 
    generateRoutes,
    generateEnhancedModel,
    generateEnhancedController,
    generateEnhancedService,
    generateEnhancedRoutes,
    generateSwaggerSchemas
} = require('./utils/crud-generators');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files with cache-busting headers
app.use(express.static('public', {
    setHeaders: function (res, filePath) {
        // Extra strong cache busting for HTML files
        if (filePath.endsWith('.html')) {
            res.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Last-Modified': new Date().toUTCString(),
                'ETag': `"${Date.now()}-${Math.random()}"`
            });
        } else {
            res.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
        }
    }
}));

// Handle root route to serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the legacy generator
app.get('/legacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-legacy.html'));
});

// API endpoint to generate CRUD code
app.use(express.json());

// Enhanced CRUD generation endpoint
app.post('/api/generate-enhanced-crud', (req, res) => {
    const { tableName, primaryKey, columns } = req.body;
    
    try {
        const modelCode = generateEnhancedModel(tableName, primaryKey, columns);
        const controllerCode = generateEnhancedController(tableName, primaryKey, columns);
        const serviceCode = generateEnhancedService(tableName, primaryKey, columns);
        const routesCode = generateEnhancedRoutes(tableName);
        const swaggerData = generateSwaggerSchemas(tableName, primaryKey, columns);
        
        res.json({
            success: true,
            model: modelCode,
            controller: controllerCode,
            service: serviceCode,
            routes: routesCode,
            swagger: swaggerData.combined,
            swaggerSections: {
                paths: swaggerData.paths,
                requestSchemas: swaggerData.requestSchemas,
                responseSchemas: swaggerData.responseSchemas
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Legacy CRUD generation endpoint
app.post('/api/generate-crud', (req, res) => {
    const { modelName, primaryKey, modelCode, requiredFields } = req.body;
    
    try {
        const controllerCode = generateController(modelName, primaryKey, requiredFields);
        const serviceCode = generateService(modelName, primaryKey);
        const routesCode = generateRoutes(modelName);
        
        res.json({
            success: true,
            controller: controllerCode,
            service: serviceCode,
            routes: routesCode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// For local development, start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CRUD Generator Server running on http://localhost:${PORT}`);
        console.log(`Deployed on Vercel: https://api-crud-gen.vercel.app`);
    });
}

// Export the server app for Vercel
module.exports = app;
