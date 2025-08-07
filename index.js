// Advanced CRUD Generator Server v2.0
const express = require('express');
const path = require('path');
const fs = require('fs');

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

// ===============================
// ENHANCED CRUD GENERATION FUNCTIONS
// ===============================

function generateEnhancedModel(tableName, primaryKey, columns) {
    const modelNameLower = tableName.toLowerCase();
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const tablePlural = tableName.charAt(0).toUpperCase() + tableName.slice(1) + 's';

    // Generate column definitions
    const columnDefs = columns.map(col => {
        const sequelizeType = getSequelizeType(col.type);
        return `        ${col.name}: {
            type: DataTypes.${sequelizeType},
            allowNull: ${col.nullable}${sequelizeType.includes('STRING') ? ',\n            validate: {\n                len: [1, 255]\n            }' : ''}
        }`;
    }).join(',\n');

    return `const DataTypes = require("sequelize");
const sequelize = require('../config/db.config');

module.exports = (sequelize, Sequelize) => {
    const ${modelNameCapitalized} = sequelize.define('${modelNameCapitalized}', {
        ${primaryKey}: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
${columnDefs},
        Active: {
            type: DataTypes.STRING(1),
            defaultValue: 'T',
            allowNull: false,
            validate: {
                isIn: [['T', 'F']]
            }
        },
        Deleted: {
            type: DataTypes.STRING(1),
            defaultValue: 'F',
            allowNull: false,
            validate: {
                isIn: [['T', 'F']]
            }
        },
        CreatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UpdatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        CreatedBy: {
            type: DataTypes.INTEGER
        },
        UpdatedBy: {
            type: DataTypes.INTEGER,
        }
    }, {
        tableName: '${tablePlural}',
        timestamps: false,
    });
    return ${modelNameCapitalized};
};`;
}

