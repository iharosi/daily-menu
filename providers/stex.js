'use strict';

const cheerio = require('cheerio');
const moment = require('moment-timezone');
const request = require('request');
const url = require('url');
const baseUrl = 'http://stexhaz.hu';
const options = {
    url: url.resolve(baseUrl, '/napimenu'),
    headers: {
        'User-Agent': [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)',
            'AppleWebKit/604.5.6 (KHTML, like Gecko)',
            'Version/11.0.3 Safari/604.5.6'
        ].join(' ')
    }
};

const partialIndexOf = (textLines, partialText, from = 0) => {
    let foundAt = -1;

    textLines.find((element, index) => {
        let result = false;
        let test = element.indexOf(partialText);

        if (test >= 0) {
            foundAt = index;
            result = test >= 0;
        }
        if (index < from) {
            result = false;
        }

        return result;
    });

    return foundAt;
};

const getMenu = (imageUrl) => {
    return new Promise((resolve) => {
        request({
            url: 'https://api.ocr.space/parse/imageurl',
            qs: {
                apikey: process.env.OCR_SPACE_API_KEY,
                language: 'hun',
                url: imageUrl
            },
            headers: options.headers
        }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                resolve([]);
            } else {
                let result = JSON.parse(body);
                let lines = result.ParsedResults[0].ParsedText.split(' \r\n');
                let separators = [
                    '',
                    'HÉTFŐ',
                    'KEDD',
                    'SZERDA',
                    'CSÜTÖRTÖK',
                    'PÉNTEK',
                    'A menü ára'
                ];
                let today = moment().tz('Europe/Budapest').isoWeekday();
                let from = 1 + partialIndexOf(lines, separators[today]);
                let to = partialIndexOf(lines, separators[1 + today]);

                resolve(lines.slice(from, to));
            }
        });
    });
};

const fetch = () => {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error);
            } else {
                let $ = cheerio.load(body);
                let menuImageSrc = url.resolve(
                    baseUrl,
                    $('#node-18 .art-postcontent .art-article p>img').attr('src')
                );
                let menu = [];

                if (moment().tz('Europe/Budapest').isoWeekday() < 6) {
                    getMenu(menuImageSrc).then((response) => {
                        menu = response;
                    });
                }

                resolve({
                    id: 'stex',
                    name: 'Stex Ház',
                    logo: 'https://static.vialacdn.com/caterer/' +
                        'sh-b2ebdc0e-6ba8-3840-7973-c3e163f48311/' +
                        'sh-b2ebdc0e-6ba8-3840-7973-c3e163f48311_logo_220x200.png',
                    url: options.url,
                    menu: menu,
                    lastUpdated: moment().format()
                });
            }
        });
    });
};

module.exports.fetch = fetch;
