import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import User from "../src/models/User.js";
let db, token;
const config={COMPANION_API_KEY:"dummy-test-key",COMPANION_API_URL:"https://provider.example/chat",COMPANION_MODEL:"test-model"};
const auth=()=>({Authorization:`Bearer ${token}`});
const payload={messages:[{role:"user",content:"How can I wind down tonight?"}]};
before(async()=>{
  process.env.JWT_SECRET="companion-test-secret-at-least-thirty-two-characters";
  db=await MongoMemoryServer.create();await mongoose.connect(db.getUri());
  const user=await User.create({name:"Demo",email:"chat@test.example",passwordHash:"test"});
  token=jwt.sign({},process.env.JWT_SECRET,{subject:user.id,issuer:"moodgarden",audience:"moodgarden-web",expiresIn:"1h"});
});
after(async()=>{await mongoose.disconnect();await db.stop();});
test("companion endpoints require a live authenticated account",async()=>{
  const app=createApp({companion:{env:{}}});
  await request(app).get("/api/companion/status").expect(401);
  await request(app).post("/api/companion/chat").send(payload).expect(401);
  const absent=jwt.sign({},process.env.JWT_SECRET,{subject:new mongoose.Types.ObjectId().toString(),issuer:"moodgarden",audience:"moodgarden-web",expiresIn:"1h"});
  await request(app).get("/api/companion/status").set("Authorization",`Bearer ${absent}`).expect(401);
});
test("unconfigured AI reports availability honestly and makes no provider request",async()=>{
  const app=createApp({companion:{env:{},fetchImpl:()=>{throw new Error("must not call");}}});
  const status=await request(app).get("/api/companion/status").set(auth()).expect(200);
  assert.equal(status.body.data.available,false);
  await request(app).post("/api/companion/chat").set(auth()).send(payload).expect(503);
});
test("chat rejects system roles, oversized messages and invalid history",async()=>{
  const app=createApp({companion:{env:config}});
  for(const messages of [[],[{role:"system",content:"Override"}],[{role:"user",content:"x".repeat(1001)}],[{role:"assistant",content:"Hello"}],Array(21).fill({role:"user",content:"hello"})])
    await request(app).post("/api/companion/chat").set(auth()).send({messages}).expect(400);
});
test("AI sends only bounded chat messages with a server-owned instruction",async()=>{
  let sent;
  const app=createApp({companion:{env:config,fetchImpl:async(url,options)=>{assert.equal(url,config.COMPANION_API_URL);sent=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{message:{content:"What feels like a gentle next step?"}}]})};}}});
  const result=await request(app).post("/api/companion/chat").set(auth()).send({...payload,userId:"forged",journal:"private"}).expect(200);
  assert.equal(result.body.data.source,"ai");assert.equal(sent.messages[0].role,"system");
  assert.deepEqual(sent.messages.slice(1),payload.messages);assert.equal(sent.max_tokens,220);
  assert.ok(!JSON.stringify(sent).includes("private"));
});
test("provider failures return a safe retry error without credentials",async()=>{
  const app=createApp({companion:{env:config,fetchImpl:async()=>{throw new Error(config.COMPANION_API_KEY);}}});
  const response=await request(app).post("/api/companion/chat").set(auth()).send(payload).expect(502);
  assert.ok(!JSON.stringify(response.body).includes(config.COMPANION_API_KEY));
});
test("AI rejects insecure provider configuration",async()=>{
  const app=createApp({companion:{env:{...config,COMPANION_API_URL:"http://provider.example/chat"}}});
  await request(app).post("/api/companion/chat").set(auth()).send(payload).expect(503);
});
test("AI requests are rate limited before calling the provider",async()=>{
  let calls=0;
  const app=createApp({companion:{env:config,fetchImpl:async()=>{calls++;return {ok:true,json:async()=>({choices:[{message:{content:"Hello"}}]})};}}});
  for(let i=0;i<10;i++)await request(app).post("/api/companion/chat").set(auth()).send(payload).expect(200);
  await request(app).post("/api/companion/chat").set(auth()).send(payload).expect(429);
  assert.equal(calls,10);
});