function generateEnhancedController(tableName, primaryKey, columns) {
    const modelNameLower = tableName.toLowerCase();
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const modelNamePlural = modelNameLower + 's';
    const serviceName = `${modelNameLower}Service`;

    // Generate validation checks for required fields
    const requiredFieldChecks = columns
        .filter(col => !col.nullable)
        .map(col => `        if (!${col.name} || ${col.name}.toString().trim() === '') {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_INPUT',
                message: '${col.name} is required'
            });
        }`)
        .join('\n\n');

    return `const ${serviceName} = require('../service/${modelNameLower}.service');
const errorResponse = require('../response/error.response');
const { logger } = require("../logger/log");

const getAll${modelNameCapitalized}s = async (req, res) => {
    try {
        const ${modelNamePlural} = await ${serviceName}.getAll${modelNameCapitalized}s();
        
        if (!${modelNamePlural} || ${modelNamePlural}.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: [],
                count: 0,
                message: 'No ${modelNamePlural} found.'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: ${modelNamePlural},
            count: ${modelNamePlural}.length
        });
        logger.info(\`${modelNameCapitalized}s fetched: \${${modelNamePlural}.length} found\`);
    } catch (error) {
        logger.error('Error fetching ${modelNamePlural}:', error.message);
        
        if (error.code === 'DATABASE_ERROR') {
            return res.status(500).json(errorResponse.internalErrorResponse);
        }
        
        res.status(500).json(errorResponse.internalErrorResponse);
    }
}

const get${modelNameCapitalized}ById = async (req, res) => {
    try {
        const ${modelNameLower}Id = req.params.id;
        
        if (!${modelNameLower}Id) {
            return res.status(400).json(errorResponse.credentialsMissingErrorResponse);
        }
        
        const ${modelNameLower} = await ${serviceName}.get${modelNameCapitalized}ById(${modelNameLower}Id);
        
        if (!${modelNameLower}) {
            return res.status(404).json({
                status: 'error',
                code: '${modelNameCapitalized.toUpperCase()}_NOT_FOUND',
                message: '${modelNameCapitalized} not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: ${modelNameLower}
        });
        logger.info(\`${modelNameCapitalized} fetched: ID \${${modelNameLower}Id}\`);
    } catch (error) {
        logger.error(\`Fetch error: ID \${req.params.id}\`, error.message);
        if (error.code === 'DATABASE_ERROR') {
            return res.status(500).json(errorResponse.internalErrorResponse);
        }
        res.status(500).json(errorResponse.internalErrorResponse);
    }
};

const create${modelNameCapitalized} = async (req, res) => {
    try {
        const { ${columns.map(col => col.name).join(', ')}, Active = 'T' } = req.body;
        const CreatedBy = req.userId || null;

${requiredFieldChecks}

        const ${modelNameLower}Data = {
            ${columns.map(col => `${col.name}: ${col.name}${col.type === 'STRING' ? '.trim()' : ''}`).join(',\n            ')},
            Active,
            CreatedBy
        };

        const new${modelNameCapitalized} = await ${serviceName}.create${modelNameCapitalized}(${modelNameLower}Data);
        
        res.status(201).json({
            status: 'success',
            message: '${modelNameCapitalized} created successfully',
            data: new${modelNameCapitalized}
        });
        logger.info(\`${modelNameCapitalized} created: ID \${new${modelNameCapitalized}.${primaryKey}}, Name: \${new${modelNameCapitalized}.${columns[0]?.name || 'data'}}\`);
    } catch (error) {
        logger.error('Error creating ${modelNameLower}:', error.message);
        if (error.code === 'DATABASE_ERROR') {
            return res.status(500).json(errorResponse.internalErrorResponse);
        }
        res.status(500).json(errorResponse.internalErrorResponse);
    }
};

const update${modelNameCapitalized} = async (req, res) => {
    try {
        const ${modelNameLower}Id = req.params.id;
        const { ${columns.map(col => col.name).join(', ')}, Active } = req.body;
        const UpdatedBy = req.userId || null;

        if (!${modelNameLower}Id) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_INPUT',
                message: '${modelNameCapitalized} ID is required'
            });
        }

        const existing${modelNameCapitalized} = await ${serviceName}.get${modelNameCapitalized}ById(${modelNameLower}Id);
        if (!existing${modelNameCapitalized}) {
            return res.status(404).json({
                status: 'error',
                code: '${modelNameCapitalized.toUpperCase()}_NOT_FOUND',
                message: '${modelNameCapitalized} not found'
            });
        }

        const updateData = {};
        ${columns.map(col => `if (${col.name} !== undefined) {
            updateData.${col.name} = ${col.name}${col.type === 'STRING' ? '.trim()' : ''};
        }`).join('\n        ')}
        if (Active !== undefined) {
            updateData.Active = Active;
        }
        updateData.UpdatedBy = UpdatedBy;

        const updated${modelNameCapitalized} = await ${serviceName}.update${modelNameCapitalized}(${modelNameLower}Id, updateData);
        
        res.status(200).json({
            status: 'success',
            message: '${modelNameCapitalized} updated successfully',
            data: updated${modelNameCapitalized}
        });
        logger.info(\`${modelNameCapitalized} updated: ID \${${modelNameLower}Id}\`);
    } catch (error) {
        logger.error(\`Update error: ID \${req.params.id}\`, error.message);
        if (error.code === 'DATABASE_ERROR') {
            return res.status(500).json(errorResponse.internalErrorResponse);
        }
        res.status(500).json(errorResponse.internalErrorResponse);
    }
};

module.exports = {
    getAll${modelNameCapitalized}s,
    get${modelNameCapitalized}ById,
    create${modelNameCapitalized},
    update${modelNameCapitalized}
};`;
}

