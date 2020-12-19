const scraperObject = {
    url: 'https://www.uradprace.cz/web/en/vacancies-search-3',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url);

    }
}

module.exports = scraperObject;