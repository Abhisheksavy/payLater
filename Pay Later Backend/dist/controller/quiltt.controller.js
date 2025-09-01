class QuilttController {
    async sessions(req, res) {
        try {
            const userId = req.userId;
            const response = await fetch("https://auth.quiltt.io/v1/users/sessions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.QUILTT_API_SECRET}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            const data = await response.json();
            return res.json(data);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    async transactions(req, res) {
        try {
            const { profileId } = req.params;
            const query = `
        query Transactions {
          transactions {
            edges {
              node {
                id
                date
                amount
                description
                status
              }
            }
          }
        }
      `;
            const basicAuth = Buffer.from(`${profileId}:${process.env.QUILTT_API_SECRET}`).toString("base64");
            const response = await fetch("https://api.quiltt.io/v1/graphql", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            return res.json(data);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    async accounts(req, res) {
        try {
            const { profileId } = req.params;
            const query = `
        query Accounts {
          accounts {
            id
            name
            mask
            type
            balance {
              available
              current
            }
          }
        }
      `;
            const basicAuth = Buffer.from(`${profileId}:${process.env.QUILTT_API_SECRET}`).toString("base64");
            const response = await fetch("https://api.quiltt.io/v1/graphql", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            return res.json(data);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
}
export const quilttController = new QuilttController();
//# sourceMappingURL=quiltt.controller.js.map