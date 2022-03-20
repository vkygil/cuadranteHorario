// const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer');
const axios = require('axios').default;
const sharp = require('sharp');

// const puppeteer = require('puppeteer');
let dict = {};
let namesVip = ["THANA SINGH", "HARJOT SINGH", "PRINCE GORAYA"]
let launchOptionsX = {
    // headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    DuserDataDir: 'C:/Users/vky/Documents/temp/chrome',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
};
let launchOptions = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
};

let gg = `
    https://docs.google.com/spreadsheets/u/0/d/1gPElP_uBKFwGkVr3eW1LxVk_nEZrN948XSZcm0q-Pio/preview/sheet?gid=647038523
    `

let browser, page;
//  = await puppeteer.launch(launchOptionsH);
// let page = await browser.newPage();

const getSchedule = async function (name) {
    await page.goto(gg);
    await page.waitForTimeout(1000)
    await page.addStyleTag({ content: '.ritz .waffle .s12 {font-size: 9pt}' })
    await page.addStyleTag({ content: '.ritz .waffle .s13 {font-size: 9pt}' })

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
                let DayWidth = 2641, elementHeight = 270, offset = 768
                // let DayWidth = 2641, elementHeight = 270, offset = 758

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                canvas.width = DayWidth;
                canvas.id = "canvasTT"
                canvas.height = oldCanvas.height * 9;
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

                var currentdate = new Date();
                var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth() + 1) + "/"
                    + currentdate.getFullYear() + " @ "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes()
                // + ":" + currentdate.getSeconds();
                // context.font = '48px serif';
                // context.fillText("datetime", 10, 50); 
                // context.rect(0, elementHeight * 7, DayWidth, 200);
                // context.fillStyle = "#435a6b";
                // context.fill();

                context.font = 'italic 20pt Calibri';
                context.fillStyle = "black";
                context.fillText(datetime, 50, 50);

                canvas.style.position = "absolute";
                canvas.style.top = "598px";

                document.body.appendChild(canvas)

            });
        };
    }, name);
    // await page.waitForTimeout(3000)
    await page.waitForTimeout(7000)
    // const frame = await (await page.$('#canvasTT')).contentFrame(); 

    let canvasData = await page.evaluate(_ => {
        return document.querySelector('#canvasTT').toDataURL();
    })
    await page.waitForTimeout(1000)

    // await browser.close()
    return canvasData
};

async function createSchedules() {
    for (const name of namesVip) {
        console.log("AUTO: started -" + name + " at  " + new Date().getHours() + ":" + new Date().getMinutes());

        let sch = await getSchedule(name)

        sch = sch.replace("data:image/png;base64,", "")
        let buff = await sharp(Buffer.from(sch, 'base64'))
            .webp({ lossless: true })
            .toBuffer();
        sch = "data:image/webp;base64," + Buffer.from(buff).toString('base64')

        dict[name] = {
            time: +Date.now(),
            img: '<img src="' + sch + '" />',
        };

        // axios.post('http://localhost:3001/upload', {
        axios.post('https://cuadrantex.openode.dev/upload', {
            name: name,
            // img: '<img src="' + sch + '" />',
            img: sch,
            time: new Date().getHours() + ":" + new Date().getMinutes()
        })
            .then(function (response) {
                // console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });

        console.log("AUTO: done - " + name + "  ");

    }
}



const express = require('express')
const app = express()
const port = process.env.PORT || 3003
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'))
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.get('/cache/:query', async (req, res) => {
    let name = req.params.query.trim()
    if (dict[name])
        // res.send()
        res.json({
            html: dict[name].img
        })
    else
        res.json({
            htmlx: '<video controls="" autoplay="" name="media"><source src="https://i.imgur.com/w80S1jj.mp4" type="video/mp4"></video>'
            , html: '<video autoplay="" name="media" style=" width: 100%; "><source src="https://i.imgur.com/w80S1jj.mp4" type="video/mp4"></video>'
        })

})

app.get('/cache', async (req, res) => {
    res.send("Keys: " + Object.keys(dict))
})


app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`)

    browser = await puppeteer.launch(launchOptions);
    // page = await browser.newPage();
    [page] = await browser.pages();
    page.setDefaultNavigationTimeout(0);


    (async function () {
        while (true) {
            await createSchedules()
            await new Promise(resolve => setTimeout(resolve, 0.7 * 60 * 60 * 1000));
            console.log(Date());
        }
    })();
})