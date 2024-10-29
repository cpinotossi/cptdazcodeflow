const fetchManager = require('./utils/fetchManager');
require('dotenv').config()


const isConfigured = (req) => {

    if (req.app.locals.appSettings.credentials.clientId != 'REPLACE-WITH-YOUR-APP-CLIENT-ID' &&
        req.app.locals.appSettings.credentials.tenantId != 'REPLACE-WITH-YOUR-APP-TENANT-ID' &&
        req.app.locals.appSettings.credentials.clientSecret != 'REPLACE-WITH-YOUR-APP-CLIENT-ID-SECRET') {
        return true;
    } else {
        return false;
    }
}

exports.getHomePage = (req, res, next) => {

    res.render('home', { isAuthenticated: req.session.isAuthenticated, configured: isConfigured(req) });
}

exports.getIdPage = (req, res, next) => {
    const claims = {
        name: req.session.idTokenClaims.name,
        preferred_username: req.session.idTokenClaims.preferred_username,
        oid: req.session.idTokenClaims.oid,
        sub: req.session.idTokenClaims.sub
    };

    res.render('id', { isAuthenticated: req.session.isAuthenticated, claims: claims, configured: isConfigured(req) });
}

exports.getProfilePage = async (req, res, next) => {
    let profile;

    try {
        profile = await fetchManager.callAPI(req.app.locals.appSettings.resources.graphAPI.endpoint, req.session["graphAPI"].accessToken);
    } catch (error) {
        console.log(error)
    }

    res.render('profile', { isAuthenticated: req.session.isAuthenticated, profile: profile, configured: isConfigured(req) });
}

exports.getStorageList = async (req, res, next) => {
    let storage, storageXML, storageJSON;

    try {
        storageXML = await fetchManager.callAPI(req.app.locals.appSettings.resources.storageAPI.endpoint, req.session["storageAPI"].accessToken, req.app.locals.appSettings.resources.storageAPI.headers, req.app.locals.appSettings.resources.storageAPI.httpMethod);
    } catch (error) {
        console.log(error)
    }
    let parser = require('xml2json');
    storageJSON = parser.toJson(storageXML);
    storage = JSON.parse(storageJSON);
    //TODO: Replace static container name process.env.STORAGEACCOUNTNAME with the current container of the user.
    let sasToken = await getContainerSAS(process.env.STORAGEACCOUNTNAME);
    console.log(`storageJson: ${storageJSON}`);
    console.log(`SAS: ${sasToken}`)
    console.log(`blob:${storage.EnumerationResults.Blobs.Blob.length}`)
    res.render('storage/list', { isAuthenticated: req.session.isAuthenticated, storage: storage, configured: isConfigured(req), sasToken: sasToken});
}

exports.getStoragePageDelegationKey = async (req, res, next) => {
    let storageDelegationKeyXML, storageDelegationKey, storageDelegationKeyJSON
    let startDate = new Date();
    let endDate = new Date();
    endDate.setMinutes(startDate.getMinutes() + 30);
    let startDateString = startDate.toISOString();
    let endDateString = endDate.toISOString();

    startDateString = startDateString.substring(0, startDateString.length - 5) + 'Z';
    endDateString = endDateString.substring(0, endDateString.length - 5) + 'Z';
    let storage, storageXML, storageJSON;
    let postData = '<?xml version="1.0" encoding="utf-8"?><KeyInfo><Start>' + startDateString + '</Start><Expiry>' + endDateString + '</Expiry></KeyInfo>'

    try {
        storageDelegationKeyXML = await fetchManager.callAPI(req.app.locals.appSettings.resources.storageAPIGetUserDelegationKey.endpoint, req.session["storageAPI"].accessToken, req.app.locals.appSettings.resources.storageAPIGetUserDelegationKey.headers, req.app.locals.appSettings.resources.storageAPIGetUserDelegationKey.httpMethod, postData);
    } catch (error) {
        console.log(error)
    }
    let parser = require('xml2json');
    storageDelegationKeyJSON = parser.toJson(storageDelegationKeyXML);
    storageDelegationKey = JSON.parse(storageDelegationKeyJSON);
    res.render('storage/delegationkey', { isAuthenticated: req.session.isAuthenticated, storageDelegationKey: storageDelegationKey, configured: isConfigured(req) });
}

// Generate service level SAS for a container
async function getContainerSAS(containerName) {
    // based on https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob/?view=azure-node-latest#functions
    const { BlobServiceClient, ContainerSASPermissions, SASProtocol, generateBlobSASQueryParameters, StorageSharedKeyCredential, blobSASSignatureValues } = require("@azure/storage-blob");
    const account = process.env.STORAGEACCOUNTNAME;
    const accountKey = process.env.STORAGEACCOUNTKEY;
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        sharedKeyCredential
    );

    // Cannot use interface definition blobSASSignatureValues because this is not typescript
    const sasParameter = {
        containerName, // Required
        permissions: ContainerSASPermissions.parse("racwdl"), // Required
        startsOn: new Date(), // Optional
        expiresOn: new Date(new Date().valueOf() + 86400), // Required. Date type
        protocol: SASProtocol.HttpsAndHttp, // Optional
    }
    const containerSAS = generateBlobSASQueryParameters(sasParameter,sharedKeyCredential).toString();
    //console.log(`SAS token for blob container ${containerName} is: ${blobServiceClient.getContainerClient(containerName).getBlobClient('spiderman.jpg').url}?${containerSAS}`);
    return containerSAS;
}

exports.getTenantPage = async (req, res, next) => {
    let tenant;

    try {
        // Getting tenant information requires Admin level 
        // permission
        tenant = await fetchManager.callAPI(req.app.locals.appSettings.resources.armAPI.endpoint, req.session["armAPI"].accessToken);
    } catch (error) {
        console.log(error)
    }

    res.render('tenant', { isAuthenticated: req.session.isAuthenticated, tenant: tenant.value[0], configured: isConfigured(req) });
}