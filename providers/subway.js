'use strict';

const moment = require('moment');
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
            name: 'Subway',
            logo: 'https://www.subwayhungary.com/images/topnav/SUBWAY_Y_G.svg',
            url: 'https://www.subwayhungary.com/images/menu/WEB_NYITO_SOTD_644x360.jpg',
            menu: ['Sub of the Day:',
                subOfTheDay[moment().isoWeekday()]],
            lastUpdated: moment().format()
        });
    });
};

module.exports.fetch = fetch;
