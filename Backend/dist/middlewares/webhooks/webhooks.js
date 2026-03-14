"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const svix_1 = require("svix");
const User_1 = require("./../../models/User");
const express_2 = require("@clerk/express");
const webhooksRouter = express_1.default.Router();
webhooksRouter.post("/clerk", 
// Force Raw Body — must come before express.json() for svix signature verification
express_1.default.raw({ type: "application/json" }), async (req, res, next) => {
    try {
        const payloadString = req.body.toString();
        const svixHeaders = req.headers;
        if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
            throw new Error("Missing CLERK_WEBHOOK_SIGNING_SECRET in .env");
        }
        const wh = new svix_1.Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET);
        const evt = wh.verify(payloadString, svixHeaders);
        const eventType = evt.type;
        console.log(`✅ Webhook received: ${eventType}`);
        // ── user.created ────────────────────────────────────────────────────────
        if (eventType === "user.created") {
            const { id, email_addresses, username, first_name, last_name, public_metadata } = evt.data;
            const email = email_addresses?.[0]?.email_address;
            if (!email) {
                console.warn("⚠️  user.created: no email address in payload, skipping.");
                return res.status(200).json({ success: true });
            }
            // Deduplicate — Clerk can occasionally fire the event twice
            const existing = await User_1.User.findOne({ clerkUserId: id });
            if (existing) {
                console.log(`user.created: user ${id} already exists, skipping.`);
                return res.status(200).json({ success: true });
            }
            // If admin pre-provisioned user by email, link the Clerk account here.
            const existingByEmail = await User_1.User.findOne({ email });
            if (existingByEmail) {
                const updateFields = {
                    clerkUserId: id,
                    isActive: true,
                };
                if (!existingByEmail.firstName && first_name)
                    updateFields.firstName = first_name;
                if (!existingByEmail.lastName && last_name)
                    updateFields.lastName = last_name;
                const baseUsername = username || email.split("@")[0];
                if (!existingByEmail.userName) {
                    const exists = await User_1.User.findOne({ userName: baseUsername, _id: { $ne: existingByEmail._id } });
                    updateFields.userName = exists ? `${baseUsername}_${id.slice(-6)}` : baseUsername;
                }
                await User_1.User.findByIdAndUpdate(existingByEmail._id, { $set: updateFields }, { new: true, runValidators: true });
                // Source of truth for onboarding role is the admin-provisioned DB role.
                if (existingByEmail.role) {
                    await express_2.clerkClient.users.updateUser(id, {
                        publicMetadata: { role: existingByEmail.role },
                    });
                }
                console.log(`✅ user.created: linked pre-provisioned user by email (${email}) to Clerk ID ${id}`);
                return res.status(200).json({ success: true });
            }
            // Build a unique userName — fall back to email prefix, then append
            // a short segment of the Clerk ID to avoid collisions (userName is unique)
            const baseUsername = username || email.split("@")[0];
            const exists = await User_1.User.findOne({ userName: baseUsername });
            const finalUsername = exists ? `${baseUsername}_${id.slice(-6)}` : baseUsername;
            await User_1.User.create({
                clerkUserId: id,
                email,
                userName: finalUsername,
                firstName: first_name,
                lastName: last_name,
                role: public_metadata?.role || "employee",
            });
            console.log(`✅ user.created: created user ${finalUsername} (${id})`);
        }
        // ── user.updated ────────────────────────────────────────────────────────
        // Bug fix: previously only synced public_metadata.role, which is undefined
        // for most users → Mongoose stripped it → update was a silent no-op.
        // Now syncs all Clerk-managed fields that are present in the payload.
        if (eventType === "user.updated") {
            const { id, email_addresses, username, first_name, last_name, public_metadata } = evt.data;
            // Build the update — only include fields Clerk actually provided
            const updateFields = {};
            const email = email_addresses?.[0]?.email_address;
            if (email)
                updateFields.email = email;
            if (first_name)
                updateFields.firstName = first_name;
            if (last_name)
                updateFields.lastName = last_name;
            if (username)
                updateFields.userName = username;
            // Role is set via Clerk's Public Metadata in the Clerk dashboard
            const role = public_metadata?.role;
            if (role)
                updateFields.role = role;
            if (Object.keys(updateFields).length === 0) {
                console.log(`user.updated: no relevant fields changed for ${id}, skipping DB write.`);
                return res.status(200).json({ success: true });
            }
            let updated = await User_1.User.findOneAndUpdate({ clerkUserId: id }, { $set: updateFields }, { new: true, runValidators: true });
            // If record not linked by Clerk ID yet, fallback to email-based linking.
            if (!updated && email) {
                updated = await User_1.User.findOneAndUpdate({ email }, { $set: { ...updateFields, clerkUserId: id } }, { new: true, runValidators: true });
            }
            if (!updated) {
                // User not in DB yet — can happen if the webhook fires before user.created is processed
                console.warn(`user.updated: no DB record found for clerkUserId ${id}`);
            }
            else {
                console.log(`✅ user.updated: synced fields [${Object.keys(updateFields).join(", ")}] for ${id}`);
            }
        }
        // ── user.deleted ────────────────────────────────────────────────────────
        if (eventType === "user.deleted") {
            const { id } = evt.data;
            const deleted = await User_1.User.findOneAndDelete({ clerkUserId: id });
            if (deleted) {
                console.log(`✅ user.deleted: removed user ${id}`);
            }
            else {
                console.warn(`user.deleted: no DB record found for clerkUserId ${id}`);
            }
        }
        return res.status(200).json({ success: true });
    }
    catch (error) {
        console.error("❌ Webhook error:", error);
        next(error);
    }
});
exports.default = webhooksRouter;
