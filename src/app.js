/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const getRoutes = require('./router');
const mainController = require('./controller');
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');

async function initializeApp() {
    const appSettings = await getConfig();
    const msalWrapper = require('./msal-express-wrapper/auth-provider');
    const { systemErrorRetryPolicy } = require('@azure/core-http');
    // const { get } = require('http');
    const authProvider = new msalWrapper.AuthProvider(appSettings);

    app.locals = {
        appSettings,
        authProvider
    };
    // View engine
    app.set('views', path.join(__dirname, './views'));
    app.set('view engine', 'ejs');

    // Static files and other configurations
    app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
    app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, './public')));

    /**
     * Using express-session middleware. Be sure to familiarize yourself with available options
     * and set the desired options. Visit: https://www.npmjs.com/package/express-session
     */
    app.use(session({ secret: appSettings.settings.sessionSecret, resave: false, saveUninitialized: false }));

    // set up routes with authentication
    app.use(getRoutes(mainController, authProvider, express.Router()));
    http.createServer(app).listen(appSettings.host.port, () => console.log(`Msal Node Auth web app http listening on port ${appSettings.host.port}!`))
    // Option of the SSL server
    const optionsSSL = {
        key: fs.readFileSync(`./openssl/${appSettings.host.domainName}.srv.key`),
        cert: fs.readFileSync(`./openssl/${appSettings.host.domainName}.srv.crt`),
        requestCert: true,
        rejectUnauthorized: false, // so we can do own error handling
        ca: [
            fs.readFileSync(`./openssl/${appSettings.host.domainName}.ca.crt`)
        ]
    };
    https.createServer(optionsSSL, app).listen(appSettings.host.portSsl, () => console.log(`Msal Node Auth web app https listening on port ${appSettings.host.portSsl}!`))
    // app.listen(appSettings.host.port, () => console.log(`Msal Node Auth web app listening on port ${appSettings.host.port}!`));
}

async function getConfig() {
    // const appSettings = require('../appSettings.json');
    // const envFilePath = process.argv[2] || './.env.dev';
    // require('dotenv').config({ path: './.env.dev' });
    const appSettings = require(`../appSettings.json`);
    // console.log(process.argv[2])
    // const envFilePath = process.argv[2] || './.env';
    // require('dotenv').config({ path: envFilePath });

    appSettings.host.port = process.env.PORT;
    appSettings.host.baseUri = process.env.BASE_URI;
    appSettings.host.domainName = process.env.DOMAIN;
    appSettings.credentials.clientId = process.env.CLIENT_ID;
    appSettings.credentials.tenantId = process.env.TENANT_ID;
    appSettings.credentials.clientSecret = process.env.CLIENT_SECRET;
    appSettings.settings.redirectUri = process.env.REDIRECT_URL;
    appSettings.settings.postLogoutRedirectUri = process.env.LOGOUT_URI;
    appSettings.settings.sessionSecret = process.env.SESSION_SECRET;

    return appSettings;
}

initializeApp().catch((err) => console.error(err));