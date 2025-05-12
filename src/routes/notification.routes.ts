import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // TODO: Implement get all notifications for a user
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/:id", (req: Request, res: Response) => {
  // TODO: Implement get notification details
  res.status(501).json({ message: "Not implemented yet" });
});

router.post("/", (req: Request, res: Response) => {
  // TODO: Implement send notification
  res.status(501).json({ message: "Not implemented yet" });
});

router.delete("/:id", (req: Request, res: Response) => {
  // TODO: Implement delete notification
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