function generateEnhancedService(tableName, primaryKey, columns) {
    const modelNameLower = tableName.toLowerCase();
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const modelNamePlural = modelNameLower + 's';
    
    // Generate attributes list for findAll
    const allAttributes = [primaryKey, ...columns.map(col => col.name), 'Active', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy', 'Deleted'];
    const attributesList = allAttributes.map(attr => `'${attr}'`).join(',\n                ');

    return `const db = require('../config/db.config');
const ${modelNameCapitalized} = db.${modelNameLower};
const { logger } = require("../logger/log");

const getAll${modelNameCapitalized}s = async () => {
    try {
        logger.info('Fetching all ${modelNamePlural} from the database...');
        const ${modelNamePlural} = await ${modelNameCapitalized}.findAll({
            where: {
                Deleted: 'F',
                Active: 'T'
            },
            attributes: [
                ${attributesList}
            ],
            order: [['${primaryKey}', 'DESC']]
        });
        return ${modelNamePlural};
    } catch (error) {
        logger.error('Database error in getAll${modelNameCapitalized}s:', error);
        throw { code: 'DATABASE_ERROR', message: error.message };
    }
}

const get${modelNameCapitalized}ById = async (id) => {
    try {
        logger.info(\`Fetching ${modelNameLower} with ID: \${id}\`);
        const ${modelNameLower} = await ${modelNameCapitalized}.findOne({
            where: {
                ${primaryKey}: id,
                Deleted: 'F'
            },
            attributes: [
                ${attributesList.split(',\n                ').slice(0, -2).join(',\n                ')}
            ]
        });
        return ${modelNameLower};
    } catch (error) {
        logger.error('Database error in get${modelNameCapitalized}ById:', error);
        throw { code: 'DATABASE_ERROR', message: error.message };
    }
};

const create${modelNameCapitalized} = async (${modelNameLower}Data) => {
    try {
        logger.info('Creating new ${modelNameLower}:', ${modelNameLower}Data);
        const new${modelNameCapitalized} = await ${modelNameCapitalized}.create(${modelNameLower}Data);
        
        const created${modelNameCapitalized} = await ${modelNameCapitalized}.findByPk(new${modelNameCapitalized}.${primaryKey}, {
            attributes: [
                ${attributesList}
            ]
        });
        
        logger.info('${modelNameCapitalized} created successfully:', { ${modelNameLower}Id: created${modelNameCapitalized}.${primaryKey} });
        return created${modelNameCapitalized};
    } catch (error) {
        logger.error('Database error in create${modelNameCapitalized}:', error);
        throw { code: 'DATABASE_ERROR', message: error.message };
    }
};

const update${modelNameCapitalized} = async (${modelNameLower}Id, updateData) => {
    try {
        logger.info(\`Updating ${modelNameLower} with ID: \${${modelNameLower}Id}\`, updateData);
        
        updateData.UpdatedAt = new Date();
        
        const [updatedRows] = await ${modelNameCapitalized}.update(updateData, {
            where: {
                ${primaryKey}: ${modelNameLower}Id,
                Deleted: 'F'
            }
        });
        
        if (updatedRows === 0) {
            throw { code: '${modelNameCapitalized.toUpperCase()}_NOT_FOUND', message: '${modelNameCapitalized} not found or already deleted' };
        }
        
        const updated${modelNameCapitalized} = await ${modelNameCapitalized}.findByPk(${modelNameLower}Id, {
            attributes: [
                ${attributesList}
            ]
        });
        
        logger.info('${modelNameCapitalized} updated successfully:', { ${modelNameLower}Id: updated${modelNameCapitalized}.${primaryKey} });
        return updated${modelNameCapitalized};
    } catch (error) {
        logger.error('Database error in update${modelNameCapitalized}:', error);
        if (error.code === '${modelNameCapitalized.toUpperCase()}_NOT_FOUND') {
            throw error;
        }
        throw { code: 'DATABASE_ERROR', message: error.message };
    }
};

module.exports = {
    getAll${modelNameCapitalized}s,
    get${modelNameCapitalized}ById,
    create${modelNameCapitalized},
    update${modelNameCapitalized}
};`;
}

function generateEnhancedRoutes(tableName) {
    const modelNameLower = tableName.toLowerCase();
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const controllerName = `${modelNameLower}Controller`;

    return `const express = require('express');
const router = express.Router();
const ${controllerName} = require('../controllers/${modelNameLower}.controller');

router.get('/', ${controllerName}.getAll${modelNameCapitalized}s);
router.get('/:id', ${controllerName}.get${modelNameCapitalized}ById);
router.post('/', ${controllerName}.create${modelNameCapitalized});
router.put('/:id', ${controllerName}.update${modelNameCapitalized});

module.exports = router;`;
}

function generateSwaggerSchemas(tableName, primaryKey, columns) {
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const modelNameLower = tableName.toLowerCase();
    const modelNamePlural = modelNameLower + 's';
    
    // Generate separate sections
    const pathsSection = generateSwaggerPaths(tableName, primaryKey, columns);
    const requestSchemasSection = generateSwaggerRequestSchemas(tableName, primaryKey, columns);
    const responseSchemasSection = generateSwaggerResponseSchemas(tableName, primaryKey, columns);
    
    return {
        paths: pathsSection,
        requestSchemas: requestSchemasSection,
        responseSchemas: responseSchemasSection,
        combined: `# ===================================
# 🚀 SWAGGER DOCUMENTATION FOR ${modelNameCapitalized.toUpperCase()}
# ===================================

# 📁 PATHS SECTION
# ================
${pathsSection}

# 📋 REQUEST SCHEMAS SECTION  
# ==========================
${requestSchemasSection}

# 📄 RESPONSE SCHEMAS SECTION
# ===========================
${responseSchemasSection}`
    };
}

function generateSwaggerPaths(tableName, primaryKey, columns) {
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const modelNameLower = tableName.toLowerCase();
    const modelNamePlural = modelNameLower + 's';
    
    // Generate example values for request body
    const requestExample = columns.map(col => {
        const example = generateExampleValue(col.type, col.name);
        return `              ${col.name}: ${example}`;
    }).join('\n');

    return `paths:
  /${modelNameLower}:
    get:
      tags:
        - ${modelNameCapitalized}
      summary: 📋 Get all ${modelNamePlural}
      description: Retrieve a list of all active ${modelNamePlural}
      operationId: getAll${modelNameCapitalized}s
      responses:
        '200':
          description: ✅ List of ${modelNamePlural} retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${modelNameCapitalized}ListResponse'
              example:
                status: "success"
                data: [
                  {
                    ${primaryKey}: 1,
                    ${columns.map(col => `${col.name}: ${generateExampleValue(col.type, col.name)}`).join(',\n                    ')},
                    Active: "T",
                    CreatedAt: "2024-01-15T10:30:00.000Z",
                    UpdatedAt: "2024-01-15T10:30:00.000Z"
                  }
                ]
                count: 1
                message: "${modelNameCapitalized}s retrieved successfully"
        '404':
          description: ❌ No ${modelNamePlural} found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: 💥 Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    
    post:
      tags:
        - ${modelNameCapitalized}
      summary: ➕ Create a new ${modelNameLower}
      description: Add a new ${modelNameLower} to the system
      operationId: create${modelNameCapitalized}
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/${modelNameCapitalized}Request'
            example:
${requestExample}
              Active: "T"
      responses:
        '201':
          description: ✅ ${modelNameCapitalized} created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${modelNameCapitalized}CreateResponse'
              example:
                status: "success"
                message: "${modelNameCapitalized} created successfully"
                data:
                  ${primaryKey}: 1
                  ${columns.map(col => `${col.name}: ${generateExampleValue(col.type, col.name)}`).join('\n                  ')}
                  Active: "T"
                  CreatedAt: "2024-01-15T10:30:00.000Z"
                  UpdatedAt: "2024-01-15T10:30:00.000Z"
        '400':
          description: ❌ Bad request - Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: 💥 Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  
  /${modelNameLower}/{id}:
    get:
      tags:
        - ${modelNameCapitalized}
      summary: 🔍 Get ${modelNameLower} by ID
      description: Retrieve a specific ${modelNameLower} by its ID
      operationId: get${modelNameCapitalized}ById
      parameters:
        - name: id
          in: path
          required: true
          description: The unique ID of the ${modelNameLower}
          schema:
            type: integer
            example: 1
            minimum: 1
      responses:
        '200':
          description: ✅ ${modelNameCapitalized} retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${modelNameCapitalized}SingleResponse'
              example:
                status: "success"
                data:
                  ${primaryKey}: 1
                  ${columns.map(col => `${col.name}: ${generateExampleValue(col.type, col.name)}`).join('\n                  ')}
                  Active: "T"
                  CreatedAt: "2024-01-15T10:30:00.000Z"
                  UpdatedAt: "2024-01-15T10:30:00.000Z"
        '400':
          description: ❌ Bad request - Invalid ID
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: ❌ ${modelNameCapitalized} not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: 💥 Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    
    put:
      tags:
        - ${modelNameCapitalized}
      summary: ✏️ Update ${modelNameLower} by ID
      description: Update a specific ${modelNameLower} by its ID
      operationId: update${modelNameCapitalized}ById
      parameters:
        - name: id
          in: path
          required: true
          description: The unique ID of the ${modelNameLower} to update
          schema:
            type: integer
            example: 1
            minimum: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/${modelNameCapitalized}UpdateRequest'
            example:
${requestExample}
              Active: "T"
      responses:
        '200':
          description: ✅ ${modelNameCapitalized} updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${modelNameCapitalized}UpdateResponse'
              example:
                status: "success"
                message: "${modelNameCapitalized} updated successfully"
                data:
                  ${primaryKey}: 1
                  ${columns.map(col => `${col.name}: ${generateExampleValue(col.type, col.name)}`).join('\n                  ')}
                  Active: "T"
                  CreatedAt: "2024-01-15T10:30:00.000Z"
                  UpdatedAt: "2024-01-15T15:45:00.000Z"
        '400':
          description: ❌ Bad request - Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: ❌ ${modelNameCapitalized} not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: 💥 Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

tags:
  - name: ${modelNameCapitalized}
    description: 🏷️ ${modelNameCapitalized} management operations`;
}

function generateSwaggerRequestSchemas(tableName, primaryKey, columns) {
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    
    // Generate required fields array
    const requiredFields = columns.filter(col => !col.nullable).map(col => col.name);
    const requiredFieldsList = requiredFields.length > 0 ? 
        `      required:\n        - ${requiredFields.join('\n        - ')}` : '';
    
    // Generate schema properties for request
    const requestProperties = columns.map(col => {
        const swaggerType = getSwaggerType(col.type);
        const example = generateExampleValue(col.type, col.name);
        const nullable = col.nullable ? 'true' : 'false';
        const description = generateFieldDescription(col.name, col.type, col.nullable);
        
        return `        ${col.name}:
          type: ${swaggerType}
          nullable: ${nullable}
          description: ${description}
          example: ${example}${col.type === 'STRING' ? '\n          minLength: 1\n          maxLength: 255' : ''}${col.type === 'INTEGER' ? '\n          minimum: 0' : ''}`;
    }).join('\n');

    return `components:
  schemas:
    # 📝 REQUEST SCHEMAS
    # ==================
    
    ${modelNameCapitalized}Request:
      type: object
      description: 📝 Request schema for creating a new ${tableName.toLowerCase()}
      properties:
${requestProperties}
        Active:
          type: string
          enum: ['T', 'F']
          default: 'T'
          description: 🔄 Active status of the ${tableName.toLowerCase()} (T=Active, F=Inactive)
          example: "T"
${requiredFieldsList}
    
    ${modelNameCapitalized}UpdateRequest:
      type: object
      description: ✏️ Request schema for updating an existing ${tableName.toLowerCase()}
      properties:
${requestProperties}
        Active:
          type: string
          enum: ['T', 'F']
          description: 🔄 Active status of the ${tableName.toLowerCase()} (T=Active, F=Inactive)
          example: "T"
      # ℹ️ Note: All fields are optional for update operations`;
}

function generateSwaggerResponseSchemas(tableName, primaryKey, columns) {
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const modelNameLower = tableName.toLowerCase();
    const modelNamePlural = modelNameLower + 's';
    
    // Generate response properties (including system fields)
    const responseProperties = [primaryKey, ...columns.map(col => col.name), 'Active', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy'].map(prop => {
        let swaggerType, example, description;
        
        if (prop === primaryKey) {
            swaggerType = 'integer';
            example = '1';
            description = `🆔 Unique identifier for the ${tableName.toLowerCase()}`;
        } else if (['CreatedAt', 'UpdatedAt'].includes(prop)) {
            swaggerType = 'string';
            example = '"2024-01-15T10:30:00.000Z"';
            description = prop === 'CreatedAt' ? '📅 Timestamp when the record was created' : '📅 Timestamp when the record was last updated';
        } else if (['CreatedBy', 'UpdatedBy'].includes(prop)) {
            swaggerType = 'integer';
            example = '1';
            description = prop === 'CreatedBy' ? '👤 ID of user who created the record' : '👤 ID of user who last updated the record';
        } else if (prop === 'Active') {
            swaggerType = 'string';
            example = '"T"';
            description = '🔄 Active status (T=Active, F=Inactive)';
        } else {
            const column = columns.find(c => c.name === prop);
            swaggerType = getSwaggerType(column?.type || 'string');
            example = generateExampleValue(column?.type || 'string', prop);
            description = generateFieldDescription(prop, column?.type || 'string', column?.nullable || false);
        }
        
        return `        ${prop}:
          type: ${swaggerType}
          description: ${description}
          example: ${example}`;
    }).join('\n');

    return `    # 📄 RESPONSE SCHEMAS
    # ===================
    
    ${modelNameCapitalized}Response:
      type: object
      description: 📄 Complete ${tableName.toLowerCase()} data structure
      properties:
${responseProperties}
      
    ${modelNameCapitalized}ListResponse:
      type: object
      description: 📋 Response schema for getting multiple ${modelNamePlural}
      properties:
        status:
          type: string
          enum: ['success']
          description: 🎯 Response status indicator
          example: 'success'
        data:
          type: array
          items:
            $ref: '#/components/schemas/${modelNameCapitalized}Response'
          description: 📦 Array of ${tableName.toLowerCase()} objects
        count:
          type: integer
          minimum: 0
          description: 🔢 Total number of ${modelNamePlural} returned
          example: 10
        message:
          type: string
          description: 💬 Human-readable success message
          example: '${modelNameCapitalized}s retrieved successfully'
      required:
        - status
        - data
        - count
    
    ${modelNameCapitalized}SingleResponse:
      type: object
      description: 🔍 Response schema for getting a single ${tableName.toLowerCase()}
      properties:
        status:
          type: string
          enum: ['success']
          description: 🎯 Response status indicator
          example: 'success'
        data:
          $ref: '#/components/schemas/${modelNameCapitalized}Response'
          description: 📦 The ${tableName.toLowerCase()} object
      required:
        - status
        - data
    
    ${modelNameCapitalized}CreateResponse:
      type: object
      description: ➕ Response schema for creating a ${tableName.toLowerCase()}
      properties:
        status:
          type: string
          enum: ['success']
          description: 🎯 Response status indicator
          example: 'success'
        message:
          type: string
          description: 💬 Human-readable success message
          example: '${modelNameCapitalized} created successfully'
        data:
          $ref: '#/components/schemas/${modelNameCapitalized}Response'
          description: 📦 The newly created ${tableName.toLowerCase()} object
      required:
        - status
        - message
        - data
    
    ${modelNameCapitalized}UpdateResponse:
      type: object
      description: ✏️ Response schema for updating a ${tableName.toLowerCase()}
      properties:
        status:
          type: string
          enum: ['success']
          description: 🎯 Response status indicator
          example: 'success'
        message:
          type: string
          description: 💬 Human-readable success message
          example: '${modelNameCapitalized} updated successfully'
        data:
          $ref: '#/components/schemas/${modelNameCapitalized}Response'
          description: 📦 The updated ${tableName.toLowerCase()} object
      required:
        - status
        - message
        - data
    
    # ❌ ERROR RESPONSE SCHEMAS
    # =========================
    
    ErrorResponse:
      type: object
      description: ❌ Standard error response schema
      properties:
        status:
          type: string
          enum: ['error']
          description: 🎯 Response status indicator
          example: 'error'
        code:
          type: string
          description: 🏷️ Machine-readable error code for identification
          example: 'VALIDATION_ERROR'
          enum:
            - 'VALIDATION_ERROR'
            - 'NOT_FOUND'
            - 'DUPLICATE_ENTRY'
            - 'DATABASE_ERROR'
            - 'UNAUTHORIZED'
            - 'FORBIDDEN'
        message:
          type: string
          description: 💬 Human-readable error message
          example: 'Validation failed for the provided data'
        details:
          type: object
          description: 📝 Additional error details (optional)
          additionalProperties: true
      required:
        - status
        - message`;
}

