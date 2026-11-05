import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyMemory, scan } from './scan.js';
import { deleteRung, insertRungElement, moveBranchElement, moveRung, moveRungElement, moveRungToIndex } from './edit.js';

const contact=(id,tag,mode='no')=>({id,type:'contact',tag,mode});
const coil=(id,tag)=>({id,type:'coil',mode:'ote',tag});

test('reordering moves the original instruction and preserves its properties',()=>{
 const start=contact('start','Start'),stop=contact('stop','Stop','nc'),branch={id:'branch',type:'branch',paths:[[contact('branch-start','Start')],[contact('holding','Motor')],[contact('alternate','Alt')]]},motor=coil('motor','Motor');
 const circuit={tags:{Start:true,Stop:false,Motor:false,Alt:false},inputTags:['Start','Stop','Alt'],rungs:[{id:'R1',elements:[start,stop,branch,motor]}]};
 assert.equal(moveRungElement(circuit,'R1','start',2),true);
 assert.deepEqual(circuit.rungs[0].elements.map(item=>item.id),['stop','start','branch','motor']);
 assert.equal(circuit.rungs[0].elements[1],start);assert.equal(start.tag,'Start');assert.equal(circuit.rungs[0].elements[2],branch);
 assert.equal(branch.paths[1][0].id,'holding');assert.equal(branch.paths[2][0].tag,'Alt');
 let result=scan(circuit,emptyMemory());assert.equal(result.tags.Motor,true);assert.deepEqual(result.trace.map(item=>item.elementId),['stop','start','branch.0/branch-start','branch.1/holding','branch.2/alternate','branch','motor']);
 circuit.tags.Start=false;result=scan(circuit,result.memory);assert.equal(result.tags.Motor,false,'the moved Start contact now blocks the series rung');
 circuit.tags.Stop=true;result=scan(circuit,result.memory);assert.equal(result.tags.Motor,false);
});

test('library insertion adds an instruction at an insertion slot and evaluates in the new order',()=>{
 const circuit={tags:{A:false,B:true,Y:false},inputTags:['A','B'],rungs:[{id:'R',elements:[contact('b','B'),coil('y','Y')]}]};
 const added=contact('a','A');assert.equal(insertRungElement(circuit,'R',added,1),true);
 assert.deepEqual(circuit.rungs[0].elements.map(item=>item.id),['b','a','y']);
 let result=scan(circuit);assert.equal(result.tags.Y,false);assert.deepEqual(result.trace.map(item=>item.elementId),['b','a','y']);
 circuit.tags.A=true;result=scan(circuit,result.memory);assert.equal(result.tags.Y,true);
});

test('invalid moves and duplicate insertions do not alter a rung',()=>{
 const instruction=contact('a','A'),rung={id:'R',elements:[instruction]},circuit={tags:{A:false},rungs:[rung]};
 assert.equal(moveRungElement(circuit,'missing','a',0),false);assert.equal(moveRungElement(circuit,'R','missing',0),false);
 assert.equal(insertRungElement(circuit,'R',instruction,0),false);assert.deepEqual(rung.elements,[instruction]);
});

test('branch child can be reordered within its own path without changing its tag or sibling path',()=>{
 const a=contact('a','A'),b=contact('b','B'),other=contact('other','C'),branch={id:'branch',type:'branch',paths:[[a,b],[other]]},circuit={tags:{A:true,B:true,C:false,Y:false},inputTags:['A','B','C'],rungs:[{id:'R',elements:[branch,coil('y','Y')]}]};
 assert.equal(moveBranchElement(circuit,'R','branch',0,'a',2),true);assert.deepEqual(branch.paths[0].map(item=>item.id),['b','a']);assert.deepEqual(branch.paths[1],[other]);assert.equal(branch.paths[0][1].tag,'A');assert.equal(scan(circuit).tags.Y,true);
});

test('rung reordering preserves rung identity, branches, tags, and instruction configuration',()=>{
 const first={id:'first',elements:[contact('a','A')]},second={id:'second',elements:[{id:'branch',type:'branch',paths:[[contact('b','B')],[contact('c','C')]]},coil('y','Y')]};
 const circuit={tags:{A:false,B:true,C:false,Y:false},inputTags:['A','B','C'],rungs:[first,second]};
 assert.equal(moveRung(circuit,'second',-1),true);assert.deepEqual(circuit.rungs,[second,first]);
 assert.equal(circuit.rungs[0],second);assert.equal(circuit.rungs[0].elements[0].paths[1][0].tag,'C');assert.equal(circuit.rungs[0].elements[1].tag,'Y');
 assert.equal(moveRung(circuit,'second',-1),false,'top rung cannot move up');assert.equal(moveRung(circuit,'first',1),false,'bottom rung cannot move down');
 assert.equal(moveRung(circuit,'second',0),false);assert.equal(moveRung(circuit,'missing',1),false);
});

test('rung deletion removes only the selected rung and refuses the final rung',()=>{
 const first={id:'first',elements:[contact('a','A')]},second={id:'second',elements:[coil('y','Y')]};
 const circuit={tags:{A:false,Y:false},inputTags:['A'],rungs:[first,second]};
 assert.equal(deleteRung(circuit,'missing'),null);assert.equal(circuit.rungs.length,2);
 assert.equal(deleteRung(circuit,'second'),second);assert.deepEqual(circuit.rungs,[first]);assert.deepEqual(circuit.tags,{A:false,Y:false});
 assert.equal(deleteRung(circuit,'first'),null);assert.deepEqual(circuit.rungs,[first]);
});

test('drag reorder moves a rung to its drop position while preserving all rung data',()=>{
 const a={id:'A',elements:[contact('a','A')]},b={id:'B',elements:[{id:'branch',type:'branch',paths:[[contact('b','B')],[contact('c','C')]]},coil('y','Y')]},c={id:'C',elements:[]};
 const circuit={tags:{A:false,B:true,C:false,Y:false},inputTags:['A','B','C'],rungs:[a,b,c]};
 assert.equal(moveRungToIndex(circuit,'A',2),true);assert.deepEqual(circuit.rungs,[b,c,a]);assert.equal(circuit.rungs[0],b);assert.equal(b.elements[0].paths[0][0].tag,'B');assert.equal(b.elements[1].tag,'Y');
 assert.equal(moveRungToIndex(circuit,'B',0),false);assert.equal(moveRungToIndex(circuit,'missing',0),false);assert.equal(moveRungToIndex(circuit,'A',3),false);assert.deepEqual(circuit.tags,{A:false,B:true,C:false,Y:false});
});
