'use strict';

const os = require('os');
const tesseract = require('tesseract.js');
const request = require('request');
const moment = require('moment');
// const path = require('path');
const options = {
    url: 'http://10minutes.hu/images/home_1_06.png',
    headers: {
        'User-Agent': [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)',
            'AppleWebKit/604.5.6 (KHTML, like Gecko)',
            'Version/11.0.3 Safari/604.5.6'
        ].join(' ')
    },
    encoding: null
};

const fetch = () => {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error);
            } else {
                tesseract
                    // .create({langPath: path.join(__dirname, '../hun.traineddata')})
                    .recognize(body, {lang: 'hun'})
                    // .progress((p) => console.log('progress', p))
                    .catch(reject)
                    .then((result) => {
                        let menu = result.text.split(os.EOL).slice(2, -4);

                        menu = menu.map((line) => {
                            let newLine = line;

                            if (line.match(/^I3/)) {
                                newLine = line.replace('I3', 'B');
                            }

                            return newLine;
                        });

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
                    });
            }
        });
    });
};

module.exports.fetch = fetch;

