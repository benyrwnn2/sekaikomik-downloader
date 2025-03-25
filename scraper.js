const axios = require("axios");
const cheerio = require("cheerio");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const downloadsDir = path.join(__dirname, "downloads");
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

async function DownloadAndConvertToPDF(url) {
  try {
    let res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    let $ = cheerio.load(res.data);
    let title = $("div.headpost").find("h1").text().trim() || "Judul tidak ditemukan";
    let scripts = $("script").map((idx, el) => $(el).html()).toArray();
    let scriptData = scripts.find((v) => v && v.includes('"images":'));

    if (!scriptData) throw new Error("Data gambar tidak ditemukan.");
    let match = scriptData.match(/"images":\s*(\[.*?\])/);
    if (!match) throw new Error("Format data gambar tidak sesuai.");

    let imageData;
    try {
      imageData = JSON.parse(match[1]);
    } catch (e) {
      throw new Error("Gagal parsing data gambar: " + e.message);
    }

    let images = imageData.map((v) => encodeURI(v));
    console.log(`Mengunduh ${images.length} gambar...`);

    const totalImages = images.length;
    const middleImageIndex = Math.floor(totalImages / 2);

    let thumbnailPath = "";
    if (middleImageIndex < images.length) {
      try {
        const middleImageUrl = images[middleImageIndex];
        const response = await axios.get(middleImageUrl, { responseType: "arraybuffer" });
        const middleImageBuffer = Buffer.from(response.data);
        thumbnailPath = path.join(publicDir, `thumbnail-${Date.now()}.jpg`);
        fs.writeFileSync(thumbnailPath, middleImageBuffer);
        console.log(`Gambar pertengahan disimpan sebagai ${thumbnailPath} (gambar ${middleImageIndex + 1})`);
      } catch (err) {
        console.error(`Gagal menyimpan thumbnail.jpg: ${err.message}`);
      }
    }

    const doc = new PDFDocument({ margin: 0 });
    const pdfFileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.pdf`;
    const pdfPath = path.join(downloadsDir, pdfFileName);
    doc.pipe(fs.createWriteStream(pdfPath));

    for (let i = 0; i < images.length; i++) {
      try {
        const imageUrl = images[i];
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data);
        const img = doc.openImage(imageBuffer);

        const pageWidth = img.width;
        const pageHeight = img.height;

        if (i > 0) {
          doc.addPage({ size: [pageWidth, pageHeight] });
        } else {
          doc.page.width = pageWidth;
          doc.page.height = pageHeight;
        }

        doc.image(imageBuffer, 0, 0, {
          width: pageWidth,
          height: pageHeight,
        });

        console.log(`Gambar ${i + 1}/${images.length} selesai ditambahkan: ${pageWidth}x${pageHeight}`);
      } catch (err) {
        console.error(`Gagal mengunduh atau menambahkan gambar ${images[i]}: ${err.message}`);
      }
    }

    doc.end();
    console.log(`PDF berhasil dibuat: ${pdfPath}`);
    return { title, pdfFileName, thumbnailPath };
  } catch (error) {
    console.error("Error in DownloadAndConvertToPDF:", error.message);
    return null;
  }
}

async function getLatestComics() {
  try {
    let res = await axios.get(`https://www.sekaikomik.lat/manga/?order=update`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      timeout: 10000,
    });
    let $ = cheerio.load(res.data);
    let latestComics = [];
    let elements = $(".listupd .bs");
    if (elements.length === 0) {
      elements = $(".list-update .bsx");
    }
    elements.each((index, element) => {
      if (index >= 5) return false;
      let title = $(element).find(".tt").text().trim() || $(element).find(".title").text().trim() || "Unknown Title";
      let link = $(element).find("a").attr("href") || "#";
      let thumbnail = $(element).find("img").attr("src") || "";
      let chapter = $(element).find(".epxs").text().trim() || $(element).find(".chapter").text().trim() || "N/A";
      let rating = $(element).find(".numscore").text().trim() || $(element).find(".rating").text().trim() || "N/A";
      latestComics.push({ title, link, thumbnail, chapter, rating });
    });
    return latestComics;
  } catch (error) {
    console.error("[getLatestComics] Error:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("[getLatestComics] Domain tidak ditemukan. Pastikan situs dapat diakses.");
    } else if (error.code === "ETIMEDOUT") {
      console.error("[getLatestComics] Koneksi timeout. Coba lagi atau periksa jaringan.");
    }
    return [];
  }
}

async function Search(query, page = 1) {
  try {
    const url = `https://www.sekaikomik.lat/page/${page}/?s=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    let $ = cheerio.load(data);
    let result = [];
    $("div.bs").each((index, element) => {
      let title = $(element).find("a").attr("title") || "Unknown Title";
      let chapter = $(element).find(".epxs").text().replace("Chapter", "").trim() || "N/A";
      let rating = $(element).find(".numscore").text().trim() || "N/A";
      let thumbnail = $(element).find("img").attr("src") || "";
      let link = $(element).find("a").attr("href") || "#";
      result.push({ title, chapter, rating, thumbnail, link });
    });
    return result;
  } catch (error) {
    console.error("Error in Search:", error.message);
    return [];
  }
}

module.exports = { DownloadAndConvertToPDF, getLatestComics, Search };