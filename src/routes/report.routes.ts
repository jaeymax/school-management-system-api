import { Router, Request, Response } from "express";

const router = Router();

router.get("/fees", (req: Request, res: Response) => {
  // TODO: Implement generate fee report
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/attendance", (req: Request, res: Response) => {
  // TODO: Implement generate attendance report
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/grades", (req: Request, res: Response) => {
  // TODO: Implement generate grade report
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
