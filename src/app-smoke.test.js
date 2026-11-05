import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { scan } from './simulator/scan.js';

const store=new Map();
let dropRowUnderPointer=null;
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value))};
globalThis.setInterval=()=>1;
globalThis.confirm=()=>true;
class FakeRoot{
 constructor(){this.nodes=new Map();this.handlers=new Map();}
 addEventListener(name,handler){const current=this.handlers.get(name);this.handlers.set(name,current?event=>{current(event);handler(event);}:handler);}
 querySelector(selector){if(selector==='[data-feedback]'){if(!this.feedbackNode)this.feedbackNode={textContent:'',hidden:true};return this.feedbackNode;}return null;}
 querySelectorAll(selector){
  if(selector.startsWith('.ladder-row')){
   const rows=[],regex=/<g class="ladder-row(?: rung-selected)?" data-rung="([^"]*)" transform="translate\(0 (\d+)\)">/g;let match;
   while((match=regex.exec(this.html||''))){const id=match[1],offset=Number(match[2]),classes=new Set(['ladder-row']),nodeKey=`row:${id}`;let row=this.nodes.get(nodeKey);if(!row){const svg=this.workspaceSvg(),indicator={setAttribute(){}};row={dataset:{rung:id},click(){fakeRoot.handlers.get('click')?.({target:row,preventDefault(){},stopPropagation(){}});},classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name),toggle(name,on){on?classes.add(name):classes.delete(name);}},contains:()=>false,closest:sel=>sel==='.ladder-row'?row:sel==='svg'?svg:null,querySelector:sel=>sel==='svg'?svg:sel==='[data-insertion-indicator]'||sel===`[data-insertion-indicator="${id}"]`?indicator:null,getBoundingClientRect:()=>svg.getBoundingClientRect(),ondragover:null,ondrop:null,ondragleave:null,offset};this.nodes.set(nodeKey,row);}if(selector.includes('.drop-target')&&!row.classList.contains('drop-target'))continue;rows.push(row);}return rows;
  }
  const attr=selector.match(/^\[data-([a-z-]+)\]$/)?.[1];if(!attr)return [];
  const regex=new RegExp(`data-${attr}="([^"]*)"`,'g'),items=[];let match;
  while((match=regex.exec(this.html||''))){const key=attr.replace(/-([a-z])/g,(_,x)=>x.toUpperCase()),value=match[1].replaceAll('&amp;','&').replaceAll('&quot;','"'),nodeKey=`${attr}:${value}`;let node=this.nodes.get(nodeKey);if(!node){const tagStart=(this.html||'').lastIndexOf('<',match.index),tagEnd=(this.html||'').indexOf('>',match.index),tag=(this.html||'').slice(tagStart,tagEnd+1),dataset={};for(const [,name,raw] of tag.matchAll(/data-([a-z-]+)="([^"]*)"/g))dataset[name.replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=raw.replaceAll('&amp;','&').replaceAll('&quot;','"');node={setAttribute(){},dataset:{...dataset,[key]:value},onclick:null,click(){const event={target:this,stopped:false,stopPropagation(){this.stopped=true;},preventDefault(){}};fakeRoot.handlers.get('click')?.(event);if(!event.stopped)this.onclick?.(event);},closest:selector=>{if(selector.includes(',')){for(const part of selector.split(',')){const result=node.closest(part.trim());if(result)return result;}return null;}const attr=selector.match(/^\[data-([a-z-]+)\]$/)?.[1];if(attr){const prop=attr.replace(/-([a-z])/g,(_,x)=>x.toUpperCase());return Object.hasOwn(node.dataset,prop)?node:null;}if(selector==='svg')return fakeRoot.workspaceSvg();if(selector==='.editor-column')return(node.dataset.action&&['delete-selected','clear-selection','delete-rung'].includes(node.dataset.action))||node.dataset.select||node.dataset.addPath||node.dataset.selectRung||node.dataset.rungWire||node.dataset.rungRail||node.dataset.rungHandle?{}:null;if(selector==='.ladder-workspace')return node.dataset.rung||node.dataset.rungId||node.dataset.dragRung||node.dataset.selectRung||node.dataset.rungHandle?{}:null;if(selector==='.ladder-row'){const rung=node.dataset.rung||node.dataset.rungId||node.dataset.dragRung||node.dataset.selectRung||node.dataset.rungHandle;return rung?fakeRoot.querySelectorAll('.ladder-row').find(row=>row.dataset.rung===rung)||null:null;}return null;}};this.nodes.set(nodeKey,node);}items.push(node);}
  return items;
 }
 workspaceSvg(){const m=(this.html||'').match(/<svg class="ladder-svg" data-workspace-svg viewBox="0 0 (\d+) (\d+)"/),width=Number(m?.[1]||900),height=Number(m?.[2]||180);return{viewBox:{baseVal:{x:0,y:0,width,height}},getBoundingClientRect:()=>({left:0,top:0,width,height}),setPointerCapture(){},querySelector:selector=>({setAttribute(){}})};}
 set innerHTML(value){this.html=value;}
 get innerHTML(){return this.html||'';}
}
const fakeRoot=new FakeRoot();
globalThis.document={querySelector:()=>fakeRoot,documentElement:{dataset:{}},elementFromPoint:()=>dropRowUnderPointer};
const appModule=await import('./app.js');
const click=(selector,value)=>{const item=fakeRoot.querySelectorAll(selector).find(x=>Object.values(x.dataset).includes(value));assert.ok(item,`missing ${selector}=${value}`);item.click();};

