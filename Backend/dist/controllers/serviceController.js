"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceById = exports.updateServiceById = exports.createService = exports.getServiceById = exports.getAllServices = void 0;
const Service_1 = __importDefault(require("../models/Service"));
const service_dto_1 = require("../Dtos/service.dto");
const errors_1 = require("../errors/errors");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getAllServices = async (req, res, next) => {
    try {
        const parsedQuery = service_dto_1.getServicesQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
        }
        const services = await Service_1.default.find(parsedQuery.data).sort({ createdAt: -1 });
        res.status(200).json(services);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllServices = getAllServices;
const getServiceById = async (req, res, next) => {
    try {
        const parsedParams = service_dto_1.serviceIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { serviceId } = parsedParams.data;
        const service = await Service_1.default.findById(serviceId);
        if (!service) {
            throw new errors_1.NotFoundError('Service not found');
        }
        res.status(200).json(service);
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceById = getServiceById;
const createService = async (req, res, next) => {
    try {
        const parsedBody = service_dto_1.createServiceBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const newService = await Service_1.default.create(parsedBody.data);
        res.status(201).json(newService);
    }
    catch (error) {
        next(error);
    }
};
exports.createService = createService;
const updateServiceById = async (req, res, next) => {
    try {
        const parsedParams = service_dto_1.serviceIdParamsSchema.safeParse(req.params);
        const parsedBody = service_dto_1.updateServiceBodySchema.safeParse(req.body);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { serviceId } = parsedParams.data;
        const updatedService = await Service_1.default.findByIdAndUpdate(serviceId, { $set: parsedBody.data }, { new: true, runValidators: true });
        if (!updatedService) {
            throw new errors_1.NotFoundError('Service not found');
        }
        res.status(200).json(updatedService);
    }
    catch (error) {
        next(error);
    }
};
exports.updateServiceById = updateServiceById;
const deleteServiceById = async (req, res, next) => {
    try {
        const parsedParams = service_dto_1.serviceIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { serviceId } = parsedParams.data;
        const deletedService = await Service_1.default.findByIdAndDelete(serviceId);
        if (!deletedService) {
            throw new errors_1.NotFoundError('Service not found');
        }
        res.status(200).json({
            message: 'Service deleted successfully',
            service: deletedService,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteServiceById = deleteServiceById;
