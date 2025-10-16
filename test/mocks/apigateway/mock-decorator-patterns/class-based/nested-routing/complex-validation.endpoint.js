// complex-validation.endpoint.js - Comprehensive validation patterns
// Represents advanced validation scenarios with nested validation and custom validators
require('reflect-metadata');

const { BaseEndpoint } = require('../../../../../../src/apigateway/base-endpoint');
const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Complex Validation Endpoint - demonstrates advanced validation patterns
 * Original TypeScript would look like:
 * 
 * class ComplexValidationEndpoint extends BaseEndpoint {
 *     @Validate({
 *         requiredHeaders: ['x-api-key'],
 *         requiredBody: ComplexRequestSchema,
 *         customValidators: [businessLogicValidator, securityValidator]
 *     })
 *     @Before(validationPreprocessor)
 *     async post(request, response) { ... }
 * }
 */
class ComplexValidationEndpoint extends BaseEndpoint {
    async get(request, response) {
        const context = request.context || {};
        const validationResults = context.validation || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'GET',
            handler: 'complex-validation-get',
            validation: {
                type: 'simple-query-validation',
                results: validationResults,
                query: request.query || {},
                passed: validationResults.passed !== false
            },
            note: 'Simple validation with query parameters and optional fields'
        };
        
        return response;
    }

    async post(request, response) {
        const context = request.context || {};
        const validationResults = context.validation || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'POST',
            handler: 'complex-validation-post',
            validation: {
                type: 'complex-nested-validation',
                results: validationResults,
                schema: 'nested-object-with-arrays',
                customValidators: validationResults.customValidators || [],
                passed: validationResults.passed !== false
            },
            data: request.body,
            note: 'Complex validation with nested objects, arrays, and custom business logic'
        };
        
        return response;
    }

    async put(request, response) {
        const context = request.context || {};
        const validationResults = context.validation || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'PUT',
            handler: 'complex-validation-put',
            validation: {
                type: 'conditional-validation',
                results: validationResults,
                conditionalFields: validationResults.conditionalFields || [],
                passed: validationResults.passed !== false
            },
            data: request.body,
            note: 'Conditional validation where fields are required based on other field values'
        };
        
        return response;
    }

    async patch(request, response) {
        const context = request.context || {};
        const validationResults = context.validation || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'PATCH',
            handler: 'complex-validation-patch',
            validation: {
                type: 'partial-update-validation',
                results: validationResults,
                allowedFields: validationResults.allowedFields || [],
                forbiddenFields: validationResults.forbiddenFields || [],
                passed: validationResults.passed !== false
            },
            data: request.body,
            note: 'Partial update validation with field-level permissions'
        };
        
        return response;
    }

    async delete(request, response) {
        const context = request.context || {};
        const validationResults = context.validation || {};
        
        // Simulate cascade validation
        if (validationResults.hasDependencies) {
            response.body = {
                error: 'Cannot delete resource with dependencies',
                validation: {
                    type: 'cascade-validation-failure',
                    dependencies: validationResults.dependencies || []
                }
            };
            response.statusCode = 409;
            return response;
        }
        
        response.body = {
            decoratorEndpoint: true,
            method: 'DELETE',
            handler: 'complex-validation-delete',
            validation: {
                type: 'cascade-validation',
                results: validationResults,
                cascadeChecks: validationResults.cascadeChecks || [],
                passed: true
            },
            action: 'resource-deleted',
            note: 'Cascade validation to check for dependent resources before deletion'
        };
        
        return response;
    }
}

// ===== VALIDATION MIDDLEWARE FUNCTIONS =====

// Pre-validation processor
const validationPreprocessor = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    // Normalize and preprocess data for validation
    if (request.body) {
        // Trim strings, normalize formats, etc.
        request.context.validation.preprocessed = true;
        request.context.validation.preprocessing = {
            trimmed: true,
            normalized: true,
            timestamp: new Date().toISOString()
        };
    }
    
    if (request.query) {
        // Convert string numbers to numbers, booleans, etc.
        request.context.validation.queryProcessed = true;
    }
};

