import App from './server'

//1-make sure redis server is running on background default port
const app = new App()
app.init()
//2-POST jobs {url:url} at /service/add 
// curl -d '{"url":"https://www.example.org"}' localhost:7200/service/add -H "Content-Type: application/json"
//currently there's only 1 worker