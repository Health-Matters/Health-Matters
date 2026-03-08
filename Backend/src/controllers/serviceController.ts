import { NextFunction, Request, Response } from 'express';
import Service from '../models/Service';
import { ZodError } from 'zod';
import {
  createServiceBodySchema,
  getServicesQuerySchema,
  serviceIdParamsSchema,
  updateServiceBodySchema,
} from '../Dtos/service.dto';
import { ValidationError, NotFoundError } from '../errors/errors';

const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedQuery = getServicesQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const services = await Service.find(parsedQuery.data).sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = serviceIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const { serviceId } = parsedParams.data;

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = createServiceBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const newService = await Service.create(parsedBody.data);
    res.status(201).json(newService);
  } catch (error) {
    next(error);
  }
};

export const updateServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = serviceIdParamsSchema.safeParse(req.params);
    const parsedBody = updateServiceBodySchema.safeParse(req.body);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const { serviceId } = parsedParams.data;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $set: parsedBody.data },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      throw new NotFoundError('Service not found');
    }

    res.status(200).json(updatedService);
  } catch (error) {
    next(error);
  }
};

export const deleteServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = serviceIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const { serviceId } = parsedParams.data;

    const deletedService = await Service.findByIdAndDelete(serviceId);

    if (!deletedService) {
      throw new NotFoundError('Service not found');
    }

    res.status(200).json({
      message: 'Service deleted successfully',
      service: deletedService,
    });
  } catch (error) {
    next(error);
  }
};
