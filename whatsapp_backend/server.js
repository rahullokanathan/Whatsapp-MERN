import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
const port = process.env.PORT || 9000;


const app = express();




const pusher = new Pusher({
  appId: "1107503",
  key: "0a28b5784b9e4c2a9ed8",
  secret: "50dbb2bb5697360b5716",
  cluster: "ap2",
  useTLS: true
});



const mongo_url="mongodb+srv://praveen_whatsapp:fIx902FLmDKTj5VH@cluster0.7et7i.mongodb.net/whatsapp_mern?retryWrites=true&w=majority";
mongoose.connect(mongo_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

const db = mongoose.connection;

db.once("open",()=>{
    console.log("DB connected");

    const msgCollection =  db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change",(change)=>{
        console.log("changed",change);

        if(change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                recieved:messageDetails.recieved,
            })
        } else {
            console.log("error in pusher")
        }

    })

})

app.use(express.json())
app.use(cors())

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})

app.get("/", (req,res)=> res.status(200).send("hellooi"));

app.get('/messages/sync', (req,res)=>{
    

    Messages.find((err, data)=>{
        if(err) {
            res.status(500).send(err)
        } else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req,res)=>{
    const dbMessage =  req.body

    Messages.create(dbMessage, (err, data)=>{
        if(err) {
            res.status(500).send(err)
        } else{
            res.status(201).send(data)
        }
    })
})



app.listen(port,()=>console.log(`Listening on localhost:${port}`));


