# Digital Sustainability Audits - server example

## Instructions to run locally

1. Git clone the master branch
2. Run `npm install` on the local folder. You need to install puppeteer library yourself.
3. Redis is needed. Download the library [from source](https://redis.io/topics/quickstart) or docker it. Make sure it is running on the port number 6379.
4. Run the script `npm run dev`, which will launch the server listening at localhost:7200. You can set an environment variable to PORT to change the port value.
  - Test the server’s health with a GET request at /health,
  - or run a new job with a POST request at /service/add including a JSON body param `url` containing the corresponding URL       to audit.

Feel free to change the configuration at /src/config to suit your needs.
