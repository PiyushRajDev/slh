import { Request, Response } from "express";
import { ProfileService } from "../../services/profile.service";
import { getProfileSchema } from "../../utils/validator";
import { enqueueProfileFetch } from "../../queue/profile.queue";

const service = new ProfileService();

export async function getProfile(req: Request, res: Response) {
    const parsed = getProfileSchema.safeParse(req.params);

    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    const { studentId, platform } = parsed.data;

    const result = await service.getProfileStatus(studentId, platform);

    return res.json(result);
}

export async function refreshProfile(req: Request, res: Response) {
    const parsed = getProfileSchema.safeParse(req.params);

    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    const { studentId, platform } = parsed.data;

    const canRefresh = await service.canRefresh(studentId, platform);

    if (!canRefresh) {
        return res.status(429).json({
            error: "Refresh cooldown active",
        });
    }

    const result = await enqueueProfileFetch(studentId, platform);

    if (result.alreadyScheduled) {
        return res.json({
            status: "refresh_already_scheduled",
        });
    }

    return res.json({
        status: "refresh_scheduled",
    });

}
