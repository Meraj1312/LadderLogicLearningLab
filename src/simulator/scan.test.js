import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyMemory, scan } from './scan.js';

const circuit=(elements,tags={})=>({tags:{A:false,B:false,Y:false,Motor:false,Lamp:false,...tags},rungs:[{id:'R1',elements}]});
const contact=(id,tag,mode='no')=>({id,type:'contact',tag,mode});
const coil=(id,tag,mode='ote')=>({id,type:'coil',tag,mode});

test('NO and NC contacts implement true/false tests; series is AND',()=>{
 const c=circuit([contact('a','A'),contact('b','B'),coil('y','Y')],{A:true,B:true});assert.equal(scan(c).tags.Y,true);assert.equal(scan({...c,tags:{...c.tags,B:false}}).tags.Y,false);
 assert.equal(scan(circuit([contact('nc','A','nc'),coil('y','Y')],{A:false})).tags.Y,true);
 assert.equal(scan(circuit([contact('nc','A','nc'),coil('y','Y')],{A:true})).tags.Y,false);
});
test('parallel branches OR their paths',()=>{
 const r=scan(circuit([{id:'br',type:'branch',paths:[[contact('a','A')],[contact('b','B')]]},coil('y','Y')],{A:false,B:true}));assert.equal(r.tags.Y,true);assert.equal(r.trace.find(x=>x.elementId==='br').outputPower,true);
});
test('rungs execute top-down and later rungs read earlier writes',()=>{
 const c={tags:{A:true,Y:false,Z:false},rungs:[{id:'one',elements:[contact('a','A'),coil('y','Y')]},{id:'two',elements:[contact('yc','Y'),coil('z','Z')]}]};assert.equal(scan(c).tags.Z,true);
});
test('OTE output image is retained between scans so a seal-in contact can hold',()=>{
 const c={tags:{Start:false,Stop:false,Motor:false},inputTags:['Start','Stop'],rungs:[{id:'R',elements:[contact('stop','Stop','nc'),{id:'branch',type:'branch',paths:[[contact('start','Start')],[contact('hold','Motor')]]},coil('motor','Motor')]}]};
 let r=scan({...c,tags:{...c.tags,Start:true}});assert.equal(r.tags.Motor,true);r=scan(c,r.memory);assert.equal(r.tags.Motor,true);r=scan({...c,tags:{...c.tags,Stop:true}},r.memory);assert.equal(r.tags.Motor,false);
});
test('OTE rewrites every scan while OTL/OTU retain state',()=>{
 const c=circuit([contact('a','A'),coil('set','Y','otl')],{A:true});const first=scan(c);assert.equal(first.tags.Y,true);const off=scan({...c,tags:{...c.tags,A:false}},first.memory);assert.equal(off.tags.Y,true);
 const reset=scan(circuit([contact('b','B'),coil('rst','Y','otu')],{B:true,Y:true}),off.memory);assert.equal(reset.tags.Y,false);
 const ote=scan(circuit([contact('a','A'),coil('y','Y')],{A:false,Y:true}));assert.equal(ote.tags.Y,false);
});
test('prior output image matches the last writer when set/reset and OTE share a tag',()=>{
 const c={tags:{A:true,B:false,Y:false,Z:false},inputTags:['A','B'],rungs:[{id:'read-first',elements:[contact('y','Y'),coil('z','Z')]},{id:'set',elements:[contact('a','A'),coil('latch','Y','otl')]},{id:'last-write',elements:[contact('b','B'),coil('ote','Y')]}]};
 let r=scan(c);assert.equal(r.tags.Y,false);assert.equal(r.tags.Z,false);r=scan(c,r.memory);assert.equal(r.tags.Y,false);assert.equal(r.tags.Z,false);
});
test('rising and falling edges pulse once and hold their previous rung state',()=>{
 const up=circuit([contact('a','A'),{id:'edge',type:'edge',mode:'rising'},coil('y','Y')],{A:true});let r=scan(up);assert.equal(r.tags.Y,true);r=scan(up,r.memory);assert.equal(r.tags.Y,false);r=scan({...up,tags:{...up.tags,A:false}},r.memory);r=scan(up,r.memory);assert.equal(r.tags.Y,true);
 const down=circuit([contact('a','A'),{id:'edge',type:'edge',mode:'falling'},coil('y','Y')],{A:true});let d=scan(down);d=scan({...down,tags:{...down.tags,A:false}},d.memory);assert.equal(d.tags.Y,true);d=scan({...down,tags:{...down.tags,A:false}},d.memory);assert.equal(d.tags.Y,false);
});
test('TON timing accumulates only while true and resets when false',()=>{
 const on=circuit([contact('a','A'),{id:'ton',type:'timer',mode:'ton',tag:'T',presetMs:200}],{A:true});let r=scan(on,emptyMemory(),100);assert.equal(r.tags['T.Q'],false);r=scan(on,r.memory,100);assert.equal(r.tags['T.Q'],true);assert.equal(r.tags['T.ACC'],200);r=scan({...on,tags:{...on.tags,A:false}},r.memory,40);assert.equal(r.tags['T.Q'],false);assert.equal(r.tags['T.ACC'],0);
});
test('TOF holds Q after input falls until its preset elapses',()=>{
 const on=circuit([contact('a','A'),{id:'tof',type:'timer',mode:'tof',tag:'F',presetMs:200}],{A:true});let r=scan(on,emptyMemory(),0);assert.equal(r.tags['F.Q'],true);r=scan({...on,tags:{...on.tags,A:false}},r.memory,100);assert.equal(r.tags['F.Q'],true);r=scan({...on,tags:{...on.tags,A:false}},r.memory,100);assert.equal(r.tags['F.Q'],false);
});
test('timer instruction preserves rung continuity and exposes Q as a contact tag',()=>{
 const c={tags:{A:true,Y:false},rungs:[{id:'timer',elements:[contact('a','A'),{id:'ton',type:'timer',mode:'ton',tag:'T',presetMs:100}]},{id:'output',elements:[contact('done','T.Q'),coil('y','Y')]}]};
 let r=scan(c,emptyMemory(),100);assert.equal(r.tags.Y,true);assert.equal(r.trace.find(t=>t.rungId==='timer'&&t.elementId==='ton').outputPower,true);
});
test('TP emits a fixed width pulse and ignores a sustained level after the edge',()=>{
 const on=circuit([contact('a','A'),{id:'tp',type:'timer',mode:'tp',tag:'P',presetMs:200}],{A:true});let r=scan(on,emptyMemory(),50);assert.equal(r.tags['P.Q'],true);r=scan(on,r.memory,100);assert.equal(r.tags['P.Q'],true);r=scan(on,r.memory,50);assert.equal(r.tags['P.Q'],false);
});
test('TP does not restart when a new rising edge arrives during its active pulse',()=>{
 const on=circuit([contact('a','A'),{id:'tp',type:'timer',mode:'tp',tag:'P',presetMs:200}],{A:true});let r=scan(on,emptyMemory(),50);const off={...on,tags:{...on.tags,A:false}};r=scan(off,r.memory,50);const rearmed=scan(on,r.memory,100);assert.equal(rearmed.tags['P.ACC'],200);assert.equal(rearmed.tags['P.Q'],false);
});
test('RTO accumulates across false intervals and clears only on reset',()=>{
 const on=circuit([contact('a','A'),{id:'rto',type:'timer',mode:'rto',tag:'R',presetMs:200}],{A:true});let r=scan(on,emptyMemory(),100);r=scan({...on,tags:{...on.tags,A:false}},r.memory,900);assert.equal(r.tags['R.ACC'],100);r=scan(on,r.memory,100);assert.equal(r.tags['R.Q'],true);r=scan(circuit([{id:'res',type:'reset',target:'R'}]),r.memory,0);assert.equal(r.tags['R.ACC'],0);assert.equal(r.tags['R.Q'],false);
});
test('CTU and CTD count rising transitions, not held scans; RES clears count',()=>{
 const up=circuit([contact('a','A'),{id:'ctu',type:'counter',mode:'ctu',tag:'C',preset:2}],{A:true});let r=scan(up);assert.equal(r.tags['C.ACC'],1);r=scan(up,r.memory);assert.equal(r.tags['C.ACC'],1);r=scan({...up,tags:{...up.tags,A:false}},r.memory);r=scan(up,r.memory);assert.equal(r.tags['C.ACC'],2);assert.equal(r.tags['C.Q'],true);
 const clr=scan(circuit([{id:'res',type:'reset',target:'C'}]),r.memory);assert.equal(clr.memory.counters.ctu.acc,0);
 const down=circuit([contact('a','A'),{id:'ctd',type:'counter',mode:'ctd',tag:'D',preset:2}],{A:true});const d=scan(down);assert.equal(d.tags['D.ACC'],1);assert.equal(d.tags['D.Q'],false);
});
test('RES does not create a second count from a held counter rung',()=>{
 const counter=circuit([contact('a','A'),{id:'ct',type:'counter',mode:'ctu',tag:'C',preset:5}],{A:true});let r=scan(counter);const resetFirst={tags:r.tags,rungs:[...counter.rungs,{id:'reset',elements:[{id:'res',type:'reset',target:'C'}]}]};r=scan(resetFirst,r.memory);r=scan(counter,r.memory);assert.equal(r.tags['C.ACC'],0);
});
test('diagnostics flag multiple writers and division by zero is safe',()=>{
 const c={tags:{A:true,Y:false,N:4,D:0},rungs:[{id:'a',elements:[contact('a','A'),coil('y1','Y')]},{id:'b',elements:[contact('a2','A'),coil('y2','Y'),{id:'div',type:'math',op:'div',left:'N',right:'D',dest:'N'}]}]};const r=scan(c);assert.ok(r.diagnostics.some(d=>d.includes('later instruction wins')));assert.ok(r.diagnostics.some(d=>d.includes('division by zero')));assert.equal(r.tags.N,4);
});
test('all relational operators and arithmetic operations have deterministic outcomes',()=>{
 const expected={gt:false,lt:false,gte:true,lte:true,eq:true,neq:false};for(const [op,value] of Object.entries(expected)){const r=scan(circuit([{id:'cmp',type:'compare',op,left:'N',right:5},coil('y','Y')],{N:5}));assert.equal(r.tags.Y,value,op);}
 const cases={add:8,sub:2,mul:15,div:1.6666666666666667,move:5};for(const [op,value] of Object.entries(cases)){const r=scan(circuit([{id:'math',type:'math',op,left:'N',right:3,dest:'Out'}],{N:5,Out:0}));assert.equal(r.tags.Out,value,op);}
});
test('scan copies input, produces trace, and rejects invalid elapsed time',()=>{
 const c=circuit([contact('a','A'),coil('y','Y')],{A:true});const before=JSON.stringify(c);const r=scan(c);assert.equal(JSON.stringify(c),before);assert.equal(r.trace.length,2);assert.throws(()=>scan(c,emptyMemory(),-1),RangeError);assert.throws(()=>scan(c,emptyMemory(),Infinity),RangeError);
});
