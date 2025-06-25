// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Route to serve the CRUD generator
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to generate CRUD code
app.use(express.json());

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

// Helper functions for code generation
function generateController(modelName, primaryKey, requiredFields = []) {
    const serviceName = `${modelName}Service`;
    const modelNameLower = modelName.toLowerCase();
    const modelNamePlural = modelName.toLowerCase() + 's';

    return `const ${serviceName} = require('../service/${modelNameLower}.service');
const errorResponse = require('../response/error.response');
const { logger } = require("../logger/log");

const getAll${modelName}s = async (req, res) => {
    try {
        logger.info('Fetching all ${modelNamePlural}...');
        const ${modelNamePlural} = await ${serviceName}.getAll${modelName}s();
        
        if (!${modelNamePlural} || ${modelNamePlural}.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: '${modelName.toUpperCase()}S_NOT_FOUND',
                message: 'No ${modelNamePlural} found.'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: ${modelNamePlural},
            count: ${modelNamePlural}.length
        });
        logger.info('${modelName}s fetched successfully', {
            count: ${modelNamePlural}.length
        });
    } catch (error) {
        logger.error('Error fetching ${modelNamePlural}:', error);
        res.status(500).json(errorResponse.internalErrorResponse);
    }
};

const create${modelName} = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            logger.warn('Request body is empty or missing');
            return res.status(400).json({
                status: 'error',
                message: 'Request body is required'
            });
        }
        
        const new${modelName} = await ${serviceName}.create${modelName}(req.body);
        
        res.status(201).json({
            status: 'success',
            message: '${modelName} created successfully',
            data: new${modelName}
        });
        logger.info('${modelName} created successfully:', new${modelName});
    } catch (error) {
        logger.error('Error creating ${modelNameLower}:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const update${modelName} = async (req, res) => {
    try {
        const ${modelNameLower}Id = req.params.id;
        if (!${modelNameLower}Id) {
            logger.warn('${modelName} ID is missing in request parameters');
            return res.status(400).json(errorResponse.paramNotFoundResponse);
        }
        
        const updated${modelName} = await ${serviceName}.update${modelName}(${modelNameLower}Id, req.body);
        
        if (!updated${modelName}) {
            return res.status(404).json({
                status: 'error',
                code: '${modelName.toUpperCase()}_NOT_FOUND',
                message: '${modelName} not found with the provided ID.'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: '${modelName} updated successfully',
            data: updated${modelName}
        });
    } catch (error) {
        logger.error('Error updating ${modelNameLower}:', error);
        res.status(500).json(errorResponse.internalErrorResponse);
    }
};

const delete${modelName} = async (req, res) => {
    try {
        const ${modelNameLower}Id = req.params.id;
        const result = await ${serviceName}.delete${modelName}(${modelNameLower}Id);
        
        if (!result) {
            return res.status(404).json({
                status: 'error',
                code: '${modelName.toUpperCase()}_NOT_FOUND',
                message: '${modelName} not found with the provided ID.'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: '${modelName} deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting ${modelNameLower}:', error);
        res.status(500).json(errorResponse.internalErrorResponse);
    }
};

module.exports = {
    getAll${modelName}s,
    create${modelName},
    update${modelName},
    delete${modelName}
};`;
}

function generateService(modelName, primaryKey) {
    const modelNameLower = modelName.toLowerCase();
    const modelNamePlural = modelName.toLowerCase() + 's';

    return `const { where } = require('sequelize');
const db = require('../config/db.config');
const ${modelName} = db.${modelNameLower};
const { logger } = require("../logger/log");

const create${modelName} = async (${modelNameLower}Data) => {
    try {
        const ${modelNameLower} = await ${modelName}.create(${modelNameLower}Data);
        logger.info('${modelName} created successfully:', ${modelNameLower});
        return ${modelNameLower};
    } catch (error) {
        throw error;
    }
};

const getAll${modelName}s = async () => {
    try {
        logger.info("Fetching all ${modelNamePlural} from the database...");
        const ${modelNamePlural} = await ${modelName}.findAll({
            where: {
                Deleted: 'F',
                Active: 'T'
            }
        });
        return ${modelNamePlural};
    } catch (error) {
        throw error;
    }
};

const update${modelName} = async (id, ${modelNameLower}Data) => {
    try {
        logger.info(\`Updating ${modelNameLower} with ID: \${id}\`);
        const [updated] = await ${modelName}.update(${modelNameLower}Data, {
            where: { ${primaryKey}: id }
        });
        
        if (updated === 0) {
            return null;
        }

        const updated${modelName} = await ${modelName}.findByPk(id);
        return updated${modelName};
    } catch (error) {
        throw error;
    }
};

const delete${modelName} = async (id) => {
    try {
        logger.info(\`Deleting ${modelNameLower} with ID: \${id}\`);
        const [updated] = await ${modelName}.update(
            { Deleted: 'T' },
            { where: { ${primaryKey}: id } }
        );
        
        return updated > 0;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    create${modelName},
    getAll${modelName}s,
    update${modelName},
    delete${modelName}
};`;
}

function generateRoutes(modelName) {
    const modelNameLower = modelName.toLowerCase();
    const controllerName = `${modelName}Controller`;
    const modelNamePlural = modelNameLower + 's';

    return `const express = require('express');
const router = express.Router();
const ${controllerName} = require('../controller/${modelNameLower}.controller');

/**
 * @swagger
 * tags:
 *   - name: ${modelName}
 *     description: ${modelName} management
 */

/**
 * @swagger
 * /${modelNameLower}:
 *   get:
 *     tags: [${modelName}]
 *     summary: Get all ${modelNamePlural}
 *     description: Fetches all active ${modelNamePlural} from the system
 *     operationId: getAll${modelName}s
 *     responses:
 *       200:
 *         description: A list of ${modelNamePlural}
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/${modelName}Response'
 *       404:
 *         description: No ${modelNamePlural} found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', ${controllerName}.getAll${modelName}s);

/**
 * @swagger
 * /${modelNameLower}:
 *   post:
 *     tags: [${modelName}]
 *     summary: Create a new ${modelNameLower}
 *     description: Adds a new ${modelNameLower} to the system
 *     operationId: create${modelName}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${modelName}Request'
 *     responses:
 *       201:
 *         description: ${modelName} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/${modelName}Response'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', ${controllerName}.create${modelName});

/**
 * @swagger
 * /${modelNameLower}/{id}:
 *   put:
 *     tags: [${modelName}]
 *     summary: Update a ${modelNameLower} by ID
 *     description: Updates a specific ${modelNameLower} by its ID
 *     operationId: update${modelName}ById
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the ${modelNameLower} to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${modelName}Request'
 *     responses:
 *       200:
 *         description: ${modelName} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/${modelName}Response'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: ${modelName} not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', ${controllerName}.update${modelName});

/**
 * @swagger
 * /${modelNameLower}/{id}:
 *   delete:
 *     tags: [${modelName}]
 *     summary: Delete a ${modelNameLower} by ID
 *     description: Deletes a specific ${modelNameLower} by its ID
 *     operationId: delete${modelName}ById
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the ${modelNameLower} to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${modelName} deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: ${modelName} not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', ${controllerName}.delete${modelName});

module.exports = router;`;
}

app.listen(PORT, () => {
    console.log(`CRUD Generator Server running on http://localhost:${PORT}`);
    console.log(`Make sure to create a 'public' folder with index.html`);
});