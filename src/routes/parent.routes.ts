import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // TODO: Implement get all parents
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/:id", (req: Request, res: Response) => {
  // TODO: Implement get parent details
  res.status(501).json({ message: "Not implemented yet" });
});

router.post("/", (req: Request, res: Response) => {
  // TODO: Implement create parent
  res.status(501).json({ message: "Not implemented yet" });
});

router.put("/:id", (req: Request, res: Response) => {
  // TODO: Implement update parent
  res.status(501).json({ message: "Not implemented yet" });
});

router.delete("/:id", (req: Request, res: Response) => {
  // TODO: Implement delete parent
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/:id/children", (req: Request, res: Response) => {
  // TODO: Implement get children of parent
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
