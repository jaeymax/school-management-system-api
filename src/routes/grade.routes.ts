import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // TODO: Implement get all grade records
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/:id", (req: Request, res: Response) => {
  // TODO: Implement get grade record details
  res.status(501).json({ message: "Not implemented yet" });
});

router.post("/", (req: Request, res: Response) => {
  // TODO: Implement create grade record
  res.status(501).json({ message: "Not implemented yet" });
});

router.put("/:id", (req: Request, res: Response) => {
  // TODO: Implement update grade record
  res.status(501).json({ message: "Not implemented yet" });
});

router.delete("/:id", (req: Request, res: Response) => {
  // TODO: Implement delete grade record
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/student/:id", (req: Request, res: Response) => {
  // TODO: Implement get grade records for specific student
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
