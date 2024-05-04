# Getting Started
- Run npm install
- Setup .env file with Moralis API key https://admin.moralis.io/register
- Run npm start
- Set the proxyUrl in Assets/Resources/MoralisConfig (ex. http://localhost:4000/proxy)

# Production Use
To use the server in production it should be setup with user authentication to ensure that API key usage can be regulated.
This requires setting up a custom authentication solution, sending auth headers with all proxy requests and verifying those headers in isAuthenticated function.