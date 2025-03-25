const express = require("express");
const path = require("path");
const fs = require("fs");
const { DownloadAndConvertToPDF, getLatestComics, Search } = require("./scraper");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/downloads", express.static(path.join(__dirname, "downloads")));

app.get("/", (req, res) => {
  console.log("[Server] Route / dipanggil");
  const htmlPath = path.join(__dirname, "public", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  res.send(html);
});

app.get("/api/latest", async (req, res) => {
  try {
    const latestComics = await getLatestComics();
    res.json(latestComics);
  } catch (err) {
    console.error(`[Server] Error in /api/latest: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL diperlukan" });
  }
  try {
    const result = await DownloadAndConvertToPDF(url);
    if (!result) {
      return res.status(500).json({ error: "Gagal membuat PDF" });
    }
    const thumbnailRelativePath = path.basename(result.thumbnailPath);
    res.json({
      pdfFileName: result.pdfFileName,
      thumbnailPath: `/${thumbnailRelativePath}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query diperlukan" });
  }
  try {
    const result = await Search(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
console.log("[Server] Starting server...");
app.listen(3000, () => {
  console.log("[Server] Server berjalan di port 3000");
});