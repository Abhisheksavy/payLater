import app from "../src/app.js";

// Express apps are (req, res) handlers
export default function handler(req: any, res: any) {
  return app(req, res);
}
