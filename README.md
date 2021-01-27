# Digital Sustainability Audits - server example


## Introduction
This is an example of running [DAS](https://github.com/digital-audits/sustainability) in a full server solution.
It uses BullMQ for queueing jobs, Puppeteer-Cluster for creating a cluster of puppeteer worers and a NodeJS Express server. 

## Instructions to run locally

<details><summary>Using docker-compose (recommended):</summary>
1. Git clone the master branch
2. Run `docker-compose up -d`

- Audit any URL with a POST request at localhost/service/add including a JSON body param `url` containing the corresponding URL to audit.

```sh
curl -d "url=https://www.example.org" http://localhost/service/add
```

</details>
<details><summary>Normal installation steps:</summary>
1. Git clone the master branch <br/>
2. If you don't have already, install `yarn` globally with: `npm i -g yarn` <br/>
3. Run `yarn` on the local folder <br/>
4. Redis is needed. Download the library [from source](https://redis.io/topics/quickstart) or docker it. Make sure it is running on the port number 6379 <br/>
5. Run the script `yarn dev`, which will launch the server listening at localhost:7200 <br/>

- Audit any URL with a POST request at /service/add including a JSON body param `url` containing the corresponding URL to audit.

```sh
curl -d "url=https://www.example.org" http://localhost:7200/service/add
```

Feel free to change the configuration at /src/config to suit your needs.

</details>
