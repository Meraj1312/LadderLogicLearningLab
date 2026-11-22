import test from 'node:test';
import assert from 'node:assert/strict';
import { tankStarter } from '../content/catalog.js';
import { emptyMemory, scan } from './scan.js';
import { advanceTank } from './process.js';

function simulator(){return {circuit:structuredClone(tankStarter),memory:emptyMemory()};}
function update(sim,dtMs=0){const {circuit}=sim,result=scan(circuit,sim.memory,dtMs);sim.memory=result.memory;circuit.tags.Level=advanceTank(circuit.tags.Level,{pump1:result.tags.Pump1,pump2:result.tags.Pump2,drainOpen:circuit.tags.DrainOpen,dtMs});return result;}

test('tank starts at 30% with both pumps off and starts Pump1 only below Low',()=>{
 const sim=simulator();assert.equal(sim.circuit.tags.Level,30);let result=update(sim);assert.equal(result.tags.Pump1,false);assert.equal(result.tags.Pump2,false);
 sim.circuit.tags.Level=19.99;result=update(sim);assert.equal(result.tags.Pump1,true);assert.equal(result.tags.Pump2,false);
 sim.circuit.tags.Level=20;result=update(sim);assert.equal(result.tags.Pump1,true,'the latched cycle remains active at Low equality');
 const atLow=simulator();atLow.circuit.tags.Level=20;result=update(atLow);assert.equal(result.tags.Pump1,false,'a fresh cycle does not start at Low equality');
});

test('at High Pump1 stops and Pump2 starts; High equality belongs to stage two',()=>{
 const sim=simulator();sim.circuit.tags.Level=19;update(sim);sim.circuit.tags.Level=79.99;let result=update(sim);assert.equal(result.tags.Pump1,true);assert.equal(result.tags.Pump2,false);sim.circuit.tags.Level=80;result=update(sim);
 assert.equal(result.tags.Pump1,false);assert.equal(result.tags.Pump2,true);assert.equal(result.tags.FillStage1,false);assert.equal(result.tags.FillStage2,true);
});

test('Pump2 runs below HighHigh and stops at exact HighHigh, remaining off until below Low',()=>{
 const sim=simulator();sim.circuit.tags.Level=80;let result=update(sim);assert.equal(result.tags.Pump2,true);
 sim.circuit.tags.Level=94.99;result=update(sim);assert.equal(result.tags.Pump2,true);
 sim.circuit.tags.Level=95;result=update(sim);assert.equal(result.tags.Pump2,false);assert.equal(result.tags.Pump1,false);
 sim.circuit.tags.Level=20;result=update(sim);assert.equal(result.tags.Pump1,false);assert.equal(result.tags.Pump2,false);
 sim.circuit.tags.Level=19.99;result=update(sim);assert.equal(result.tags.Pump1,true);assert.equal(result.tags.Pump2,false);
});

test('drain removes level using scan dtMs and a falling level below Low restarts filling',()=>{
 const sim=simulator();sim.circuit.tags.Level=20.1;sim.circuit.tags.DrainOpen=true;
 let result=update(sim,100);assert.equal(sim.circuit.tags.Level,19.8);assert.equal(result.tags.Pump1,false,'the scan evaluates the level before this process step');
 result=update(sim,100);assert.equal(result.tags.Pump1,true);assert.equal(sim.circuit.tags.Level,20.7,'process advances with the configured 100 ms scan step');
});

test('tank process bounds remain enforced at full and empty',()=>{
 assert.equal(advanceTank(99,{pump1:true,dtMs:1000}),100);
 assert.equal(advanceTank(1,{drainOpen:true,dtMs:1000}),0);
});
