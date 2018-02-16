'use strict';

const cheerio = require('cheerio');
const moment = require('moment-timezone');
const request = require('request');
const options = {
    url: 'http://dezsoba.hu/hu/heti-menue',
    headers: {
        'User-Agent': [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)',
            'AppleWebKit/604.5.6 (KHTML, like Gecko)',
            'Version/11.0.3 Safari/604.5.6'
        ].join(' ')
    }
};

const getFormattedTexts = (element) => {
    let processed = [];

    if (element.childNodes) {
        processed = []
            .filter.call(
                element.childNodes,
                (item) => item.nodeType === 3
            )
            .map((item) => item.nodeValue.trim());
    }

    return processed;
};

const fetch = () => {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error);
            } else {
                let today = moment().tz('Europe/Budapest').isoWeekday();
                let menu = [];
                let $ = cheerio.load(body);
                let todaysMenu = $(`#sp-page-builder .sp-fancy-menu-content ` +
                    `.sppb-wow:nth-child(${today})>.sppb-menu-text`).get(0);

                menu = menu.concat(
                    getFormattedTexts(todaysMenu)
                );

                resolve({
                    id: 'dezsoba',
                    name: $('title').text().split(' - ')[0],
                    logo: ['https://scontent-vie1-1.xx.fbcdn.net/v/t31.0-8/',
                        '12029644_1134502863257326_2736707117375738336_o.jpg',
                        '?oh=768abaa231eb76cb0ef9b3b24f0167c3&oe=5B148980'].join(''),
                    url: options.url,
                    menu: menu,
                    lastUpdated: moment().format()
                });
            }
        });
    });
};

module.exports.fetch = fetch;
