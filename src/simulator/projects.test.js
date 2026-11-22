import test from 'node:test';
import assert from 'node:assert/strict';
import { starter, tankStarter } from '../content/catalog.js';
import { loadSavedProject, saveProject } from './projects.js';

test('Motor Starter and tank save and reload independent circuit configuration',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};
 const motor=structuredClone(starter),tank=structuredClone(tankStarter);
 motor.rungs.push({id:'motor-edit',elements:[]});tank.tags.Level=47;tank.rungs[0].elements[0].op='gte';
 saveProject(storage,'motor',motor);saveProject(storage,'tank',tank);
 const motorBack=loadSavedProject(storage,'motor',starter),tankBack=loadSavedProject(storage,'tank',tankStarter);
 assert.equal(motorBack.rungs.at(-1).id,'motor-edit');assert.equal(tankBack.tags.Level,47);assert.equal(tankBack.rungs[0].elements[0].op,'gte');
 assert.notEqual(motorBack,tankBack);assert.equal(values.has('lltl-project-v1'),true);assert.equal(values.has('lltl-project-tank-v1'),true);
});

test('a missing project loads a cloned starter without mutating the catalog',()=>{
 const storage={getItem:()=>null,setItem(){}};const loaded=loadSavedProject(storage,'tank',tankStarter);
 loaded.tags.Level=1;assert.equal(tankStarter.tags.Level,30);
});
