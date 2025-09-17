import app from "../src/app";

// Express apps are (req, res) handlers
export default function handler(req: any, res: any) {
  return app(req, res);
}
