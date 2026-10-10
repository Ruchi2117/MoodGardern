import {test} from "node:test";
import assert from "node:assert/strict";
import {localReply} from "../src/services/localCompanion.ts";
test("water follow-up understands a count without inventing a hydration target",()=>{
  const first=localReply("Water check-in","day");assert.equal(first.topic,"water");
  const reply=localReply("3",first.topic);assert.equal(reply.water,3);assert.match(reply.text,/not a hydration score/);
  assert.equal(localReply("I had a 2 litre bottle","water").water,undefined);
});
test("sleep follow-up stays conversational rather than diagnosing",()=>{
  const first=localReply("I cannot sleep","day");assert.equal(first.topic,"sleep");
  assert.match(localReply("I scroll on my phone",first.topic).text,/phone/);
  assert.match(localReply("Which medication should I take?","sleep").text,/qualified health professional/);
});
test("crisis language receives support instead of a habit prompt",()=>{
  assert.match(localReply("I want to hurt myself","day").text,/emergency/);
});
test("unknown topics disclose the local companion's limits",()=>{
  assert.match(localReply("Solve quantum gravity","day").text,/rather than every kind of conversation/);
});
test("motivation requests return an original reminder and a practical follow-up",()=>{
  const reply=localReply("Give me a little motivation","day");
  assert.match(reply.text,/bloom all at once/);
  assert.match(reply.text,/one kind, doable thing/);
});
