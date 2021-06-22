const fs = require('fs')
const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch()
        let json = []
        for (let i = 1; i < 72; i++) {
            let url = `https://sam.gov/search/?index=sca&page=${i}&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BpublishedDate%5D%5BpublishedDateSelect%5D=customDate`
            const page = await browser.newPage()
            await page.goto(url, { waitUntil: 'networkidle0' })
            const html = await page.evaluate(() => {
                const ids = document.querySelectorAll('h3 > a')
                const revs = document.querySelectorAll('div.sds-field__value')
                let idsArray = []
                let revsArray = []
                for (let i = 0; i < ids.length; i++) {
                    idsArray.push({
                        'id': ids[i].innerText
                    })
                }
                for (let i = 0; i < revs.length; i++) {
                    revsArray.push({
                        'rev': revs[i].innerText
                    })
                }
                return [idsArray, revsArray.filter(rev => !isNaN(rev.rev))]
            })
            for (let i = 0; i < html[0].length; i++) {
                json.push({
                    'id': html[0][i].id,
                    'rev': html[1][i].rev
                })
            }
        }
        fs.writeFileSync('wds.json', JSON.stringify(json))
        await browser.close()
    } catch (err) {
        console.log(err)
    }
})()