// const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer');
let canbasX;

const getSchedule = async function (name) {
    let launchOptions = {
        // headless: false,
        // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        // DuserDataDir: 'C:/Users/vky/Documents/temp/chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    };

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    let gg = `
    https://docs.google.com/spreadsheets/u/0/d/1gPElP_uBKFwGkVr3eW1LxVk_nEZrN948XSZcm0q-Pio/preview/sheet?gid=446426204
    `
    await page.goto(gg);
    await page.waitForTimeout(1000)
    canbasX = await page.evaluate((name) => {
        document.body.style.background = 'yellow';
        const whiteList = ["SEMANA", "BARCELONA", "REPARTIDOR", name];
        const blackList = ["BARCELONA SUR (JE)", "BARCELONA CENTRO"];
        let i = 1;
        [...document.getElementsByTagName("tr")].forEach(function (tr) {

            if (i > 10 && !whiteList.some(el => tr.innerText.includes(el))) {
                console.log(tr);
                tr.style.display = "none"
            }
            if (blackList.some(el => tr.innerText.includes(el))) {
                console.log(tr);
                tr.style.display = "none"
            }

            i++
        })


        var script = document.createElement('script');

        script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";

        document.head.appendChild(script); //or something of the likes
        script.onload = function () {
            html2canvas(document.querySelector("tbody")).then(oldCanvas => {
                let DayWidth = 2641, elementHeight = 270, offset = 748

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                canvas.width = DayWidth;
                canvas.id = "canvasTT"
                canvas.height = oldCanvas.height * 10;
                context.fillStyle = "white";

                // let DayWidth = 2479, elementHeight = 250, offset = 940
                context.drawImage(oldCanvas, -offset, 0);
                context.drawImage(oldCanvas, -(offset + DayWidth * 1), elementHeight * 1);
                context.drawImage(oldCanvas, -(offset + DayWidth * 2), elementHeight * 2);
                context.drawImage(oldCanvas, -(offset + DayWidth * 3), elementHeight * 3);
                context.drawImage(oldCanvas, -(offset + DayWidth * 4), elementHeight * 4);
                context.drawImage(oldCanvas, -(offset + DayWidth * 5), elementHeight * 5);
                context.drawImage(oldCanvas, -(offset + DayWidth * 6), elementHeight * 6);
                context.drawImage(oldCanvas, -(offset + DayWidth * 7), elementHeight * 7);


                canvas.style.position = "absolute";
                canvas.style.top = "598px";

                document.body.appendChild(canvas)

            });
        };
    }, name);
    // await page.waitForTimeout(3000)
    await page.waitForTimeout(8000)
    // const frame = await (await page.$('#canvasTT')).contentFrame(); 

    let canvasData = await page.evaluate(_ => {
        return document.querySelector('#canvasTT').toDataURL();
    })
    await page.waitForTimeout(1000)

    await browser.close()
    return canvasData
};
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'))
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");

})
app.get('/q/:query', async (req, res) => {
    console.log(req.params.query);

    // res.setHeader('Content-Type', 'image/png');
    // res.sendFile(canbas)
    let sch = await getSchedule(req.params.query)
    res.send('<img src="' + sch + '" />')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})