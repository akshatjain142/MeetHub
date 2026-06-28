import express from 'express';
import cors from 'cors';
import {createServer} from 'node:http';
import { Server } from 'socket.io';
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from './controllers/socketManager.js';

import mongoose from 'mongoose';

const app=express();
const server=createServer(app);
const io=connectToSocket(server);

app.set("port",process.env.PORT || 8000);
app.use(cors());
app.use(express.json({"limit":"40kb"}));
app.use(express.urlencoded({"limit":"40kb",extended:true}));

app.use("/api/v1/users",userRoutes);

const start=async()=>{
    const connectionDb=await mongoose.connect("mongodb+srv://akshat049660_db_user:ihk5sbO5jBe0RWce@cluster0.tzkzzk0.mongodb.net/?appName=Cluster0");

    console.log(`MONGO CONNECTED DB HOST:${connectionDb.connection.host}`);
    server.listen(app.get("port"),()=>{
        console.log("Server is running on port 8000");
    });
};

start();