# Summary
This is the proxy server that is used by the [Moralis Unity SDK](https://github.com/WoodsFiend/Moralis-Unity-SDK)

# Getting Started
1. Run npm install
2. [Register for Moralis](https://admin.moralis.io/register) to get an API key
3. Setup .env file with Moralis API key
4. Run npm start
5. Proxy server is running at http://localhost:4000/proxy
   
# Production Use
To use the server in production it should be setup with user authentication to ensure that API key usage can be regulated.
This requires setting up a custom authentication solution, sending auth headers with all proxy requests and verifying those headers in isAuthenticated function.
This template includes an example implementation of simple web3 wallet signed message authentication
