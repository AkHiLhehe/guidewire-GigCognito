import { PrismaClient, Worker } from "@prisma/client";

const prisma = new PrismaClient();

export type WorkerProfileUpdate = {
	name?: string;
	city?: string;
	zoneId?: string;
	platformId?: string;
	upiId?: string;
};

export async function updateWorkerProfile(workerId: string, updates: WorkerProfileUpdate): Promise<Worker | null> {
	try {
		const updated = await prisma.worker.update({
			where: { id: workerId },
			data: updates,
		});
		return updated;
	} catch (err) {
		console.error("[updateWorkerProfile]", err);
		return null;
	}
}
