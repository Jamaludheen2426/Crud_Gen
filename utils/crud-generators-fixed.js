// CRUD Generation Utility Functions - Fixed Template Literals
// Extracted from main server for use in Vercel serverless functions

// Legacy CRUD generation functions
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

router.get('/', ${controllerName}.getAll${modelName}s);
router.post('/', ${controllerName}.create${modelName});
router.put('/:id', ${controllerName}.update${modelName});
router.delete('/:id', ${controllerName}.delete${modelName});

module.exports = router;`;
}

// Enhanced CRUD generation functions
function generateEnhancedModel(tableName, primaryKey, columns) {
    const modelNameLower = tableName.toLowerCase();
    const modelNameCapitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const tablePlural = tableName.charAt(0).toUpperCase() + tableName.slice(1) + 's';

    // Generate column definitions
    const columnDefs = columns.map(col => {
        const sequelizeType = getSequelizeType(col.type);
        return `        ${col.name}: {
            type: DataTypes.${sequelizeType},
            allowNull: ${col.nullable}${sequelizeType.includes('STRING') ? ',\\n            validate: {\\n                len: [1, 255]\\n            }' : ''}
        }`;
    }).join(',\\n');

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
        .join('\\n\\n');

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
            ${columns.map(col => `${col.name}: ${col.name}${col.type === 'STRING' ? '.trim()' : ''}`).join(',\\n            ')},
            Active,
            CreatedBy
        };

        const new${modelNameCapitalized} = await ${serviceName}.create${modelNameCapitalized}(${modelNameLower}Data);
        
        res.status(201).json({
            status: 'success',
            message: '${modelNameCapitalized} created successfully',
            data: new${modelNameCapitalized}
        });
        logger.info(\`${modelNameCapitalized} created: ID \${new${modelNameCapitalized}.${primaryKey}}\`);
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
        }`).join('\\n        ')}
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
    const attributesList = allAttributes.map(attr => `'${attr}'`).join(',\\n                ');

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
                ${attributesList.split(',\\n                ').slice(0, -2).join(',\\n                ')}
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
    
    return {
        paths: "Swagger paths generated",
        requestSchemas: "Swagger request schemas generated", 
        responseSchemas: "Swagger response schemas generated",
        combined: `# Swagger documentation for ${modelNameCapitalized}`
    };
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
        default:
            return '"sample value"';
    }
}

function generateFieldDescription(fieldName, dataType, isNullable) {
    const nullableText = isNullable ? ' (Optional)' : ' (Required)';
    return `📝 ${fieldName} field${nullableText}`;
}

// Placeholder functions for other swagger generators
function generateSwaggerPaths() { return "Swagger paths"; }
function generateSwaggerRequestSchemas() { return "Request schemas"; }
function generateSwaggerResponseSchemas() { return "Response schemas"; }

module.exports = {
    generateController,
    generateService,
    generateRoutes,
    generateEnhancedModel,
    generateEnhancedController,
    generateEnhancedService,
    generateEnhancedRoutes,
    generateSwaggerSchemas,
    generateSwaggerPaths,
    generateSwaggerRequestSchemas,
    generateSwaggerResponseSchemas,
    getSequelizeType,
    getSwaggerType,
    generateExampleValue,
    generateFieldDescription
};
