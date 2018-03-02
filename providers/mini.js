'use strict';

const cheerio = require('cheerio');
const moment = require('moment-timezone');
const request = require('request');
const Iconv = require('iconv').Iconv;
const options = {
    url: 'http://minifalatozo.uw.hu/het.htm',
    encoding: null,
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
                const days = [
                    'Hétfő',
                    'Kedd',
                    'Szerda',
                    'Csütörtök',
                    'Péntek',
                    'Szombat',
                    'Vasárnap'
                ];
                let today = moment().tz('Europe/Budapest').isoWeekday() - 1;
                let menu = [];
                let encoding = new Iconv('ISO-8859-2', 'UTF-8');
                let $ = cheerio.load(encoding.convert(body).toString('UTF8'));
                let $lines = $('table>tbody>tr').map((index, element) => {
                    let secondColumn = $(element).find('td:nth-child(2)').text();
                    let thirdColumn = $(element).find('td:nth-child(3)').text();
                    let firstColumn = $(element).find('td:nth-child(1)').text();
                    let newItem = '';

                    if (days.indexOf(thirdColumn) >= 0) {
                        newItem = thirdColumn;
                    } else if (days.indexOf(secondColumn) >= 0) {
                        newItem = secondColumn;
                    } else {
                        newItem = firstColumn.replace(/\n/, '').replace('  ', ' ').trim();
                    }

                    return newItem;
                }).get().filter((line) => {
                    return line !== '';
                });
                let from = 1 + $lines.indexOf(days[today]);
                let to = $lines.indexOf(days[today + 1]);

                menu = menu.concat($lines.slice(from, to));

                resolve({
                    id: 'mini',
                    name: 'Mini falatozó',
                    logo: 'http://minifalatozo.uw.hu/images/kszakacs.png',
                    url: options.url,
                    menu: menu,
                    lastUpdated: moment().format()
                });
            }
        });
    });
};

module.exports.fetch = fetch;
