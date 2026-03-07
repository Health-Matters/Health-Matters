import express, { NextFunction, Request, Response } from "express";
import { Webhook } from "svix";
import { User } from "./../../models/User"; // Check this path matches your file structure

const webhooksRouter = express.Router();

webhooksRouter.post(
  "/clerk",
  // 1. Force Raw Body for verification (Standard for Clerk)
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payloadString = req.body.toString();
      const svixHeaders = req.headers;

      // 2. Load Secret
      if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SECRET in .env");
      }

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET);
      
      // 3. Verify Signature (Safely)
      // This returns the JSON object if valid, or throws an error if not
      const evt: any = wh.verify(payloadString, svixHeaders as any);

      // Log for debugging
      const eventType = evt.type;
      console.log(`✅ Webhook verified: ${eventType}`);

      // 4. Handle 'user.created'
      if (eventType === "user.created") {
        const { id, email_addresses, username, first_name, last_name } = evt.data;
        
        // Safety: Extract email and generate username fallback if needed
        const email = email_addresses[0]?.email_address;
        if (!email) {
          return res.status(400).json({ success: false, message: "Missing user email" });
        }
        const finalUsername = username || email.split('@')[0];

        // Check for duplicates before creating
        const existingUser = await User.findOne({ clerkUserId: id });
        if (existingUser) {
          console.log("User already exists, skipping.");
          return res.status(200).json({ success: true });
        }

        await User.create({
          clerkUserId: id, // Ensure this matches your DB Schema (clerkId vs clerkUserId)
          email: email,
          userName: finalUsername,
          firstName: first_name,
          lastName: last_name,
        });
        console.log(`User ${finalUsername} created!`);
      }

      // 5. Handle 'user.updated' (FIXED SYNTAX)
      if (eventType === "user.updated") {
        const { id, public_metadata } = evt.data;
        
        await User.findOneAndUpdate(
          { clerkUserId: id }, // Filter
          { role: public_metadata?.role }, // Update Data
          { new: true } // Options
        );
        console.log(`User ${id} updated`);
      }

      // 6. Handle 'user.deleted'
      if (eventType === "user.deleted") {
        const { id } = evt.data;
        await User.findOneAndDelete({ clerkUserId: id });
        console.log(`User ${id} deleted`);
      }

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error("❌ Error verifying webhook:", error);
      next(error); // Pass to global error handler
    }
  }
);

export default webhooksRouter;