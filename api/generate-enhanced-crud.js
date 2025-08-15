// Enhanced CRUD generation serverless function for Vercel
const { generateEnhancedModel, generateEnhancedController, generateEnhancedService, generateEnhancedRoutes, generateSwaggerSchemas } = require('../utils/crud-generators');

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

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
}
