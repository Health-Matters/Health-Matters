import express from 'express';
import {
  createService,
  deleteServiceById,
  getAllServices,
  getServiceById,
  updateServiceById,
} from '../controllers/serviceController';

const ServiceRouter = express.Router();

// GET /api/services - Get all services
ServiceRouter.get('/', getAllServices);

// GET /api/services/:serviceId - Get service by ID
ServiceRouter.get('/:serviceId', getServiceById);

// POST /api/services - Create a new service
ServiceRouter.post('/', createService);

// PUT /api/services/:serviceId - Update service by ID
ServiceRouter.put('/:serviceId', updateServiceById);

// DELETE /api/services/:serviceId - Delete service by ID
ServiceRouter.delete('/:serviceId', deleteServiceById);

export default ServiceRouter;
