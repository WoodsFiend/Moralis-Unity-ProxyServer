const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const port = 4000;
const cors = require('cors');
const ethers = require('ethers');
const { createProxyMiddleware } = require("http-proxy-middleware");

//The proxy urls for the moralis apis
const MORALIS_EVM_URL = "https://deep-index.moralis.io/api/v2.2";
const MORALIS_SOLANA_URL = "https://solana-gateway.moralis.io";
const MORALIS_APTOS_URL = "https://mainnet-aptos-api.moralis.io";
// A custom sign message for wallet authentication, must match the client sign message
const SIGN_MESSAGE = "This is a test message";

app.use(cors());
app.use(express.urlencoded({
    extended: true
}));

const startServer = async () => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};

//Proxies all requests to Moralis using an API key
app.use("/proxy", createProxyMiddleware(
    {
        target: MORALIS_EVM_URL,
        changeOrigin: true,
        on: {
            proxyReq: onProxyReq,
            error: onError
        }
    },
),
);

function onProxyReq(proxyReq, req, res) {
    //Authentication disabled or authentication passed
    if (process.env.USE_AUTH === 'false' || isAuthenticated(req)) {
        // Set API key header and send request
        proxyReq.setHeader('X-Api-Key', process.env.MORALIS_API_KEY);

        //Set the correct proxy request target for the targeted platform
        if (proxyReq.getHeader('api') === 'evm') {
            proxyReq.target = MORALIS_EVM_URL;
        }
        else if (proxyReq.getHeader('api') === 'sol') {
            proxyReq.target = MORALIS_SOLANA_URL;
        }
        else if (proxyReq.getHeader('api') === 'apt') {
            proxyReq.target = MORALIS_APTOS_URL;
        }
        else {
            req.error = "Not a valid API";
            req.status = 404;
            proxyReq.abort();
        }
    }
    else {
        //Failed authentication, block the request with an error
        req.error = "Client not authenticated";
        req.status = 401;
        proxyReq.abort();
    }
}

function onError(err, req, res, target) {
    res.writeHead(req.status, {
        'Content-Length':
            Buffer.byteLength(req.error),
        'Content-Type': 'text/plain',
    });
    res.end(req.error);
}

//This is just a framework and only validates that the client's connected wallet has signed the expected message
//A more robust and secure solution should be implemented for production use
function isAuthenticated(req) {
    var authString = req.header("Authorization");
    if (!authString) return false;

    //Can use express-basic-auth or other authentication solutions  
    //Example just verifies that the client signed the expected message
    //walletAuth = {walletAddress, signedMessage}
    var walletAuth = JSON.parse(authString);
    if (!walletAuth) return false;
    try {
        var signerAddress = getSignerAddress(walletAuth.signedMessage);
        if (signerAddress && signerAddress === ethers.getAddress(walletAuth.walletAddress)) {
            return true;
        }
    }
    catch (e) { 
        return false;
    }
}

//Retrieves the signer address from a signed message
function getSignerAddress(signedMessage) {
    var digest = ethers.getBytes(ethers.hashMessage(SIGN_MESSAGE));
    var signerAddress = ethers.recoverAddress(digest, signedMessage);
    return signerAddress;
}

startServer();