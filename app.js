#!/usr/bin/env node
process.env.UV_THREADPOOL_SIZE = 1024;

const fetch = require('node-fetch');
const Crawler = require("crawler");

const cheerio = require('cheerio');
const request = require('request');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment');

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
    image: String,
    sellers: [{
        title: String,
        price: Number,
        shipment: String,
        seller: String,
        url: String,
    }],
   comments: [],
    features: String
});

let Product = mongoose.model('Product', ProductSchema);

let CrawlSchema = new Schema({
    url: String,
    time: Date
});

let Crawl = mongoose.model('Crawl', ProductSchema);

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
                /*let product = $('#urun.urun1');
                if(product.html() != null) {
                    let name = $('#ozet .row .baslik h1 a');
                    let title = name.attr('title');
                    let model = cheerio.load(name.text().replace(title, '')).text().match(/\((.*?)\)/);
                    model = model == null ? '' : model[1];
                    let image = product.find('#resim .buyuk div a img').attr('src');
                    let prices = $('#fiyatlar .fiyatlar .fiyat').children();
                    let sellers = [];
                    let rate = $('.uyepuani div .rating .basic').attr('data-average');
                    for(let i = 0; i < prices.length; i++) {
                        let price = prices[i];
                        let seller = {};
                        seller.seller = price.attribs.title.split(title)[0].trim();
                        let priceDOM = $(price);
                        seller.title = priceDOM.find('.urun_adi')[0].children[0].data.trim();
                        seller.price = priceDOM.find('.urun_fiyat')[0].attribs["data-sort"];
                        seller.price = seller.price.substring(0, seller.price.length - 2);
                        seller.shipment = priceDOM.find('.urun_fiyat p strong span').text() === 'Ücretsiz Kargo' ? 'free' : 'paid';
                        seller.url = price.attribs.href;
                        let r = request(seller.url, function (e, response) {
                            seller.url = typeof response !== 'undefined' ? response.request.uri.href : seller.url;
                            sellers.push(seller);
                        });

                        if(i == prices.length -1) {
                            setTimeout(() => {
                                productObj = { title, model, rate, image, sellers };
                                let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                                new Product(productObj);
                                Product.findOneAndUpdate({ title, model }, productObj, options, function(error, result) {
                                    if (error) return;
                                    console.log(result);
                                    // do something with the document
                                });
                            }, 3000);
                        }
                    }

                    console.log('P: ', title, '-', model);
                }
                */

                Object.keys(urls).forEach((item) => {
                    if (urls[item].type === 'tag') {
                        let href = urls[item].attribs.href;
                        if (href && !obselete.includes(href)) {
                            href = href.trim();
                            obselete.push(href);
                            crawlObj = { url: href, time: moment().startOf('day').toDate()};
                            let options = { upsert: true, new: true, setDefaultsOnInsert: true };
                            Crawl.findOneAndUpdate({ url }, crawlObj, options, function(error, result) {
                                if (error) return;
                                console.log(result);
                                // do something with the document
                            });
                            // Slow down the
                            setTimeout(function() {
                                href.startsWith('http') ? crawlAllUrls(href) : crawlAllUrls(`${url}${href}`) // The latter might need extra code to test if its the same site and it is a full domain with no URI
                            }, 3000)

                        }
                    }
                });
            } catch (e) {
                throw e;
                console.error(`Encountered an error crawling ${url}. Aborting crawl.`);
                done()

            }
            done();
        }
    })
}

crawlAllUrls(process.argv[2]);
//crawlAllUrls('https://epey.com/');