function generateFieldDescription(fieldName, dataType, isNullable) {
    const lowerFieldName = fieldName.toLowerCase();
    const nullableText = isNullable ? ' (Optional)' : ' (Required)';
    
    // Smart descriptions based on field name
    if (lowerFieldName.includes('name')) {
        return `📛 Name or title field${nullableText}`;
    }
    if (lowerFieldName.includes('email')) {
        return `📧 Email address field${nullableText}`;
    }
    if (lowerFieldName.includes('phone')) {
        return `📱 Phone number field${nullableText}`;
    }
    if (lowerFieldName.includes('url') || lowerFieldName.includes('link')) {
        return `🔗 URL or link field${nullableText}`;
    }
    if (lowerFieldName.includes('description')) {
        return `📝 Detailed description field${nullableText}`;
    }
    if (lowerFieldName.includes('title')) {
        return `🏷️ Title field${nullableText}`;
    }
    if (lowerFieldName.includes('address')) {
        return `🏠 Address field${nullableText}`;
    }
    if (lowerFieldName.includes('price') || lowerFieldName.includes('cost') || lowerFieldName.includes('amount')) {
        return `💰 Price or amount field${nullableText}`;
    }
    if (lowerFieldName.includes('count') || lowerFieldName.includes('quantity') || lowerFieldName.includes('number')) {
        return `🔢 Numeric count or quantity field${nullableText}`;
    }
    
    // Generic descriptions based on data type
    const typeEmojis = {
        'STRING': '📝',
        'INTEGER': '🔢', 
        'BOOLEAN': '✅',
        'DATE': '📅',
        'TEXT': '📄',
        'DECIMAL': '💰',
        'FLOAT': '📊',
        'ENUM': '🎯',
        'JSON': '📦'
    };
    
    const emoji = typeEmojis[dataType] || '📝';
    return `${emoji} ${fieldName} field${nullableText}`;
}

