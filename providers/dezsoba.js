'use strict';

const url = require('url');
const cheerio = require('cheerio');
const moment = require('moment');
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
                let today = moment().isoWeekday();
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
                    logo: url.resolve(
                        'http://dezsoba.hu',
                        $('#sp-header #sp-logo .sp-retina-logo').attr('src')
                    ),
                    url: options.url,
                    menu: menu,
                    lastUpdated: moment().format()
                });
            }
        });
    });
};

module.exports.fetch = fetch;
