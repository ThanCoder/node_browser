const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      res.send("please provide `?url=[url]`");
      return;
    }
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // "--proxy-server=http://192.168.191.253:8080", // Proxy URL ထည့်မယ်
      ],
    });
    const page = await browser.newPage();
    await page.goto(url);

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