// Helper functions
function getSequelizeType(type) {
    const typeMap = {
        'STRING': 'STRING(255)',
        'INTEGER': 'INTEGER',
        'BOOLEAN': 'BOOLEAN',
        'DATE': 'DATE',
        'TEXT': 'TEXT',
        'DECIMAL': 'DECIMAL(10,2)',
        'FLOAT': 'FLOAT',
        'ENUM': 'STRING(50)',
        'JSON': 'JSON'
    };
    return typeMap[type] || 'STRING(255)';
}

function getSwaggerType(type) {
    const typeMap = {
        'STRING': 'string',
        'INTEGER': 'integer',
        'BOOLEAN': 'boolean',
        'DATE': 'string',
        'TEXT': 'string',
        'DECIMAL': 'number',
        'FLOAT': 'number',
        'ENUM': 'string',
        'JSON': 'object'
    };
    return typeMap[type] || 'string';
}

function generateExampleValue(type, fieldName) {
    const lowerFieldName = fieldName.toLowerCase();
    
    // Smart examples based on field name
    if (lowerFieldName.includes('name')) {
        return '"Sample Name"';
    }
    if (lowerFieldName.includes('email')) {
        return '"user@example.com"';
    }
    if (lowerFieldName.includes('phone')) {
        return '"+1234567890"';
    }
    if (lowerFieldName.includes('url') || lowerFieldName.includes('link')) {
        return '"https://example.com"';
    }
    if (lowerFieldName.includes('description')) {
        return '"Sample description text"';
    }
    if (lowerFieldName.includes('title')) {
        return '"Sample Title"';
    }
    if (lowerFieldName.includes('address')) {
        return '"123 Main St, City, State 12345"';
    }
    if (lowerFieldName.includes('price') || lowerFieldName.includes('cost') || lowerFieldName.includes('amount')) {
        return '99.99';
    }
    if (lowerFieldName.includes('count') || lowerFieldName.includes('quantity') || lowerFieldName.includes('number')) {
        return '10';
    }
    
    // Examples based on data type
    switch (type) {
        case 'STRING':
            return '"Sample text"';
        case 'INTEGER':
            return '123';
        case 'BOOLEAN':
            return 'true';
        case 'DATE':
            return '"2024-01-15T10:30:00.000Z"';
        case 'TEXT':
            return '"This is a longer text content that can span multiple lines and contain more detailed information."';
        case 'DECIMAL':
        case 'FLOAT':
            return '123.45';
        case 'ENUM':
            return '"option1"';
        case 'JSON':
            return '{"key": "value"}';
        default:
            return '"sample value"';
    }
}

// ===============================
// LEGACY CRUD GENERATION FUNCTIONS
// ===============================

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