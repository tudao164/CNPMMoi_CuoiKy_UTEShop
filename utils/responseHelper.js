const { HTTP_STATUS } = require('./constants');

// Success response helper
const successResponse = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

// Error response helper
const errorResponse = (res, message = 'Internal Server Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    });
};

// Validation error response
const validationErrorResponse = (res, errors) => {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors,
        timestamp: new Date().toISOString()
    });
};

// Pagination response helper
const paginationResponse = (res, data, pagination, message = 'Success') => {
    return res.status(HTTP_STATUS.OK).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
            hasPrev: pagination.page > 1
        },
        timestamp: new Date().toISOString()
    });
};

// Created response helper
const createdResponse = (res, data = null, message = 'Created successfully') => {
    return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

// No content response helper
const noContentResponse = (res, message = 'No content') => {
    return res.status(HTTP_STATUS.NO_CONTENT).json({
        success: true,
        message,
        timestamp: new Date().toISOString()
    });
};

// Unauthorized response helper
const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};

// Forbidden response helper
const forbiddenResponse = (res, message = 'Forbidden') => {
    return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
};

// Not found response helper
const notFoundResponse = (res, message = 'Not found') => {
    return errorResponse(res, message, HTTP_STATUS.NOT_FOUND);
};

// Conflict response helper
const conflictResponse = (res, message = 'Conflict') => {
    return errorResponse(res, message, HTTP_STATUS.CONFLICT);
};

// Too many requests response helper
const tooManyRequestsResponse = (res, message = 'Too many requests') => {
    return errorResponse(res, message, HTTP_STATUS.TOO_MANY_REQUESTS);
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    paginationResponse,
    createdResponse,
    noContentResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    tooManyRequestsResponse
};
