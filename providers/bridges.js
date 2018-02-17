'use strict';

const cheerio = require('cheerio');
const moment = require('moment-timezone');
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

const getFormattedTexts = (element) => {
    let processed = [];

    if (element && element.childNodes) {
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
                let today = moment().tz('Europe/Budapest').isoWeekday() - 1;
                let menu = [];
                let $ = cheerio.load(body);
                let $days = $('section#heti-menu .vc_row .parallax-desc>p:first-child').get(today);
                let $dessert = $('section#heti-menu .wpb_text_column.wpb_content_element p').get(0);

                menu = menu.concat(getFormattedTexts($days));

                if (menu.length) {
                    menu = menu.concat(getFormattedTexts($dessert));
                }

                resolve({
                    id: 'bridges',
                    name: $('title').text(),
                    logo: $('#header-main .img-responsive.zozo-standard-logo').attr('src'),
                    url: options.url,
                    menu: menu,
                    lastUpdated: moment().format()
                });
            }
        });
    });
};

module.exports.fetch = fetch;
