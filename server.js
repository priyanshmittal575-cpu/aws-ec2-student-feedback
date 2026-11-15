const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "feedback.json");

if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json"
};

const server = http.createServer((req, res) => {
  // API: Get all feedback
  if (req.method === "GET" && req.url === "/api/feedback") {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(data);
  }

  // API: Submit new feedback
  if (req.method === "POST" && req.url === "/api/feedback") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const entry = JSON.parse(body);
        if (!entry.subject || !entry.rating || entry.rating < 1 || entry.rating > 5) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid subject or rating (1-5)." }));
        }

        const list = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
        const record = {
          id: Date.now(),
          studentName: entry.studentName?.trim() || "Anonymous",
          subject: entry.subject.trim(),
          rating: Number(entry.rating),
          comments: entry.comments?.trim() || "",
          createdAt: new Date().toLocaleDateString("en-IN")
        };

        list.unshift(record);
        fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(record));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Malformed JSON payload." }));
      }
    });
    return;
  }

  // Serve static frontend files
  let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => console.log(`Feedback Server running at http://localhost:${PORT}`));