// Simple query parameter validator
const queryParameterValidator = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    const query = request.query || {};
    const validationResults = {
        passed: true,
        errors: []
    };
    
    // Validate pagination parameters
    if (query.page !== undefined && (isNaN(query.page) || query.page < 1)) {
        validationResults.passed = false;
        validationResults.errors.push('Page must be a positive number');
    }
    
    if (query.limit !== undefined && (isNaN(query.limit) || query.limit < 1 || query.limit > 100)) {
        validationResults.passed = false;
        validationResults.errors.push('Limit must be between 1 and 100');
    }
    
    // Validate sort parameters
    const allowedSortFields = ['name', 'date', 'status'];
    if (query.sort && !allowedSortFields.includes(query.sort)) {
        validationResults.passed = false;
        validationResults.errors.push(`Sort field must be one of: ${allowedSortFields.join(', ')}`);
    }
    
    request.context.validation = { ...request.context.validation, ...validationResults };
};

// Complex nested object validator
const nestedObjectValidator = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    const body = request.body || {};
    // Accumulate errors from previous validators
    const validationResults = {
        passed: request.context.validation.passed !== false,
        errors: request.context.validation.errors || [],
        customValidators: request.context.validation.customValidators || []
    };
    
    // Validate nested user object
    if (body.user) {
        if (!body.user.name || typeof body.user.name !== 'string' || body.user.name.length < 2) {
            validationResults.passed = false;
            validationResults.errors.push('User name must be a string with at least 2 characters');
        }
        
        if (!body.user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.user.email)) {
            validationResults.passed = false;
            validationResults.errors.push('User email must be a valid email address');
        }
        
        // Validate nested address
        if (body.user.address) {
            if (!body.user.address.street || !body.user.address.city) {
                validationResults.passed = false;
                validationResults.errors.push('Address must include street and city');
            }
        }
    }
    
    // Validate array of items
    if (body.items && Array.isArray(body.items)) {
        body.items.forEach((item, index) => {
            if (!item.id || !item.name || typeof item.quantity !== 'number') {
                validationResults.passed = false;
                validationResults.errors.push(`Item at index ${index} must have id, name, and numeric quantity`);
            }
        });
        
        validationResults.customValidators.push('array-items-validator');
    }
    
    request.context.validation = { ...request.context.validation, ...validationResults };
};

// Business logic validator
const businessLogicValidator = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    const body = request.body || {};
    // Accumulate errors from previous validators
    const validationResults = {
        passed: request.context.validation.passed !== false,
        errors: request.context.validation.errors || [],
        businessRules: request.context.validation.businessRules || []
    };
    
    // Business rule: Total order value validation
    if (body.items && Array.isArray(body.items)) {
        const totalValue = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (totalValue > 10000) {
            validationResults.passed = false;
            validationResults.errors.push('Order total cannot exceed $10,000');
            validationResults.businessRules.push('max-order-value-exceeded');
        }
        
        if (body.items.length > 50) {
            validationResults.passed = false;
            validationResults.errors.push('Cannot process more than 50 items per order');
            validationResults.businessRules.push('max-items-exceeded');
        }
    }
    
    // Business rule: User permissions validation
    if (body.action === 'admin-action') {
        const authContext = request.context.auth || {};
        if (!authContext.roles?.includes('admin')) {
            validationResults.passed = false;
            validationResults.errors.push('Admin action requires admin role');
            validationResults.businessRules.push('insufficient-permissions');
        }
    }
    
    request.context.validation = { ...request.context.validation, ...validationResults };
};

