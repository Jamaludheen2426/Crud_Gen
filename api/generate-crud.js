// Legacy CRUD generation serverless function for Vercel
const { generateController, generateService, generateRoutes } = require('../utils/crud-generators');

export default function handler(req, res) {
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
}
