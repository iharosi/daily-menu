'use strict';

const request = require('request');
const moment = require('moment');
const options = {
    url: 'https://graph.facebook.com/v2.11/494549960697458/posts?limit=5&access_token=' +
        process.env.FB_ACCESS_TOKEN,
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
                let fbPosts;
                let post;
                let menu;

                try {
                    fbPosts = JSON.parse(body);
                } catch (error) {
                    reject(error);
                }

                post = fbPosts.data
                    .filter((post) => {
                        return post.message.indexOf('Leveseink') >= 0;
                    })
                    .filter((post) => {
                        let now = moment().format('YYYY-MM-DD');
                        let createdTime = post.created_time.split('T')[0];

                        return now === createdTime;
                    })[0];

                menu = post ? post.message
                    .slice(post.message.indexOf('Leveseink'))
                    .split('\n')
                    .filter((line, index, array) => {
                        let keep = true;
                        let previous = array[index - 1];

                        if (line.charAt() !== '-' && previous && previous.charAt() === '-') {
                            keep = false;
                        }

                        return keep;
                    }) : '';

                resolve({
                    id: 'foodie',
                    name: 'Foodie MinuteBistro',
                    logo: '',
                    url: post ? 'https://facebook.com/' + post.id : '',
                    menu: menu,
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
                });
            }
        });
    });
};

module.exports.fetch = fetch;
