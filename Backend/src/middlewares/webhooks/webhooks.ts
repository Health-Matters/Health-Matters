import express, { NextFunction, Request, Response } from "express";
import { Webhook } from "svix";
import { User } from "./../../models/User";
import { clerkClient } from "@clerk/express";

const webhooksRouter = express.Router();

webhooksRouter.post(
  "/clerk",
  // Force Raw Body — must come before express.json() for svix signature verification
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payloadString = req.body.toString();
      const svixHeaders = req.headers;

      if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SIGNING_SECRET in .env");
      }

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET);
      const evt: any = wh.verify(payloadString, svixHeaders as any);

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
        const existing = await User.findOne({ clerkUserId: id });
        if (existing) {
          console.log(`user.created: user ${id} already exists, skipping.`);
          return res.status(200).json({ success: true });
        }

        // If admin pre-provisioned user by email, link the Clerk account here.
        const existingByEmail = await User.findOne({ email });
        if (existingByEmail) {
          const updateFields: Record<string, unknown> = {
            clerkUserId: id,
            isActive: true,
          };

          if (!existingByEmail.firstName && first_name) updateFields.firstName = first_name;
          if (!existingByEmail.lastName && last_name) updateFields.lastName = last_name;

          const baseUsername = username || email.split("@")[0];
          if (!existingByEmail.userName) {
            const exists = await User.findOne({ userName: baseUsername, _id: { $ne: existingByEmail._id } });
            updateFields.userName = exists ? `${baseUsername}_${id.slice(-6)}` : baseUsername;
          }

          await User.findByIdAndUpdate(existingByEmail._id, { $set: updateFields }, { new: true, runValidators: true });

          // Source of truth for onboarding role is the admin-provisioned DB role.
          if (existingByEmail.role) {
            await clerkClient.users.updateUser(id, {
              publicMetadata: { role: existingByEmail.role },
            });
          }

          console.log(`✅ user.created: linked pre-provisioned user by email (${email}) to Clerk ID ${id}`);
          return res.status(200).json({ success: true });
        }

        // Build a unique userName — fall back to email prefix, then append
        // a short segment of the Clerk ID to avoid collisions (userName is unique)
        const baseUsername = username || email.split("@")[0];
        const exists = await User.findOne({ userName: baseUsername });
        const finalUsername = exists ? `${baseUsername}_${id.slice(-6)}` : baseUsername;

        await User.create({
          clerkUserId: id,
          email,
          userName: finalUsername,
          firstName: first_name,
          lastName: last_name,
          role: (public_metadata?.role as string) || "employee",
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
        const updateFields: Record<string, unknown> = {};

        const email = email_addresses?.[0]?.email_address;
        if (email)        updateFields.email     = email;
        if (first_name)   updateFields.firstName = first_name;
        if (last_name)    updateFields.lastName  = last_name;
        if (username)     updateFields.userName  = username;

        // Role is set via Clerk's Public Metadata in the Clerk dashboard
        const role = public_metadata?.role;
        if (role) updateFields.role = role;

        if (Object.keys(updateFields).length === 0) {
          console.log(`user.updated: no relevant fields changed for ${id}, skipping DB write.`);
          return res.status(200).json({ success: true });
        }

        let updated = await User.findOneAndUpdate(
          { clerkUserId: id },
          { $set: updateFields },
          { new: true, runValidators: true }
        );

        // If record not linked by Clerk ID yet, fallback to email-based linking.
        if (!updated && email) {
          updated = await User.findOneAndUpdate(
            { email },
            { $set: { ...updateFields, clerkUserId: id } },
            { new: true, runValidators: true }
          );
        }

        if (!updated) {
          // User not in DB yet — can happen if the webhook fires before user.created is processed
          console.warn(`user.updated: no DB record found for clerkUserId ${id}`);
        } else {
          console.log(`✅ user.updated: synced fields [${Object.keys(updateFields).join(", ")}] for ${id}`);
        }
      }

      // ── user.deleted ────────────────────────────────────────────────────────
      if (eventType === "user.deleted") {
        const { id } = evt.data;
        const deleted = await User.findOneAndDelete({ clerkUserId: id });
        if (deleted) {
          console.log(`✅ user.deleted: removed user ${id}`);
        } else {
          console.warn(`user.deleted: no DB record found for clerkUserId ${id}`);
        }
      }

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error("❌ Webhook error:", error);
      next(error);
    }
  }
);

export default webhooksRouter;
