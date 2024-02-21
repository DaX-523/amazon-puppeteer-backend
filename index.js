const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const app = express();
const userAgent = require("user-agents");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/get-details/:keyword", async (req, res, next) => {
  const { keyword } = req.params;
  try {
    console.log(keyword);
    const browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    console.log(userAgent.random().toString());
    await page.setUserAgent(userAgent.random().toString());
    // await page.waitForTimeout((Math.floor(Math.random() * 12) + 5) * 1000);
    await page.goto("https://www.amazon.com");
    // await page.goto("https://www.amazon.com/s?k=" + keyword);

    await page.waitForSelector(".nav-search-field");

    await page.click(".nav-input");
    await page.type(".nav-input", keyword, { delay: 120 });
    await page.click(".nav-search-submit");

    await page.waitForSelector(".s-result-item");
    let price;
    const productCards = await page.$$(".s-result-item.s-widget-spacing-small");
    const productsData = [];
    console.log(productCards.length);
    for (let i = 0; i < productCards.length; i++) {
      const title = await productCards[i].$eval(
        ".s-title-instructions-style",
        (node) => node.innerText.trim()
      );
      await page.waitForSelector(".s-title-instructions-style");
      await page.click(".s-title-instructions-style");
      // Update the selector for the product title
      await page.waitForSelector("#productDescription");
      const elementHandle = await page.$("#productDescription");
      let description = await elementHandle.$$eval("p span", (spans) => {
        return spans.map((span) => span.innerText.trim());
      });
      description = description.join("");
      console.log(title);
      console.log(description);
      await page.waitForSelector(".a-section.review-views.celwidget");
      const productTopReviews = await page.$$(".a-section.review.aok-relative");
      console.log(productTopReviews.length);
      for (let j = 0; j < productTopReviews.length; j++) {
        const profile = await productTopReviews[j].$eval(
          ".a-profile-name",
          (node) => node.innerText.trim()
        );
        console.log(profile);
      }

      break;
      // try {
      //   price = await productCards[i].$eval(".a-price .a-offscreen", (node) =>
      //     node.innerText.trim()
      //   );
      // } catch (error) {
      //   price = await productCards[i].$eval(".a-color-base", (node) =>
      //     node.innerText.trim()
      //   );
      // }
      // console.log(price);
      // const rating = await productCards[i].$eval(
      //   ".a-icon-star-small .a-icon-alt",
      //   (node) => node.innerText.trim()
      // );
      // console.log(rating);
      // const reviews = await productCards[i].$eval(
      //   ".a-size-base.s-underline-text",
      //   (node) => node.innerText.trim()
      // );
      // console.log(reviews);
      // // Add the extracted data to the array
      // productsData.push({ title, price, rating, reviews });

      // if (productsData.length === 4) {
      //   break;
      // }
    }
    console.log(productsData);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("App is listening on 3000");
});
