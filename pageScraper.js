const scraperObject = {
    url: 'https://www.uradprace.cz/web/en/vacancies-search-3',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url);
        // Wait for the required DOM to be rendered
        await page.waitForSelector('body');
        // Writing needed name of vacancies'
        await page.waitForSelector('#id_9ea1');
        await page.focus('#id_9ea1');
        await page.type('#id_9ea1', 'design');
        // Get the link to all the required vac-s'
        let urls = await page.$$eval('a.with-icon.smaller.no-print-href', links => {
            // Extract the links from the data
            links = links.map(el => el.querySelector('a.with-icon.smaller.no-print-href').href)
            return links;
        });
        console.log(urls);
    }
}

module.exports = scraperObject;