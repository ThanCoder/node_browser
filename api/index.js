const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// puppeteer.use(StealthPlugin());

const app = express();

app.get("/", async (req, res) => {
  try {
    const url = req.query.url;
    const delaySec = req.query.delaySec;
    if (!url) {
      res.send("please provide `?delaySec=[1]`&&`url=[url]` delaySec-> optional");
      return;
    }
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      headless: true, // Vercel မှာ headless mode ကိုအသုံးပြုပါ
      args: chromium.args,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // await page.waitForFunction(() => document.readyState === "complete");

    if(delaySec){
      // ✅ 5 sec delay
      await new Promise(resolve => setTimeout(resolve, 1000 * delaySec));
      console.log(delaySec);
      
    }

    // 📌 HTML content ကိုရယူ
    const content = await page.evaluate(
      () => document.documentElement.outerHTML
    );

    await browser.close();

    res.send(content);
  } catch (error) {
    res.send(`error: ${error}`);
  }
});

app.get("/screenshot", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      res.send("please provide `?url=[url]`");
      return;
    }

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url);

    const screenshot = await page.screenshot({ encoding: "base64" });
    await browser.close();

    res.send(`<img src="data:image/png;base64,${screenshot}" />`);
  } catch (error) {
    res.send(`error: ${error}`);
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
