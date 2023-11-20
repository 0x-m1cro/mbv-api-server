// app.js
process.setMaxListeners(0)
//const cors = require('cors')
const fs = require('fs')
const express = require('express');
const app = express();
const chrome = require("chrome-aws-lambda");
const path = require("path")
app.use(express.json());
//const NodeCache = require('node-cache');
// const compression = require('compression');
// app.use(compression()); 

//app.use(cors())
//const cache = new NodeCache(); 

app.get('/', async (req, res) => { res.send({
  body: "Welcome!",
});  })

//Anextour api routes
app.get('/anex/hotels', async (req, res) => { 
  // const cacheKey = 'anex';
  // let cachedData = cache.get(cacheKey);
  const api = "https://api.anextour.com/search/Hotels?SEARCH_MODE=b2c&SEARCH_TYPE=PACKET_ONLY_HOTELS&lang=&state=maldives&townFrom=1"

  try {
    const options = {
      args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
      executablePath: await chrome.executablePath,
      headless: "new",
    };
    const browser = await chrome.puppeteer.launch(options);
    const page = await browser.newPage();

    await page.goto(
      api,
      {
        waitUntil: "networkidle0",
      }
    );
    // let html = await page.evaluate(() => {
    //   return JSON.parse(document.querySelector("body").innerText);
    // });
    let body = await page.waitForSelector('body');
    let json = await body?.evaluate(el => el.textContent);
    await browser.close();   
    // if (!cachedData) {
    //   cache.set(cacheKey, json);
    //   cachedData = json;    
    //  }
    res.status(200).json(json);       
  } catch (error) {
    console.log(error);
    await browser.close();   
    res.statusCode = 500;
    res.json({
      body: "Sorry, Something went wrong!",
    });
  }


})

app.get('/anex/hotel', async (req, res) => { 
  let query = req.query;
  const { hotel } = query;

  const api = `https://api.anextour.com/b2c/Hotel?hotel=${hotel}&lang=eng`

  try {
    const options = {
      args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
      executablePath: await chrome.executablePath,
      headless: "new",
    };
    const browser = await chrome.puppeteer.launch(options);
    const page = await browser.newPage();

    await page.goto(
      api,
      {
        waitUntil: "networkidle0",
      }
    );
    // let html = await page.evaluate(() => {
    //   return JSON.parse(document.querySelector("body").innerText);
    // });
    let body = await page.waitForSelector('body');
    let json = await body?.evaluate(el => el.textContent);
    await browser.close();   
    res.status(200).json(json);       
  } catch (error) {
    console.log(error);
    await browser.close();   
    res.statusCode = 500;
    res.json({
      body: "Sorry, Something went wrong!",
    });
  }


})

//Hotelscan api routes
app.get('/scan', async (req, res) => {
  let query = req.query;
  const { hotelid, checkin, checkout } = query;

  try {
      const options = {
        args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
        executablePath: await chrome.executablePath,
        headless: "new",
      };
      const browser = await chrome.puppeteer.launch(options);
      const page = await browser.newPage();
  
      await page.goto(
        `https://hotelscan.com/combiner/${hotelid}?pos=zz&locale=en&checkin=${checkin}&checkout=${checkout}&rooms=2&mobile=0&loop=1&country=MV&ef=1&geoid=xmmmamtksdxx&toas=resort&availability=1&deviceNetwork=4g&deviceCpu=20&deviceMemory=8&limit=25&offset=0`,
        {
          waitUntil: "networkidle2",
          timeout: 0
        }
      );
      await page.goto(
        `https://hotelscan.com/combiner/${hotelid}?pos=zz&locale=en&checkin=${checkin}&checkout=${checkout}&rooms=2&mobile=0&loop=1&country=MV&ef=1&geoid=xmmmamtksdxx&toas=resort&availability=1&deviceNetwork=4g&deviceCpu=20&deviceMemory=8&limit=25&offset=0`,
        {
          waitUntil: "networkidle2",
          timeout: 0
        }
      );
      // let html = await page.evaluate(() => {
      //   return JSON.parse(document.querySelector("body").innerText);
      // });
      let body = await page.waitForSelector('body');
      let json = await body?.evaluate(el => JSON.parse(el.textContent));
      await browser.close();   
      res.status(200).json(json);           
    } catch (error) {
      console.log(error); 
      res.statusCode = 500;
      res.json({
        body: "Sorry, Something went wrong!",
      });
    }
    
  });

app.get('/maldives', async (req, res) => {  
  // const cacheKey = 'maldives';
  // let cachedData = cache.get(cacheKey);
  const readFile = (path, opts = 'utf8') =>
    new Promise((resolve, reject) => {
      fs.readFile(path, opts, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
  })
  try {
    const jsonDirectory = path.join(process.cwd(), "json");
    const jsondata = await readFile(jsonDirectory + "/maldives.json");    
    // if (!cachedData) {
    //   cache.set(cacheKey, jsondata);
    //   cachedData = jsondata;    
    //  }
     res.status(200).json(jsondata);
  } catch (error) {
    console.log(error)
  }
  
  
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
