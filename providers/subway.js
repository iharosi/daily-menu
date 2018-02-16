'use strict';

const moment = require('moment-timezone');
const subOfTheDay = [
    '',
    'Csirke',
    'Olasz fűszeres',
    'Sonka',
    'B.L.T.',
    'Falafel',
    'Omlett & Bacon',
    'Big Beef Melt'
];

const fetch = () => {
    return new Promise((resolve) => {
        resolve({
            id: 'subway',
            name: 'SUBWAY® Hungary',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/' +
                'Subway_2016_logo.svg/640px-Subway_2016_logo.svg.png',
            url: 'https://www.subwayhungary.com/images/menu/WEB_NYITO_SOTD_644x360.jpg',
            menu: ['Sub of the Day:',
                subOfTheDay[moment().tz('Europe/Budapest').isoWeekday()]],
            lastUpdated: moment().format()
        });
    });
};

module.exports.fetch = fetch;
