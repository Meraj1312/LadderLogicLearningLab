import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyMemory, scan } from './scan.js';
import { componentVisualState, energizedFlowSegments, wireSegmentEnergized } from './flow.js';

const sequence=()=>({tags:{Start:false,Stop:false,Motor:false},inputTags:['Start','Stop'],monitorTags:['Start','Stop','Motor'],rungs:[
 {id:'R1',elements:[{id:'stop',type:'contact',mode:'nc',tag:'Stop'},{id:'start',type:'contact',mode:'no',tag:'Start'},{id:'ton',type:'timer',mode:'ton',tag:'T',presetMs:3000}]},
 {id:'R2',elements:[{id:'compare',type:'compare',op:'gte',left:'T.ET',right:3000,dest:'Ready'}]},
 {id:'R3',elements:[{id:'ready',type:'contact',mode:'no',tag:'Ready'},{id:'motor',type:'coil',mode:'ote',tag:'Motor'}]},
]});
const scanNext=(circuit,memory,dt=0)=>{const result=scan(circuit,memory,dt);return [result,result.memory];};

test('TON enable state and ET advance only on enabled elapsed scan time',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [r,m]=scanNext(circuit,emptyMemory(),1000);
 assert.equal(r.tags['T.EN'],true);assert.equal(r.tags['T.TT'],true);assert.equal(r.tags['T.ET'],1000);assert.equal(r.tags['T.Q'],false);
 [r,m]=scanNext(circuit,m,500);assert.equal(r.tags['T.ET'],1500);assert.equal(r.tags['T.TT'],true);
});
test('TON reaches PRE exactly, turns Q on, and reports a completed state',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [r,m]=scanNext(circuit,emptyMemory(),2999);assert.equal(r.tags['T.ET'],2999);assert.equal(r.tags['T.Q'],false);
 [r,m]=scanNext(circuit,m,1);assert.equal(r.tags['T.ET'],3000);assert.equal(r.tags['T.Q'],true);const timer=r.trace.find(item=>item.elementId==='ton');assert.equal(timer.timerPhase,'DONE');assert.equal(timer.done,true);
});
test('comparison reads ET and its result tag powers a downstream contact and motor in scan order',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [r,m]=scanNext(circuit,emptyMemory(),3000);
 assert.equal(r.tags['T.ET'],3000);assert.equal(r.tags.Ready,true);assert.equal(r.tags.Motor,true);
 assert.deepEqual(r.trace.map(item=>item.rungId),['R1','R1','R1','R2','R3','R3']);
 assert.equal(r.trace.find(item=>item.elementId==='compare').leftValue,3000);assert.equal(r.trace.find(item=>item.elementId==='compare').comparison,true);
 assert.equal(r.trace.find(item=>item.elementId==='ready').tagValue,true);assert.equal(r.trace.find(item=>item.elementId==='motor').outputValue,true);
});
test('Motor remains off until all evaluated logic is true',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [r,m]=scanNext(circuit,emptyMemory(),2999);assert.equal(r.tags.Motor,false);assert.equal(r.trace.find(item=>item.elementId==='motor').outputValue,false);
 [r,m]=scanNext(circuit,m,1);assert.equal(r.tags.Motor,true);
});
test('stop blocks the timer, clears TON ET/Q, and removes downstream motor power',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [r,m]=scanNext(circuit,emptyMemory(),3000);assert.equal(r.tags.Motor,true);
 circuit.tags.Stop=true;[r,m]=scanNext(circuit,m,100);assert.equal(r.tags['T.EN'],false);assert.equal(r.tags['T.ET'],0);assert.equal(r.tags['T.Q'],false);assert.equal(r.tags.Ready,false);assert.equal(r.tags.Motor,false);
});
test('resetting simulator memory clears timer state and the comparison output',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [r]=scanNext(circuit,emptyMemory(),3000);assert.equal(r.tags.Motor,true);
 circuit.tags.Start=false;[r]=scanNext(circuit,emptyMemory(),0);assert.equal(r.tags['T.ET'],0);assert.equal(r.tags['T.Q'],false);assert.equal(r.tags.Ready,false);assert.equal(r.tags.Motor,false);
});
test('each timer scan advances by the configured deterministic simulation step',()=>{
 const circuit=sequence();circuit.tags.Start=true;let [slow,slowMemory]=scanNext(circuit,emptyMemory(),50),[fast]=scanNext(circuit,emptyMemory(),500);
 assert.equal(slow.tags['T.ET'],50);assert.equal(fast.tags['T.ET'],500);assert.equal(scan(circuit,slowMemory,0).tags['T.ET'],50);
});
test('NO and NC contact traces expose condition separately from incoming power',()=>{
 const circuit={tags:{A:false,B:false,Y:false},inputTags:['A','B'],rungs:[{id:'R',elements:[{id:'a',type:'contact',mode:'no',tag:'A'},{id:'b',type:'contact',mode:'nc',tag:'B'},{id:'y',type:'coil',mode:'ote',tag:'Y'}]}]};
 const r=scan(circuit);assert.equal(r.trace.find(item=>item.elementId==='a').condition,false);assert.equal(r.trace.find(item=>item.elementId==='b').condition,true);assert.equal(r.trace.find(item=>item.elementId==='b').inputPower,false);assert.equal(r.trace.find(item=>item.elementId==='y').outputValue,false);
});
test('visual wire segments stop at a false NO contact and continue through a true NC contact',()=>{
 const circuit={tags:{A:false,B:false,Y:false},inputTags:['A','B'],rungs:[{id:'R',elements:[{id:'a',type:'contact',mode:'no',tag:'A'},{id:'b',type:'contact',mode:'nc',tag:'B'},{id:'y',type:'coil',mode:'ote',tag:'Y'}]}]};
 let r=scan(circuit);assert.equal(wireSegmentEnergized(r.trace,'R','a','input'),true);assert.equal(wireSegmentEnergized(r.trace,'R','a','output'),false);assert.equal(wireSegmentEnergized(r.trace,'R','b','input'),false);assert.equal(componentVisualState(r.trace,r.tags,'R','y','coil','Y').energized,false);
 circuit.tags.A=true;r=scan(circuit);assert.equal(wireSegmentEnergized(r.trace,'R','b','input'),true);assert.equal(wireSegmentEnergized(r.trace,'R','b','output'),true);assert.equal(componentVisualState(r.trace,r.tags,'R','y','coil','Y').energized,true);
});
test('parallel branch flow marks only the route segments reached by evaluated power',()=>{
 const circuit={tags:{A:true,B:false,Y:false},inputTags:['A','B'],rungs:[{id:'R',elements:[{id:'br',type:'branch',paths:[[{id:'a',type:'contact',mode:'no',tag:'A'}],[{id:'b',type:'contact',mode:'no',tag:'B'}]]},{id:'y',type:'coil',mode:'ote',tag:'Y'}]}]};
 const r=scan(circuit),flow=energizedFlowSegments(r.trace),has=(id,phase)=>flow.some(segment=>segment.elementId===id&&segment.phase===phase);
 assert.equal(has('br.0/a','output'),true);assert.equal(has('br.1/b','input'),true);assert.equal(has('br.1/b','output'),false);assert.equal(has('y','input'),true);assert.equal(r.tags.Y,true);
});
test('shared tag writes become visible to later rungs during the same scan',()=>{
 const circuit={tags:{A:true,Y:false,Z:false},inputTags:['A'],rungs:[{id:'write',elements:[{id:'a',type:'contact',mode:'no',tag:'A'},{id:'y',type:'coil',mode:'ote',tag:'Y'}]},{id:'read',elements:[{id:'yc',type:'contact',mode:'no',tag:'Y'},{id:'z',type:'coil',mode:'ote',tag:'Z'}]}]};
 const r=scan(circuit);assert.equal(r.tags.Z,true);assert.equal(r.trace.find(item=>item.elementId==='yc').tagValue,true);assert.equal(r.trace.at(-1).outputValue,true);
});
