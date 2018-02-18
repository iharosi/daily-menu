'use strict';

const _ = require('lodash');
const url = require('url');
const moment = require('moment-timezone');
const request = require('request-promise-native');
const fbGrapApiUrl = 'https://graph.facebook.com/v2.12';
const fbId = '910845662306901';
const defaultOptions = {
    qs: {
        access_token: process.env.FB_ACCESS_TOKEN // eslint-disable-line camelcase
    },
    headers: {
        'User-Agent': [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)',
            'AppleWebKit/604.5.6 (KHTML, like Gecko)',
            'Version/11.0.3 Safari/604.5.6'
        ].join(' ')
    },
    json: true
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

const getDataFromPost = (fbPosts) => {
    const days = [
        '',
        'hétfő',
        'kedd',
        'szerda',
        'csütörtök',
        'péntek',
        'szombat',
        'vasárnap'
    ];
    let todayPosts;
    let payload = {
        postUrl: null,
        menu: []
    };

    if (fbPosts && fbPosts.data) {
        todayPosts = fbPosts.data
            .filter((post) => {
                return post.message && post.message.indexOf('HETI MENÜ') >= 0;
            });
    }

    if (todayPosts.length) {
        let post = todayPosts[0].message.split('\n');
        let today = moment().tz('Europe/Budapest').isoWeekday();
        let from = partialIndexOf(post, days[today]);
        let to = partialIndexOf(post, days[today + 1], from);
        to = to === -1 ? undefined : to;

        if (from !== -1) {
            payload.postUrl = todayPosts[0].permalink_url;
            payload.menu = post.slice(1 + from, to)
                .map((line) => line.trim())
                .filter((line) => line !== '');
        }
    }

    return payload;
};

const getDataFromPage = (page) => {
    return {
        name: _.get(page, 'name', null)
    };
};

const getDataFromPicture = (picture) => {
    return {
        logo: _.get(picture, 'data.url', null)
    };
};

const fetch = () => {
    return new Promise((resolve, reject) => {
        let optionForPosts = {
            uri: url.resolve(fbGrapApiUrl, 'posts'),
            qs: {
                id: fbId,
                fields: 'created_time,message,permalink_url',
                limit: 10
            }
        };
        let optionForPage = {
            uri: url.resolve(fbGrapApiUrl, fbId)
        };
        let optionForPicture = {
            uri: url.resolve(fbGrapApiUrl, `${fbId}/picture`),
            qs: {
                redirect: false,
                type: 'large'
            }
        };

        Promise.all([
            request(_.merge({}, defaultOptions, optionForPosts)),
            request(_.merge({}, defaultOptions, optionForPage)),
            request(_.merge({}, defaultOptions, optionForPicture))
        ]).then((responses) => {
            return _.merge(
                {},
                getDataFromPost(responses[0]),
                getDataFromPage(responses[1]),
                getDataFromPicture(responses[2])
            );
        }).then((payload) => {
            resolve({
                id: 'gilice',
                name: payload.name,
                logo: payload.logo,
                url: payload.postUrl,
                menu: payload.menu,
                lastUpdated: moment().format()
            });
        })
        .catch(reject);
    });
};

module.exports.fetch = fetch;
