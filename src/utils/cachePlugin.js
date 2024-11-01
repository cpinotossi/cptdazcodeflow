const fs = require("fs");
const appSettings = require('../../appSettings_')();
const cachePath = appSettings.settings.cachePath;
const beforeCacheAccess = async (cacheContext) => {
    return new Promise(async (resolve, reject) => {
        if (fs.existsSync(cachePath)) {
            fs.readFile(cachePath, "utf-8", (err, data) => {
                if (err) {
                    reject();
                } else {
                    cacheContext.tokenCache.deserialize(data);
                    resolve();
                }
            });
        } else {
            fs.writeFile(cachePath, cacheContext.tokenCache.serialize(), (err) => {
                if (err) {
                    reject();
                }
            });
        }
    });
};

const afterCacheAccess = async (cacheContext) => {
    if (cacheContext.cacheHasChanged) {
        await fs.writeFile(cachePath, cacheContext.tokenCache.serialize(), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
};

module.exports = {
    beforeCacheAccess,
    afterCacheAccess
};