test('app renders the Learn section and an accessible lesson check',()=>{
 assert.match(fakeRoot.innerHTML,/LADDER LOGIC/);assert.match(fakeRoot.innerHTML,/Read the rung/);assert.match(fakeRoot.innerHTML,/QUICK CHECK/);assert.match(fakeRoot.innerHTML,/name="lesson-answer"/);assert.match(fakeRoot.innerHTML,/<nav class="main-nav" aria-label="Main navigation">/);assert.doesNotMatch(fakeRoot.innerHTML,/<aside class="sidebar"/);
 const initial=JSON.parse(store.get('lltl-project-v1'));assert.deepEqual(Object.keys(initial.tags),['Start','Stop','Motor']);assert.deepEqual(initial.inputTags,['Start','Stop']);assert.deepEqual(initial.monitorTags,['Start','Stop','Motor']);assert.equal(initial.rungs.length,1);assert.deepEqual(initial.rungs[0].elements.map(item=>[item.type,item.tag,item.mode]),[['contact','Stop','nc'],['contact','Start','no'],['coil','Motor','ote']]);assert.deepEqual(Object.keys(scan(initial).tags),['Start','Stop','Motor']);assert.deepEqual(Object.keys(scan(initial).memory.values),['Start','Stop','Motor']);assert.doesNotMatch(JSON.stringify(initial),/InputA|Counter/);
});
test('navigation opens the Playground, component reference, and challenges',()=>{
 click('[data-tab]','Playground');assert.match(fakeRoot.innerHTML,/Single scan/i);assert.match(fakeRoot.innerHTML,/data-action="run"/);assert.match(fakeRoot.innerHTML,/data-action="pause"/);assert.match(fakeRoot.innerHTML,/data-action="stop"/);assert.match(fakeRoot.innerHTML,/data-action="reset"/);assert.doesNotMatch(fakeRoot.innerHTML,/<aside class="monitor-panel"/);
 click('[data-action]','run');assert.match(fakeRoot.innerHTML,/RUNNING/);assert.match(fakeRoot.innerHTML,/class="app-shell simulation-running /);click('[data-action]','pause');assert.match(fakeRoot.innerHTML,/READY/);assert.doesNotMatch(fakeRoot.innerHTML,/class="app-shell simulation-running /);
 click('[data-action]','monitor-panel');assert.match(fakeRoot.innerHTML,/Live monitor/);assert.match(fakeRoot.innerHTML,/TAG TABLE · 3 TAGS/);assert.deepEqual([...fakeRoot.innerHTML.matchAll(/data-monitor-row="([^"]+)"/g)].map(match=>match[1]),['Start','Stop','Motor']);assert.doesNotMatch(fakeRoot.innerHTML,/data-monitor-row="(?:InputA|Counter)"/);assert.match(fakeRoot.innerHTML,/aria-expanded="true"/);
 click('[data-action]','components-panel');assert.match(fakeRoot.innerHTML,/COMPONENTS/);assert.match(fakeRoot.innerHTML,/TIMERS/);assert.match(fakeRoot.innerHTML,/COUNTERS & LOGIC/);assert.match(fakeRoot.innerHTML,/class="playground-layout components-open monitor-open"/);
 click('[data-action]','components-panel');click('[data-action]','monitor-panel');
 click('[data-tab]','Components');assert.match(fakeRoot.innerHTML,/Component library/);assert.match(fakeRoot.innerHTML,/COMMON MISTAKE/);
 click('[data-tab]','Challenges');assert.match(fakeRoot.innerHTML,/Count each press once/);assert.match(fakeRoot.innerHTML,/Reveal hint 1/);click('[data-hint]','0');assert.equal(store.get('lltl-hints-0'),'1');click('[data-hint]','0');assert.equal(store.get('lltl-hints-0'),'2');
 click('[data-tab]','Learn');assert.match(fakeRoot.innerHTML,/QUICK CHECK/);
});
test('Start and Stop drive the motor from the actual evaluated rung',()=>{
 click('[data-tab]','Playground');if(!fakeRoot.innerHTML.includes('id="monitor-panel"'))click('[data-action]','monitor-panel');click('[data-tag]','Start');
 assert.match(fakeRoot.innerHTML,/data-monitor-row="Start"[\s\S]*?<button class="tag-value on" data-tag-state data-tag="Start">ON/);assert.match(fakeRoot.innerHTML,/data-monitor-row="Stop"[\s\S]*?<button class="tag-value " data-tag-state data-tag="Stop">OFF/);assert.match(fakeRoot.innerHTML,/data-monitor-row="Motor"[\s\S]*?<span class="tag-value on" data-tag-state>ON/);
 const energizedCoil=fakeRoot.innerHTML.match(/<g class="ladder-symbol ([^"]*)"[^>]*data-select="motor"/);
 assert.ok(energizedCoil,'motor output coil is rendered');assert.match(energizedCoil[1],/symbol-active/);
 assert.match(fakeRoot.innerHTML,/class="coil-line"/);assert.match(fakeRoot.innerHTML,/class="tag-label">Motor<\/text>/);assert.match(fakeRoot.innerHTML,/class="component-hitbox"[^>]*aria-hidden="true"/);assert.match(fakeRoot.innerHTML,/transform="translate\(800 90\)" data-select="motor"/);assert.match(fakeRoot.innerHTML,/x1="830" y1="90" x2="850" y2="90" class="wire-line active"/);assert.doesNotMatch(fakeRoot.innerHTML,/class="coil-state"|data-live-detail>OFF<\/text>|data-live-detail>ON<\/text>/);assert.match(fakeRoot.innerHTML,/class="wire-line active"/);assert.match(fakeRoot.innerHTML,/class="flow-pulse active"/);
 click('[data-tag]','Stop');assert.match(fakeRoot.innerHTML,/data-monitor-row="Stop"[\s\S]*?<button class="tag-value on" data-tag-state data-tag="Stop">ON/);assert.match(fakeRoot.innerHTML,/data-monitor-row="Motor"[\s\S]*?<span class="tag-value " data-tag-state>OFF/);
 const deenergizedCoil=fakeRoot.innerHTML.match(/<g class="ladder-symbol ([^"]*)"[^>]*data-select="motor"/);
 assert.ok(deenergizedCoil);assert.doesNotMatch(deenergizedCoil[1],/symbol-active/);
});
test('library drag drop inserts a new component at the rung insertion slot',()=>{
 click('[data-tab]','Playground');click('[data-action]','components-panel');
 const paletteButton=fakeRoot.querySelectorAll('[data-add]').find(button=>button.dataset.add==='no');assert.ok(paletteButton);const transfer={types:[],data:'',setData(type,value){this.types=[type];this.data=value;},getData(){return this.data;}};paletteButton.ondragstart({dataTransfer:transfer});
 const row=fakeRoot.querySelectorAll('.ladder-row').find(item=>item.dataset.rung==='R1');assert.ok(row);
 row.ondragover({dataTransfer:transfer,clientX:215,preventDefault(){}});row.ondrop({dataTransfer:transfer,clientX:215,preventDefault(){}});
 const circuit=JSON.parse(store.get('lltl-project-v1'));assert.deepEqual(circuit.rungs[0].elements.map(item=>item.id==='stop'||item.id==='start'||item.id==='motor'?item.id:item.id.startsWith('no-')?'new-contact':item.id),['stop','new-contact','start','motor']);
 assert.match(fakeRoot.innerHTML,/data-drag-element="no-/);assert.match(fakeRoot.innerHTML,/data-insertion-indicator/);
 const invalid=fakeRoot.querySelectorAll('[data-add]').find(button=>button.dataset.add==='ctu');invalid.ondragstart({dataTransfer:transfer});invalid.ondragend();assert.equal(fakeRoot.feedbackNode.textContent,'Drop a component onto a rung to add it to the circuit.');
});
test('dragging a placed SVG instruction reorders its actual rung element',()=>{
 const symbol=fakeRoot.querySelectorAll('[data-drag-element]').find(item=>item.dataset.dragElement==='start');assert.ok(symbol);const initialInput=JSON.parse(store.get('lltl-project-v1')).tags.Start;
 const row=fakeRoot.querySelectorAll('.ladder-row').find(item=>item.dataset.rung==='R1');dropRowUnderPointer=row;
 const down={target:symbol,button:0,pointerId:7,clientX:130,clientY:90};fakeRoot.handlers.get('pointerdown')(down);
 fakeRoot.handlers.get('pointermove')({clientX:200,clientY:90});
 fakeRoot.handlers.get('pointerup')({clientX:200,clientY:90});dropRowUnderPointer=null;
 const message=fakeRoot.innerHTML.match(/<div class="feedback"[^>]*>(.*?)<\/div>/)?.[1];assert.equal(message,'Instruction moved. The rung was recalculated.');
 const circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.tags.Start,initialInput,'dragging a component does not operate its tag');assert.deepEqual(circuit.rungs[0].elements.map(item=>['stop','start','motor'].includes(item.id)?item.id:item.id.startsWith('no-')?'new-contact':item.id),['stop','start','new-contact','motor']);
});
test('Add Rung expands one shared workspace and extra timer tags stay opt-in',()=>{
 click('[data-tab]','Playground');const initial=fakeRoot.innerHTML.match(/data-workspace-svg viewBox="0 0 (\d+) (\d+)"/);assert.ok(initial);click('[data-action]','add-rung');let circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs.length,2);assert.deepEqual(circuit.rungs.at(-1).elements,[]);assert.doesNotMatch(fakeRoot.innerHTML,/rung-options|component-inspector/,'adding a rung does not select it');assert.equal((fakeRoot.innerHTML.match(/data-ladder-workspace/g)||[]).length,1);assert.equal((fakeRoot.innerHTML.match(/data-workspace-svg/g)||[]).length,1);assert.equal((fakeRoot.innerHTML.match(/class="rail-line shared-rail/g)||[]).length,2);assert.match(fakeRoot.innerHTML,/data-workspace-svg viewBox="0 0 900 360"/);click('[data-action]','add-rung');circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs.length,3);assert.deepEqual(circuit.rungs.at(-1).elements,[]);assert.doesNotMatch(fakeRoot.innerHTML,/rung-options|component-inspector/,'the third blank rung is also unselected');assert.match(fakeRoot.innerHTML,/data-workspace-svg viewBox="0 0 900 540"/);assert.equal((fakeRoot.innerHTML.match(/data-workspace-svg/g)||[]).length,1);
 if(!fakeRoot.innerHTML.includes('id="component-panel"'))click('[data-action]','components-panel');const timer=fakeRoot.querySelectorAll('[data-add]').find(item=>item.dataset.add==='ton');timer.click();circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs.at(-1).elements.length,1);assert.equal(circuit.rungs.at(-1).elements[0].type,'timer');
 assert.match(fakeRoot.innerHTML,/TAG TABLE · 3 TAGS/);click('[data-action]','monitor-tags');const elapsed=fakeRoot.querySelectorAll('[data-monitor-tag]').find(item=>item.dataset.monitorTag==='TON_1.ET');assert.ok(elapsed);elapsed.checked=true;elapsed.onchange();assert.match(fakeRoot.innerHTML,/TON_1\.ET/);assert.match(fakeRoot.innerHTML,/TAG TABLE · 4 TAGS/);
});
test('flow animation can be disabled without stopping the simulator',()=>{
 click('[data-action]','flow-toggle');assert.match(fakeRoot.innerHTML,/flow-disabled/);assert.match(fakeRoot.innerHTML,/aria-pressed="false"/);click('[data-action]','run');assert.match(fakeRoot.innerHTML,/simulation-running flow-disabled/);click('[data-action]','pause');click('[data-action]','flow-toggle');assert.doesNotMatch(fakeRoot.innerHTML,/flow-disabled/);
});
test('light and dark theme controls retain accessible labels and theme tokens',async()=>{
 click('[data-action]','theme');assert.equal(document.documentElement.dataset.theme,'light');assert.match(fakeRoot.innerHTML,/Switch to dark theme/);
 click('[data-action]','theme');assert.equal(document.documentElement.dataset.theme,'dark');
 const css=await readFile(new URL('./ui/styles.css',import.meta.url),'utf8'),refresh=css.slice(css.lastIndexOf('/* Top navigation'));assert.match(refresh,/--bg:#202a32/);assert.match(refresh,/:root\[data-theme=light\][^{]*\{color-scheme:light;--bg:#e7eef0/);assert.equal(refresh.match(/--violet:#[a-fA-F0-9]{6}/g).at(-1),'--violet:#327c78');
});
test('responsive workspace and reduced-motion styles are present',async()=>{
 const css=await readFile(new URL('./ui/styles.css',import.meta.url),'utf8');
 assert.match(css,/\.playground-layout\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/@media\(max-width:800px\)/);assert.match(css,/@media\(max-width:480px\)/);
 const refresh=css.slice(css.lastIndexOf('/* Top navigation'));assert.match(refresh,/\.page-playground\{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden/);assert.match(refresh,/\.playground-layout \.tool-panel,\.playground-layout \.monitor-panel\{height:100%;min-width:0;min-height:0;overflow-y:auto/);assert.match(refresh,/\.editor-body\{min-height:0;flex:1 1 auto;overflow:auto/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('legacy seeded default is migrated while custom saved circuits survive reload',()=>{
 const legacy={tags:{Start:false,Stop:false,Motor:false,InputA:false,Counter:0},inputTags:['Start','Stop','InputA'],monitorTags:['Start','Stop','Motor','InputA','Counter'],rungs:[{id:'R1',elements:[{id:'stop',type:'contact',mode:'nc',tag:'Stop'},{id:'start',type:'contact',mode:'no',tag:'Start'},{id:'motor',type:'coil',mode:'ote',tag:'Motor'}]},{id:'R2',elements:[{id:'count-input',type:'contact',mode:'no',tag:'InputA'},{id:'counter',type:'counter',mode:'ctu',tag:'Counter',preset:3}]}]};
 store.set('lltl-project-v1',JSON.stringify(legacy));const migrated=appModule.loadProject();assert.equal(migrated.rungs.length,1);assert.deepEqual(Object.keys(migrated.tags),['Start','Stop','Motor']);assert.deepEqual(migrated.monitorTags,['Start','Stop','Motor']);assert.deepEqual(JSON.parse(store.get('lltl-project-v1')),migrated);
 const custom={tags:{Start:true,Stop:false,Motor:false,Aux:true},inputTags:['Start','Aux'],monitorTags:['Aux'],rungs:[{id:'CustomA',elements:[{id:'custom-contact',type:'contact',mode:'no',tag:'Aux'}]},{id:'CustomB',elements:[{id:'custom-coil',type:'coil',mode:'ote',tag:'Motor'}]}]};store.set('lltl-project-v1',JSON.stringify(custom));assert.deepEqual(appModule.loadProject(),custom);assert.deepEqual(JSON.parse(store.get('lltl-project-v1')),custom);
 const customNoMonitor={...custom,monitorTags:undefined};delete customNoMonitor.monitorTags;store.set('lltl-project-v1',JSON.stringify(customNoMonitor));const loaded=appModule.loadProject();assert.deepEqual(loaded.rungs,custom.rungs);assert.deepEqual(loaded.tags,custom.tags);assert.deepEqual(loaded.monitorTags,['Start','Stop','Motor']);
 const missingTags={rungs:[{id:'R1',elements:[{id:'stop',type:'contact',mode:'nc',tag:'Stop'},{id:'start',type:'contact',mode:'no',tag:'Start'},{id:'motor',type:'coil',mode:'ote',tag:'Motor'}]}]};store.set('lltl-project-v1',JSON.stringify(missingTags));const repaired=appModule.loadProject();assert.deepEqual(repaired.tags,{Stop:false,Start:false,Motor:false});assert.deepEqual(new Set(repaired.inputTags),new Set(['Start','Stop']));assert.deepEqual(repaired.monitorTags,['Start','Stop','Motor']);assert.deepEqual(scan(repaired).tags,{Stop:false,Start:false,Motor:false});assert.deepEqual(scan(repaired).memory.values,{Stop:false,Start:false,Motor:false});assert.equal(repaired.rungs.length,1);
 store.set('lltl-project-v1',JSON.stringify(migrated));assert.deepEqual(appModule.loadProject(),migrated);assert.equal(JSON.parse(store.get('lltl-project-v1')).rungs.length,1);
});

test('component hit areas select details and confirmed deletion updates only the selected branch instruction',()=>{
 click('[data-tab]','Playground');
 if(!fakeRoot.innerHTML.includes('id="component-panel"'))click('[data-action]','components-panel');

 const paletteBranch=fakeRoot.querySelectorAll('[data-add]').find(item=>item.dataset.add==='branch');
 assert.ok(paletteBranch);
 paletteBranch.click();

 let circuit=JSON.parse(store.get('lltl-project-v1'));
 const rung=circuit.rungs.at(-1);
 const branch=rung.elements.find(item=>item.type==='branch');
 assert.ok(branch);
 assert.equal(branch.paths.length,2);
 assert.deepEqual(branch.paths,[[],[]],'a new branch starts with two empty paths');

 const pathNode=fakeRoot.querySelectorAll('[data-branch-drop]').find(item=>item.dataset.branchDrop===branch.id);
 assert.ok(pathNode);
 const branchX=Number(pathNode.dataset.branchX);

 function branchTarget(pathIndex){
  return {
   dataset:{
    branchDrop:branch.id,
    pathIndex:String(pathIndex),
    branchX:String(branchX),
    rung:rung.id
   },
   closest(selector){
    if(selector==='[data-branch-drop]')return this;
    if(selector==='.ladder-row')return fakeRoot.querySelectorAll('.ladder-row').find(item=>item.dataset.rung===rung.id);
    return null;
   }
  };
 }

 function dropContact(pathIndex){
  const palette=fakeRoot.querySelectorAll('[data-add]').find(item=>item.dataset.add==='no');
  assert.ok(palette,'normally open contact exists in the component palette');
  const dataTransfer={
   types:['application/x-lltl-component'],
   setData(){},
   getData(){return 'no';}
  };
  palette.ondragstart({dataTransfer});
  const row=fakeRoot.querySelectorAll('.ladder-row').find(item=>item.dataset.rung===rung.id);
  assert.ok(row);
  row.ondrop({
   dataTransfer,
   target:branchTarget(pathIndex),
   clientX:branchX,
   preventDefault(){}
  });
 }

 dropContact(0);
 dropContact(1);

 circuit=JSON.parse(store.get('lltl-project-v1'));
 let updatedBranch=circuit.rungs.at(-1).elements.find(item=>item.id===branch.id);
 assert.equal(updatedBranch.paths[0].length,1);
 assert.equal(updatedBranch.paths[1].length,1);

 const child=updatedBranch.paths[0][0];
 const sibling=updatedBranch.paths[1][0];
 assert.equal(child.type,'contact');
 assert.equal(sibling.type,'contact');
 assert.equal(child.tag,'Start');
 assert.equal(circuit.tags.Start!==undefined,true);

 let childNode=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select===child.id);
 assert.ok(childNode);
 childNode.click();

 assert.match(fakeRoot.innerHTML,/Normally Open Contact/);
 assert.match(fakeRoot.innerHTML,/Checks whether the assigned Boolean tag is TRUE/);
 assert.match(fakeRoot.innerHTML,/Commonly used for push buttons/);
 assert.match(fakeRoot.innerHTML,/Assigned tag/);
 assert.match(fakeRoot.innerHTML,/Delete component/);
 assert.match(fakeRoot.innerHTML,/Close component details/);

 const selected=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select===child.id);
 assert.ok(selected);
 assert.match(fakeRoot.innerHTML,/component-hitbox/);

 const dragNode=fakeRoot.querySelectorAll('[data-drag-element]').find(item=>item.dataset.dragElement===child.id);
 assert.ok(dragNode);

 const destination=branchTarget(1);
 dropRowUnderPointer=destination;

 fakeRoot.handlers.get('pointerdown')({
  target:dragNode,
  button:0,
  pointerId:11,
  clientX:branchX-6,
  clientY:62
 });
 fakeRoot.handlers.get('pointermove')({clientX:branchX+20,clientY:62});
 fakeRoot.handlers.get('pointerup')({clientX:branchX+20,clientY:62});

 dropRowUnderPointer=null;

 circuit=JSON.parse(store.get('lltl-project-v1'));
 updatedBranch=circuit.rungs.at(-1).elements.find(item=>item.id===branch.id);

 assert.equal(updatedBranch.paths[0].length,0);
 assert.equal(updatedBranch.paths[1].length,2);
 assert.ok(updatedBranch.paths[1].some(item=>item.id===child.id),'moving preserves the original component ID');
 assert.ok(updatedBranch.paths[1].some(item=>item.id===sibling.id),'the existing destination component is preserved');
 assert.equal(circuit.tags.Start!==undefined,true,'moving a contact does not create another tag');

 childNode=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select===child.id);
 assert.ok(childNode);
 childNode.click();
 assert.match(fakeRoot.innerHTML,/Normally Open Contact/);

 globalThis.confirm=()=>false;
 click('[data-action]','delete-selected');

 circuit=JSON.parse(store.get('lltl-project-v1'));
 updatedBranch=circuit.rungs.at(-1).elements.find(item=>item.id===branch.id);
 assert.ok(updatedBranch.paths[1].some(item=>item.id===child.id),'cancel keeps the component');

 globalThis.confirm=()=>true;
 click('[data-action]','delete-selected');

 circuit=JSON.parse(store.get('lltl-project-v1'));
 const after=circuit.rungs.at(-1).elements.find(item=>item.id===branch.id);

 assert.ok(after,'branch remains in the circuit');
 assert.equal(after.paths[0].length,0,'the original path remains empty');
 assert.equal(after.paths[1].length,1,'only the selected component is deleted');
 assert.equal(after.paths[1][0].id,sibling.id,'the other component is preserved');
 assert.ok(circuit.rungs.some(item=>item.elements.some(element=>element.id==='motor')),'unrelated motor output stays in its rung');
 assert.match(fakeRoot.innerHTML,/deleted/);
 assert.ok(scan(circuit).trace.some(item=>item.elementId===branch.id));
});
test('default, newly added contacts and coils select through the full hitbox and delete only themselves',async()=>{
 click('[data-tab]','Playground');
 const start=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select==='start');assert.ok(start,'default Start contact is rendered');
 const hitboxTarget={closest:selector=>selector==='[data-select]'||selector.includes('[data-select]')?start:selector.includes('.editor-column')||selector==='[data-ladder-workspace]'?{}:null};fakeRoot.handlers.get('click')({target:hitboxTarget,preventDefault(){},stopPropagation(){}});assert.match(fakeRoot.innerHTML,/Normally Open Contact/);assert.match(fakeRoot.innerHTML,/COMPONENT DETAILS · CONTACT/);assert.match(fakeRoot.innerHTML,/class="ladder-symbol[^\"]*selected-symbol/);assert.doesNotMatch(fakeRoot.innerHTML,/rung-options/);
 click('[data-action]','delete-selected');let circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs[0].elements.some(item=>item.id==='start'),false);assert.ok(circuit.rungs[0].elements.some(item=>item.id==='stop'));assert.ok(circuit.rungs[0].elements.some(item=>item.id==='motor'));
 if(!fakeRoot.innerHTML.includes('id="component-panel"'))click('[data-action]','components-panel');let before=new Set(JSON.parse(store.get('lltl-project-v1')).rungs.flatMap(rung=>rung.elements.map(item=>item.id)));
 click('[data-add]','no');circuit=JSON.parse(store.get('lltl-project-v1'));const addedContact=circuit.rungs.flatMap(rung=>rung.elements).find(item=>!before.has(item.id));assert.ok(addedContact);let node=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select===addedContact.id);node.click();assert.match(fakeRoot.innerHTML,/Normally Open Contact/);assert.match(fakeRoot.innerHTML,/data-select="[^"]+"[^>]*data-element-type="contact"/);
 click('[data-action]','delete-selected');circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs.flatMap(rung=>rung.elements).some(item=>item.id===addedContact.id),false);assert.ok(circuit.rungs.flatMap(rung=>rung.elements).some(item=>item.id==='stop'));assert.ok(circuit.rungs.flatMap(rung=>rung.elements).some(item=>item.id==='motor'));
 before=new Set(circuit.rungs.flatMap(rung=>rung.elements.map(item=>item.id)));click('[data-add]','coil');circuit=JSON.parse(store.get('lltl-project-v1'));const addedCoil=circuit.rungs.flatMap(rung=>rung.elements).find(item=>!before.has(item.id));assert.equal(addedCoil.type,'coil');node=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select===addedCoil.id);assert.ok(node);node.click();assert.match(fakeRoot.innerHTML,/Output Coil \(OTE\)/);assert.match(fakeRoot.innerHTML,/Assigned tag/);
 click('[data-action]','delete-selected');circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs.flatMap(rung=>rung.elements).some(item=>item.id===addedCoil.id),false);assert.ok(circuit.rungs.flatMap(rung=>rung.elements).some(item=>item.id==='motor'));
 const source=await readFile(new URL('./app.js',import.meta.url),'utf8');assert.match(source,/x="-62" y="-56" width="124" height="112" rx="5" class="component-hitbox" fill="#000" fill-opacity="0\.001" pointer-events="all"/);assert.match(source,/root\.addEventListener\('click',[\s\S]*?\},true\)/);
});