// Conditional field validator
const conditionalFieldValidator = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    const body = request.body || {};
    const validationResults = {
        passed: true,
        errors: [],
        conditionalFields: []
    };
    
    // If payment_method is 'credit_card', credit_card_info is required
    if (body.payment_method === 'credit_card') {
        validationResults.conditionalFields.push('credit_card_info');
        if (!body.credit_card_info || !body.credit_card_info.number || !body.credit_card_info.expiry) {
            validationResults.passed = false;
            validationResults.errors.push('Credit card information is required when payment method is credit_card');
        }
    }
    
    // If shipping_method is 'express', shipping_address is required
    if (body.shipping_method === 'express') {
        validationResults.conditionalFields.push('shipping_address');
        if (!body.shipping_address) {
            validationResults.passed = false;
            validationResults.errors.push('Shipping address is required for express shipping');
        }
    }
    
    request.context.validation = { ...request.context.validation, ...validationResults };
};

// Partial update field validator
const partialUpdateValidator = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    const body = request.body || {};
    const allowedFields = ['name', 'description', 'tags', 'metadata'];
    const forbiddenFields = ['id', 'created_at', 'user_id'];
    
    const validationResults = {
        passed: true,
        errors: [],
        allowedFields: [],
        forbiddenFields: []
    };
    
    Object.keys(body).forEach(field => {
        if (forbiddenFields.includes(field)) {
            validationResults.passed = false;
            validationResults.errors.push(`Field '${field}' cannot be updated`);
            validationResults.forbiddenFields.push(field);
        } else if (!allowedFields.includes(field)) {
            validationResults.passed = false;
            validationResults.errors.push(`Field '${field}' is not allowed for updates`);
        } else {
            validationResults.allowedFields.push(field);
        }
    });
    
    request.context.validation = { ...request.context.validation, ...validationResults };
};

// Cascade dependency validator
const cascadeDependencyValidator = async (request, response) => {
    request.context = request.context || {};
    request.context.validation = request.context.validation || {};
    
    // Simulate checking for dependencies
    const resourceId = request.pathParameters?.id || 'unknown';
    const dependencies = [];
    
    // Simulate different dependency scenarios
    if (resourceId === 'has-children') {
        dependencies.push({ type: 'child-resources', count: 3 });
    }
    
    if (resourceId === 'referenced-by-others') {
        dependencies.push({ type: 'references', count: 5 });
    }
    
    const validationResults = {
        passed: dependencies.length === 0,
        cascadeChecks: ['child-resources', 'references', 'constraints'],
        hasDependencies: dependencies.length > 0,
        dependencies: dependencies
    };
    
    request.context.validation = { ...request.context.validation, ...validationResults };
};

// ===== METADATA DEFINITIONS =====

// GET - Simple query validation
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [validationPreprocessor, queryParameterValidator],
    ComplexValidationEndpoint.prototype,
    'get'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredQuery: ['page'] // page is required, but limit and sort are optional
        }
    },
    ComplexValidationEndpoint.prototype,
    'get'
);

// POST - Complex nested validation
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [validationPreprocessor, nestedObjectValidator, businessLogicValidator],
    ComplexValidationEndpoint.prototype,
    'post'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'content-type'],
            requiredBody: ['user', 'items', 'action']
        }
    },
    ComplexValidationEndpoint.prototype,
    'post'
);

// PUT - Conditional validation
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [validationPreprocessor, conditionalFieldValidator],
    ComplexValidationEndpoint.prototype,
    'put'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredBody: ['payment_method'] // Other fields conditionally required
        }
    },
    ComplexValidationEndpoint.prototype,
    'put'
);

// PATCH - Partial update validation
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [validationPreprocessor, partialUpdateValidator],
    ComplexValidationEndpoint.prototype,
    'patch'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredBody: [] // No required body fields for PATCH
        }
    },
    ComplexValidationEndpoint.prototype,
    'patch'
);

// DELETE - Cascade validation
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [cascadeDependencyValidator],
    ComplexValidationEndpoint.prototype,
    'delete'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredQuery: [] // ID comes from path parameters
        }
    },
    ComplexValidationEndpoint.prototype,
    'delete'
);

module.exports = ComplexValidationEndpoint;