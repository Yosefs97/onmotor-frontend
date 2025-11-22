// upload-interactive.js
import readline from "readline";
import cloudinary from "cloudinary";
import https from "https";

// === Cloudinary config ===
cloudinary.v2.config({
  cloud_name: "ddhq0mwiz",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === Helpers ===

// מנקה קלט ומחלץ ממנו רק כתובות תקינות של תמונות
function extractCleanUrls(raw) {
  if (!raw) return [];

  return raw
    .split(/[\n\r,]+/) // מפריד לפי שורות ופסיקים
    .map((s) => s.replace(/[\[\]"]/g, "").trim()) // מוריד סוגריים, מרכאות, רווחים
    .filter((line) => line.startsWith("http")) // רק לינקים אמיתיים
    .filter((url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url)); // רק תמונות
}

// מוריד קובץ URL ומחזיר buffer
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
      })
      .on("error", reject);
  });
}

// === CLI Interface ===
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

(async function main() {
  console.log("\n📁 כלי העלאת קישורים ל-Cloudinary\n");

  // === תיקייה ===
  const folder = await ask("📁 שם התיקייה ב-Cloudinary: ");

  // === קישורים ===
  console.log(
    "\n🔗 הדבק את רשימת הקישורים (JSON, מערך או כל פורמט אחר).\nלסיום — השאר שורה ריקה ולחץ Enter.\n"
  );

  let rawLinks = "";
  while (true) {
    const line = await ask("");
    if (!line.trim()) break;
    rawLinks += line + "\n";
  }

  const urls = extractCleanUrls(rawLinks);

  console.log(`\n⬆️ מעלה ${urls.length} תמונות לתיקייה: ${folder}\n`);

  for (const url of urls) {
    try {
      console.log(`⏳ מוריד: ${url}`);
      const buffer = await downloadImage(url);

      const uploaded = await cloudinary.v2.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            console.error("❌ שגיאת העלאה:", error.message);
          } else {
            console.log(`✅ הועלה: ${result.secure_url}`);
          }
        }
      );

      const stream = cloudinary.v2.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) {
            console.error("❌ שגיאה:", err.message);
          } else {
            console.log(`✅ הועלה: ${result.secure_url}`);
          }
        }
      );

      stream.end(buffer);
    } catch (err) {
      console.log(`❌ נכשל: ${url}`);
    }
  }

  console.log("\n🎉 סיום — כל העלאות הסתיימו!\n");
  rl.close();
})();
