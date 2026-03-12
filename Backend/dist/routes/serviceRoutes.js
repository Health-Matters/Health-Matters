"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../controllers/serviceController");
const ServiceRouter = express_1.default.Router();
// GET /api/services - Get all services
ServiceRouter.get('/', serviceController_1.getAllServices);
// GET /api/services/:serviceId - Get service by ID
ServiceRouter.get('/:serviceId', serviceController_1.getServiceById);
// POST /api/services - Create a new service
ServiceRouter.post('/', serviceController_1.createService);
// PUT /api/services/:serviceId - Update service by ID
ServiceRouter.put('/:serviceId', serviceController_1.updateServiceById);
// DELETE /api/services/:serviceId - Delete service by ID
ServiceRouter.delete('/:serviceId', serviceController_1.deleteServiceById);
exports.default = ServiceRouter;
