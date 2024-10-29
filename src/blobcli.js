require('dotenv').config();

async function getSharedKeyCredential() {
    const { StorageSharedKeyCredential } = require("@azure/storage-blob");

    // Enter your storage account name and shared key
    const account = process.env.STORAGEACCOUNTNAME;
    const accountKey = process.env.STORAGEACCOUNTKEY;

    // Use StorageSharedKeyCredential with storage account and account key
    // StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    return sharedKeyCredential;
}

async function getDefaultAzureCredential() {
    const { DefaultAzureCredential } = require("@azure/identity");

    const account = process.env.STORAGEACCOUNTNAME;
    console.log(`account: ${account}`);
    let defaultAzureCredential = new DefaultAzureCredential();
    //console.dir(defaultAzureCredential);
    return defaultAzureCredential;
}

async function storageContainerList(blobServiceClient) {

    try {
        let i = 1;
        let containers = blobServiceClient.listContainers();
        for await (const container of containers) {
            console.log(`Container ${i++}: ${container.name}`);
        }
        return containers;
    } catch (error) {
        console.log(error)
    }
}
// Generate service level SAS for a container
async function getContainerSAS(containerName) {
    // based on https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob/?view=azure-node-latest#functions
    const { BlobServiceClient, ContainerSASPermissions, SASProtocol, generateBlobSASQueryParameters, StorageSharedKeyCredential } = require("@azure/storage-blob");
    const account = process.env.STORAGEACCOUNTNAME;
    const accountKey = process.env.STORAGEACCOUNTKEY;
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        sharedKeyCredential
    );
    const containerSAS = generateBlobSASQueryParameters({
        containerName, // Required
        permissions: ContainerSASPermissions.parse("racwdl"), // Required
        startsOn: new Date(), // Optional
        expiresOn: new Date(new Date().valueOf() + 86400), // Required. Date type
        ipRange: { start: "0.0.0.0", end: "255.255.255.255" }, // Optional
        protocol: SASProtocol.HttpsAndHttp, // Optional
        version: "2016-05-31" // Optional
    },
        sharedKeyCredential
    ).toString();
    //console.log(`SAS token for blob container ${containerName} is: ${blobServiceClient.getContainerClient(containerName).getBlobClient('spiderman.jpg').url}?${containerSAS}`);
    return containerSAS;
}


async function getBlobServiceClient(credentials) {
    const { BlobServiceClient, ContainerSASPermissions, SASProtocol, generateBlobSASQueryParameters, StorageSharedKeyCredential } = require("@azure/storage-blob");
    const account = process.env.STORAGEACCOUNTNAME;
    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        credentials
    );

    let containerName = 'oauth';
    const accountKey = process.env.STORAGEACCOUNTKEY;
    let sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    return blobServiceClient;
}

async function deviceCodeFlow() {
    const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
    let defaultAzureCredential;

    try {
        const authres = await msRestNodeAuth.interactiveLoginWithAuthResponse();
        const token = await authres.credentials.getToken();
        console.dir(token);
        return authres.credentials;
    } catch (err) {
        console.log(err);
    };
}

async function generateSasToken(blobServiceClient, container, blobName, permissions) {
    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    //const AzureStorageBlob = require("@azure/storage-blob");
    //permissions = permissions || AzureStorageBlob.BlobUtilities.SharedAccessPermissions.READ;

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: 'r',
            Start: startDate,
            Expiry: expiryDate
        }
    };
    blobServiceClient.getConteinerClient()
    var sasToken = blobServiceClient.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);

    return {
        token: sasToken,
        uri: blobService.getUrl(container, blobName, sasToken, true)
    };
}

async function main(key) {
    let credentials, blobServiceClient, containers;
    switch (key) {
        case 'dcf':
            credentials = await deviceCodeFlow();
            blobServiceClient = await getBlobServiceClient(credentials);
            containers = await storageContainerList(blobServiceClient);
            break;
        case 'dac':
            credentials = await getDefaultAzureCredential();
            blobServiceClient = await getBlobServiceClient(credentials);
            containers = await storageContainerList(blobServiceClient);
            //generateSasToken(blobServiceClient, 'oauth', 'superman.jpg')
            break;
        case 'sk':
            credentials = await getSharedKeyCredential();
            blobServiceClient = await getBlobServiceClient(credentials);
            containers = await storageContainerList(blobServiceClient);
            //generateSasToken(blobServiceClient, 'oauth', 'superman.jpg')
            break;
        default:
            break;
    }
}

main('sk');