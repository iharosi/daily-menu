'use strict';

const moment = require('moment');
const subOfTheDay = [
    '',
    'WHOPPER',
    'BIG KING®',
    'WESTERN WHOPPER',
    'WHOPPER',
    'DELUXE CSIRKEMELL',
    '-',
    '-'
];

const fetch = () => {
    return new Promise((resolve) => {
        resolve({
            id: 'burgerking',
            name: 'BURGER KING® Hungary',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/' +
                'Burger_King_Logo.svg/500px-Burger_King_Logo.svg.png',
            url: 'http://burgerking.hu/sites/burgerking.hu/files/' +
                'HetkozNapiBKmenu_Mindentermek_lista_1000x550px.jpg',
            menu: ['Hétköznapi Burger King menü:',
                subOfTheDay[moment().isoWeekday()]],
            lastUpdated: moment().format()
        });
    });
};

module.exports.fetch = fetch;
