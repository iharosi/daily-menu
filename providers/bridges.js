'use strict';

const cheerio = require('cheerio');
const request = require('request');
const options = {
    url: 'http://bridges.hu/#heti-menu',
    headers: {
        'User-Agent': [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)',
            'AppleWebKit/604.5.6 (KHTML, like Gecko)',
            'Version/11.0.3 Safari/604.5.6'
        ].join(' ')
    }
};

const fetch = () => {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error);
            } else {
                let date = new Date();
                let today = date.getDay();
                let menu = [];
                let $ = cheerio.load(body);

                if (today > 0 && today < 6) {
                    menu = [].slice.call($($('section#heti-menu p')[today])
                        .contents()
                        .filter(function() {
                            return this.nodeType === 3;
                        }).map(function() {
                            return this.nodeValue.trim();
                        }));
                }

                resolve({
                    id: 'bridges',
                    name: $('title').text(),
                    logo: $('#header-main .img-responsive.zozo-standard-logo').attr('src'),
                    url: options.url,
                    menu: menu,
                    timestamp: date.getTime()
                });
            }
        });
    });
};

module.exports.fetch = fetch;
