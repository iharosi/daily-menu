'use strict';

const request = require('request');
const moment = require('moment-timezone');
const options = {
    url: 'https://api.ocr.space/parse/imageurl',
    qs: {
        apikey: process.env.OCR_SPACE_API_KEY,
        language: 'hun',
        url: 'http://10minutes.hu/images/home_1_06.png'
    },
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
                let result = JSON.parse(body);
                let lines = result.ParsedResults[0].ParsedText.split(' \r\n');
                let menu;

                menu = lines
                    .filter((line) => line !== '')
                    .map((line) => {
                        let newLine = line;

                        if (line.match(/^\d{3,4}\.-/)) {
                            newLine = '';
                        }
                        if (line === 'D Menü') {
                            newLine = 'B Menü';
                        }

                        return newLine;
                    })
                    .slice(1, -2);

                resolve({
                    id: '10minutes',
                    name: 'Ten Minutes Étterem, Bistro és Cafe',
                    logo: ['https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-9/',
                        '1917436_183599304783_1252841_n.jpg',
                        '?oh=232254c55a73448976305e07e1d85148&oe=5B114B5F'].join(''),
                    url: 'http://10minutes.hu/',
                    menu: menu,
                    lastUpdated: moment().format()
                });
            }
        });
    });
};

module.exports.fetch = fetch;

