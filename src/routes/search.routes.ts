import { Router, Request, Response } from "express";

const router = Router();

router.get("/students", (req: Request, res: Response) => {
  // TODO: Implement search students by name, class, etc.
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/teachers", (req: Request, res: Response) => {
  // TODO: Implement search teachers by name or subject
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/parents", (req: Request, res: Response) => {
  // TODO: Implement search parents by name or student
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
