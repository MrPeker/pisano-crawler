const fetch = require('node-fetch');
const Crawler = require("crawler");

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://pisano:KbE8MdbLfCmr2GGJjCW7zT6njYZtmcRn@52.28.78.239:27017/pisano')
    .then((err) => {
        if(err) throw err;
        else console.log('Connected to database');
    })
    .catch((err) => {
        throw err;
    });

mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
});

let ProductSchema = new Schema({
    title: String,
    model: String,
    rate: String,
    sellers: [{
        title: String,
        price: Number,
        shipment: String,
        productTitle: String,
        seller: String
    }],
   comments: []
});

let Product = mongoose.model('Product', ProductSchema);

let obselete = []; // Array of what was crawled already

let c = new Crawler();

function crawlAllUrls(url) {
    //console.log(`Crawling ${url}`);

    c.queue({
        uri: url,
        callback: function (err, res, done) {
            if (err) throw err;
            let $ = res.$;
            try {
                let urls = $("a");
                let product = $('#urun.urun1');
                if(product.html() != null) {
                    //let productObj =
                    console.log('Product: ' + $('#ozet .row .baslik h1 a'));
                }
                Object.keys(urls).forEach((item) => {
                    if (urls[item].type === 'tag') {
                        let href = urls[item].attribs.href;
                        if (href && !obselete.includes(href)) {
                            href = href.trim();
                            obselete.push(href);
                            // Slow down the
                            setTimeout(function() {
                                href.startsWith('http') ? crawlAllUrls(href) : crawlAllUrls(`${url}${href}`) // The latter might need extra code to test if its the same site and it is a full domain with no URI
                            }, 5000)

                        }
                    }
                });
            } catch (e) {
                console.error(`Encountered an error crawling ${url}. Aborting crawl.`);
                done()

            }
            done();
        }
    })
}

crawlAllUrls('https://epey.com/');