test('component and rung selection are separate, shared rails select a rung, and rung dragging reorders in place',()=>{
 click('[data-tab]','Playground');let circuit=JSON.parse(store.get('lltl-project-v1'));const baseIds=circuit.rungs.map(rung=>rung.id),baseComponents=structuredClone(circuit.rungs[0].elements),baseTags=structuredClone(circuit.tags);
 let motor=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select==='motor');assert.ok(motor);motor.click();assert.match(fakeRoot.innerHTML,/class="ladder-symbol[^\"]*selected-symbol[^\"]*"[^>]*data-select="motor"/);assert.match(fakeRoot.innerHTML,/Output Coil \(OTE\)/);assert.doesNotMatch(fakeRoot.innerHTML,/rung-options/);assert.ok(fakeRoot.innerHTML.indexOf('data-ladder-workspace')<fakeRoot.innerHTML.indexOf('<aside class="component-inspector"'));
 fakeRoot.querySelectorAll('[data-rung-wire]').find(item=>item.dataset.rungWire===baseIds[0]).click();assert.match(fakeRoot.innerHTML,/class="ladder-row rung-selected"/);assert.match(fakeRoot.innerHTML,/rung-options/);assert.doesNotMatch(fakeRoot.innerHTML,/component-inspector/);
 const rail=fakeRoot.querySelectorAll('[data-rung-rail]').find(item=>item.dataset.rungRail===baseIds.at(-1));rail.click();assert.match(fakeRoot.innerHTML,/rung-selected/);assert.match(fakeRoot.innerHTML,/Selected rung options/);assert.doesNotMatch(fakeRoot.innerHTML,/component-inspector/);
 const blank={closest:selector=>selector==='[data-ladder-workspace]'||selector==='.editor-column'?{}:null};fakeRoot.handlers.get('click')({target:blank,preventDefault(){},stopPropagation(){}});assert.doesNotMatch(fakeRoot.innerHTML,/rung-options|component-inspector/);
 click('[data-action]','add-rung');circuit=JSON.parse(store.get('lltl-project-v1'));const rungA=circuit.rungs.at(-1).id;click('[data-action]','add-rung');circuit=JSON.parse(store.get('lltl-project-v1'));const rungB=circuit.rungs.at(-1).id;assert.deepEqual(circuit.rungs.at(-1).elements,[]);click('[data-add]','ton');circuit=JSON.parse(store.get('lltl-project-v1'));const timerId=circuit.rungs.at(-1).elements[0].id,timerTag=circuit.rungs.at(-1).elements[0].tag;assert.equal(circuit.rungs.at(-1).elements[0].type,'timer');const rungBData=structuredClone(circuit.rungs.at(-1));assert.equal((fakeRoot.innerHTML.match(/data-ladder-workspace/g)||[]).length,1);assert.equal((fakeRoot.innerHTML.match(/data-workspace-svg/g)||[]).length,1);assert.equal((fakeRoot.innerHTML.match(/class="rail-line shared-rail/g)||[]).length,2);assert.match(fakeRoot.innerHTML,new RegExp(`viewBox="0 0 900 ${(baseIds.length+2)*180}"`));
 const handle=fakeRoot.querySelectorAll('[data-rung-handle]').find(item=>item.dataset.rungHandle===rungA),downY=(baseIds.length*180)+88;assert.ok(handle);fakeRoot.handlers.get('pointerdown')({target:handle,button:0,pointerId:22,clientY:downY});fakeRoot.handlers.get('pointermove')({clientY:downY+180});fakeRoot.handlers.get('pointerup')({clientY:downY+180});circuit=JSON.parse(store.get('lltl-project-v1'));assert.deepEqual(circuit.rungs.map(rung=>rung.id),[...baseIds,rungB,rungA]);assert.equal((fakeRoot.innerHTML.match(/class="rail-line shared-rail/g)||[]).length,2);assert.match(fakeRoot.innerHTML,new RegExp(`viewBox="0 0 900 ${(baseIds.length+2)*180}"`));
 fakeRoot.querySelectorAll('[data-rung-wire]').find(item=>item.dataset.rungWire===rungB).click();assert.match(fakeRoot.innerHTML,/rung-options/);assert.doesNotMatch(fakeRoot.innerHTML,/component-inspector/);click('[data-action]','delete-rung');circuit=JSON.parse(store.get('lltl-project-v1'));assert.equal(circuit.rungs.some(rung=>rung.id===rungB),false);assert.equal(circuit.rungs.some(rung=>rung.elements.some(element=>element.id===timerId)),false);assert.deepEqual(circuit.tags,baseTags,'unrelated tag definitions are preserved');assert.ok(circuit.rungs.some(rung=>rung.id===rungA));assert.deepEqual(circuit.rungs.find(rung=>rung.id===baseIds[0]).elements,baseComponents);assert.equal(rungBData.elements[0].id,timerId);assert.ok(timerTag);
 const restored=appModule.loadProject();assert.deepEqual(restored.rungs,circuit.rungs);motor=fakeRoot.querySelectorAll('[data-select]').find(item=>item.dataset.select==='motor');motor.click();assert.match(fakeRoot.innerHTML,/Output Coil \(OTE\)/);assert.doesNotMatch(fakeRoot.innerHTML,/rung-options/);
});
