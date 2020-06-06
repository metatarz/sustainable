import express = require('express')
import {urlIsValid, headTestPassed} from './helpers/validUrl'
import {Queue, QueueEvents} from 'bullmq'
const Redis = require('ioredis')
import Runner from './runner/runner';
import { safeReject } from './helpers/safeReject';
const bodyParser = require('body-parser')


export default class App{

    _port:number;
    _runner:any;

    constructor(){
        this._port = Number(process.env.PORT) || 7200

    }

    async init(){

        //launch express server

        try{
        const app = express()
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
       
        /*app.all('/*', function(req, res, next) {
 	 res.header("Access-Control-Allow-Origin", "*");
 	 res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
 	 res.header("Access-Control-Allow-Methods", "POST, GET");
 	 next();
	});       
        */   
        app.listen(this._port, ()=> console.log('Server running on port :', this._port))

        //launch redis server
        const connection = new Redis()
        //launch new Queue
        const queue = new Queue('main', {connection})

        //launch runner
        const runner=new Runner()
        this._runner=runner
        await runner.init()
        //launch listeners
        
       this._listeners(app, queue)
        }
       catch(error){
           safeReject(error)
       }

    }

    _listeners(app:express.Application, queue:Queue){

        const queueEvents = new QueueEvents('main')

        app.get('/health', (_,res)=>{
            res.sendStatus(200)
        })
        app.post('/service/add', async (req,res) => {
            let {url} = req.body
            url=url.trim()
            
            if(typeof url !== 'string' || !urlIsValid(url)){
                return res.status(400).send({status:'Error invalid URL'})
            }
            if(!url.startsWith('http')){
                url='https://'+url
            }

            if(await headTestPassed(url)){

            
            const job = await queue.add('audit', {
                url:url
            })

            const _jobId = job.id
  

            queueEvents.on('completed', ({ jobId, returnvalue }) => {
                if(_jobId ===jobId){
                    res.status(200).send({...returnvalue})
                }
            });
            queueEvents.on('failed', ({ jobId, failedReason }) => {
                if(_jobId === jobId){
                    res.send(500).json(failedReason)
                }
			    
            });
        }else{
            return res.status(400).send({status:'Error unknown URL'})
        }

         })

         app.get('/service/close', async (req,res)=>{
             //gracefully close
             await Promise.all([
                 queue.close(),
                  queue.disconnect(),
                   this._runner.shutdown()
                ])

             res.sendStatus(200)
         })
        
    }
}
