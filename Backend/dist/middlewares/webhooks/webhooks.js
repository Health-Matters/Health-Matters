"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webhooks_1 = require("@clerk/express/webhooks");
const User_1 = require("./../../models/User");
const webhooksRouter = express_1.default.Router();
webhooksRouter.post("/clerk", express_1.default.raw({ type: "application/json" }), async (req, res) => {
    try {
        const evt = await (0, webhooks_1.verifyWebhook)(req);
        // Do something with payload
        // For this guide, log payload to console
        const { id } = evt.data;
        const eventType = evt.type;
        console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
        console.log("Webhook payload:", evt.data);
        if (eventType === "user.created") {
            const { id } = evt.data;
            const user = await User_1.User.findOne({ clerkUserId: id });
            if (user) {
                console.log("User already exists");
                return;
            }
            await User_1.User.create({
                userName: evt.data.username,
                firstName: evt.data.first_name,
                lastName: evt.data.last_name,
                email: evt.data.email_addresses[0].email_address,
                clerkUserId: id,
            });
        }
        if (eventType === "user.updated") {
            const { id } = evt.data;
            const user = await User_1.User.findOneAndUpdate({ clerkUserId: id });
            role: evt.data.public_metadata?.role;
        }
        if (eventType === "user.deleted") {
            const { id } = evt.data;
            await User_1.User.findOneAndDelete({ clerkUserId: id });
        }
        // Modify User entity and fix errors as needed for other event types
        return res.send("Webhook received");
    }
    catch (err) {
        console.error("Error verifying webhook:", err);
        return res.status(400).send("Error verifying webhook");
    }
});
exports.default = webhooksRouter;
