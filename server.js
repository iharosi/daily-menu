#!/usr/local/bin/node

'use strict';

require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const path = require('path');
const moment = require('moment-timezone');
const service = require('./helpers/service');
const providers = [
    require('./providers/amici'),
    require('./providers/bridges'),
    require('./providers/burgerking'),
    require('./providers/dezsoba'),
    require('./providers/foodie'),
    require('./providers/kompot'),
    require('./providers/portum'),
    require('./providers/subway'),
    require('./providers/10minutes')
];
const interval = 1000 * 60 * 2; // 2 minutes
let database = [];

const fetchMenus = () => {
    return new Promise((resolve, reject) => {
        let hour = Number.parseInt(moment().tz('Europe/Budapest').format('H'), 10);

        if (database.length && hour === 0) {
            database.map((entry) => {
                if (entry.menu && entry.menu.length) {
                    entry.menu = [];
                }

                return entry;
            });
        }
        if (database.length && hour >= 10 && hour < 12) {
            database.forEach((restaurant, index) => {
                if (!restaurant.menu || restaurant.menu.length === 0) {
                    providers[index].fetch()
                        .then((result) => {
                            database[index] = result;
                            service.log(`${restaurant.name} has been fetched.`);
                        })
                        .catch(reject);
                }
            });
        }
        if (!database.length) {
            Promise.all(
                providers.map((provider) => provider.fetch())
            ).then((results) => {
                database = [];
                database.push(...results);
                service.log('Restaurant pages has been fetched.');
                resolve(database);
            }).catch(reject);
        }
    });
};

const launchWebService = () => {
    let app = express();
    let port = process.env.DAILY_MENU_PORT || 3000;
    let server;

    app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(morgan('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(bodyParser.json());
    server = app.listen(port, () => {
        service.log(`App now running on port ${server.address().port}`, 'highlight');
    });

    app.get('/restaurant', (request, response) => {
        let result = database
            .map((restaurant) => {
                return {
                    id: restaurant.id,
                    name: restaurant.name
                };
            });

        response.header('Access-Control-Allow-Origin', '*');
        response.status(200).json(result);
    });

    app.get('/restaurant/:restaurant', (request, response) => {
        let result = database.find((restaurant) => {
            return request.params.restaurant === restaurant.id;
        });

        response.header('Access-Control-Allow-Origin', '*');
        if (result) {
            response.status(200).json(result);
        } else {
            response.status(404).send(
                `Sorry, this restaurant identifier can not be found: ${request.params.restaurant}`
            );
        }
    });
};

const init = () => {
    fetchMenus()
        .then(launchWebService)
        .catch((error) => {
            if (error) {
                service.exitWithError(error.message, error.code);
            } else {
                service.exitWithError(error);
            }
        });
    setInterval(fetchMenus, interval);
};

init();
