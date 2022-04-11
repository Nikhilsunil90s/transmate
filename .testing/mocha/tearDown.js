import {disConnect} from "./DefaultMongo"


after(async () => {  
  console.log("run teardown")
  await disConnect();
})