const scraperObject = {
    url: 'http://books.toscrape.com',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        console.log(`Creating data store...`);
        let scrapedData = [];
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage(){
            console.log(`Waiting for completed rendering of the page...`);
            await page.waitForSelector('.page_inner');
            // Get the link to all the required books
            console.log(`Getting the link to all the required items...`);
            let urls = await page.$$eval('section ol > li', links => {
                // Make sure the book to be scraped is in stock
                console.log(`Making sure the item to be scraped is suitable by all characteristics...`);
                links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
                // Extract the links from the data
                console.log(`Extracting the links from the data...`);
                links = links.map(el => el.querySelector('h3 > a').href)
                return links;
            });
            // Loop through each of those links, open a new page instance and get the relevant data from them
            console.log(`Strating loop through each of those links, open a new page instance and get the relevant data from them...`);
            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                console.log(`Creating object of item for data...`);
                let dataObj = {};
                console.log(`Opening new page of the item by the extracted link...`);
                let newPage = await browser.newPage();
                await newPage.goto(link);
                console.log(`Copying the data...`);
                try {
                    dataObj['title'] = await newPage.$eval('.product_main > h1', text => text.textContent);
                    dataObj['price'] = await newPage.$eval('.price_color', text => text.textContent);
                    // dataObj['noAvailable'] = await newPage.$eval('.instock.availability', text => {
                    //     // Strip new line and tab spaces
                    //     text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                    //     // Get the number of stock available
                    //     let regexp = /^.*\((.*)\).*$/i;
                    //     let stockAvailable = regexp.exec(text)[1].split(' ')[0];
                    //     return stockAvailable;
                    // });
                    // dataObj['imageUrl'] = await newPage.$eval('#product_gallery img', img => img.src);
                    dataObj['description'] = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent);
                    dataObj['upc'] = await newPage.$eval('.table.table-striped > tbody > tr > td', table => table.textContent);
                } catch(e) {
                    console.log(e);
                }
                resolve(dataObj);
                await newPage.close();
            });

            console.log(`Walking through the pages...`);
            for(link in urls){
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
                console.log(currentPageData);
            }
            // When all the data on this page is done, click the next button and start the scraping of the next page
            // You are going to check if this button exist first, so you know if there really is a next page.
            let nextButtonExist = false;
            try{
                const nextButton = await page.$eval('.next > a', a => a.textContent);
                nextButtonExist = true;
            }
            catch(err){
                nextButtonExist = false;
            }
            if(nextButtonExist){
                await page.click('.next > a');   
                return scrapeCurrentPage(); // Call this function recursively
            }
            await page.close();
            return scrapedData;
        }
        console.log(`Exporting data to JSON...`);
        let data = await scrapeCurrentPage();
        console.log(data);
        return data;
    }
}

module.exports = scraperObject;