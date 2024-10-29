/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { default: axios } = require('axios');

callAPI = async(endpoint, accessToken, headers, httpMethod, data) => {

    if (!data || data === "") {
        data=null;
    }
    if (!accessToken || accessToken === "") {
        throw new Error('No tokens found')
    }

    if (!headers || headers === "") {
        headers = {
            Authorization: `Bearer ${accessToken}`
        }
    } else {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    
    const options = {
        headers: headers
    };
    
    console.log('request made to web API at: ' + new Date().toString());
    console.log('HTTP Methode: ' + httpMethod);

    try {
        let response = null;
        switch (httpMethod) {
            case 'POST':
                response = await axios.default.post(endpoint, data, options);
                break; 
            default:
                response = await axios.default.get(endpoint, options);  
                break;
        }
        console.log('repsonse data from web API: ' + response.data);
        return response.data;
    } catch(error) {
        console.log(error)
        return error;
    }
}

module.exports = {
    callAPI
};


/*

const {
    default: axios
} = require('axios');

callAPI = async (endpoint, accessToken, headers) => {

    if (!accessToken || accessToken === "") {
        throw new Error('No tokens found')
    }
    if (!headers || headers === "") {
        headers = {
            Authorization: `Bearer ${accessToken}`
        }
    } else {
        headers.Authorization = `Bearer ${accessToken}`;
    }
}
const options = {
    headers: headers
};

console.log('request made to web API at: ' + new Date().toString());

try {
    const response = await axios.default.get(endpoint, options);
    return response.data;
} catch (error) {
    console.log(error)
    return error;
}
}

module.exports = {
    callAPI
};

 */
