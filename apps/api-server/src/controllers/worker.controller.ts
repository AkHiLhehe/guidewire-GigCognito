import { Request, Response } from "express";
import { updateWorkerProfile } from "../services/worker/worker-profile.service";

// PUT /worker/profile
export async function putWorkerProfile(req: Request, res: Response) {
	const workerId = req.user?.id || req.body.workerId;
	if (!workerId) {
		return res.status(400).json({ success: false, message: "workerId required" });
	}
	const updates = req.body;
	const updated = await updateWorkerProfile(workerId, updates);
	if (!updated) {
		return res.status(500).json({ success: false, message: "Failed to update profile" });
	}
	res.json({ success: true, worker: updated });
}
