import express from 'express';
import {
  createService,
  deleteServiceById,
  getAllServices,
  getServiceById,
  updateServiceById,
} from '../controllers/serviceController';
import { requireAdminRole, requireClerkAuth } from '../middlewares/auth-middleware';

const ServiceRouter = express.Router();

ServiceRouter.use(requireClerkAuth);

// GET /api/services - Get all services
ServiceRouter.get('/', getAllServices);

// GET /api/services/:serviceId - Get service by ID
ServiceRouter.get('/:serviceId', getServiceById);

// POST /api/services - Create a new service
ServiceRouter.post('/', requireAdminRole, createService);

// PUT /api/services/:serviceId - Update service by ID
ServiceRouter.put('/:serviceId', requireAdminRole, updateServiceById);

// DELETE /api/services/:serviceId - Delete service by ID
ServiceRouter.delete('/:serviceId', requireAdminRole, deleteServiceById);

export default ServiceRouter;
