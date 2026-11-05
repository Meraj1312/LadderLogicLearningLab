export const emptyMemory=()=>({timers:{},counters:{},edges:{},values:{}});
const bool=v=>Boolean(v);
const num=v=>typeof v==='number'?v:Number(Boolean(v));

function runElements(elements,start,ctx,path=''){
 let power=start;
 for(const e of elements){
  const inputPower=power;let detail='',condition=null,state={};
  switch(e.type){
   case 'contact':{const value=bool(ctx.tags[e.tag]);condition=e.mode==='no'?value:!value;power=inputPower&&condition;detail=`${e.tag} is ${value?'ON':'OFF'}; ${e.mode.toUpperCase()} ${condition?'conducts':'blocks'}`;state={tag:e.tag,tagValue:value,contactMode:e.mode};break;}
   case 'branch':{const values=e.paths.map((p,i)=>p.length>0&&runElements(p,inputPower,ctx,`${e.id}.${i}`));condition=values.some(Boolean);power=condition;detail=`Parallel paths: ${values.filter(Boolean).length}/${values.length} conducting`;state={pathResults:values};break;}
   case 'compare':{const leftValue=num(ctx.tags[e.left]),rightValue=typeof e.right==='string'?num(ctx.tags[e.right]):e.right;condition={gt:leftValue>rightValue,lt:leftValue<rightValue,gte:leftValue>=rightValue,lte:leftValue<=rightValue,eq:leftValue===rightValue,neq:leftValue!==rightValue}[e.op]??false;power=inputPower&&condition;if(e.dest)ctx.tags[e.dest]=power;const operator={gt:'>',lt:'<',gte:'≥',lte:'≤',eq:'=',neq:'≠'}[e.op]||e.op;const summary=`${leftValue} ${operator} ${rightValue} · ${condition?'TRUE':'FALSE'}`;detail=`${e.left} ${operator} ${e.right} (${summary}); path ${power?'continues':'blocked'}`;state={left:e.left,leftValue,right:e.right,rightValue,operator,result:power,comparison:condition,destination:e.dest||null,summary};break;}
   case 'edge':{const signal=e.tag?bool(ctx.tags[e.tag]):inputPower;const previous=ctx.memory.edges[e.id]??false;condition=e.mode==='rising'?signal&&!previous:!signal&&previous;power=condition;ctx.memory.edges[e.id]=signal;detail=`${e.tag||'Rung power'} ${e.mode} edge ${condition?'detected':'not detected'}`;state={tag:e.tag||null,previousInput:previous,currentInput:signal,pulse:condition};break;}
   case 'timer':{
    const m=ctx.memory.timers[e.id]??{elapsedMs:0,q:false,prevIn:false,active:false,tag:e.tag};const before=m.q;
    if(e.mode==='ton'){m.elapsedMs=inputPower?Math.min(e.presetMs,m.elapsedMs+ctx.dtMs):0;m.q=inputPower&&m.elapsedMs>=e.presetMs;m.active=inputPower&&!m.q;}
    if(e.mode==='rto'){if(inputPower)m.elapsedMs=Math.min(e.presetMs,m.elapsedMs+ctx.dtMs);m.q=m.elapsedMs>=e.presetMs;m.active=inputPower&&!m.q;}
    if(e.mode==='tof'){if(inputPower){m.elapsedMs=0;m.q=true;m.active=false;}else if(m.q){m.active=true;m.elapsedMs=Math.min(e.presetMs,m.elapsedMs+ctx.dtMs);if(m.elapsedMs>=e.presetMs){m.q=false;m.active=false;}}else m.active=false;}
    if(e.mode==='tp'){if(inputPower&&!m.prevIn&&!m.active){m.active=true;m.elapsedMs=0;m.q=e.presetMs>0;}if(m.active&&m.elapsedMs<e.presetMs){m.elapsedMs=Math.min(e.presetMs,m.elapsedMs+ctx.dtMs);m.q=m.elapsedMs<e.presetMs;}if(m.elapsedMs>=e.presetMs){m.active=false;m.q=false;}}
    m.prevIn=inputPower;ctx.memory.timers[e.id]=m;ctx.tags[`${e.tag}.EN`]=inputPower;ctx.tags[`${e.tag}.TT`]=m.active;ctx.tags[`${e.tag}.Q`]=m.q;ctx.tags[`${e.tag}.ACC`]=m.elapsedMs;ctx.tags[`${e.tag}.ET`]=m.elapsedMs;ctx.tags[`${e.tag}.PRE`]=e.presetMs;condition=inputPower;power=inputPower;const phase=!inputPower?'IDLE':m.q?'DONE':m.active?'TIMING':'ENABLED';detail=`${e.mode.toUpperCase()} ${phase}: ET ${m.elapsedMs}/${e.presetMs} ms; Q ${before?'ON':'OFF'} → ${m.q?'ON':'OFF'}`;state={enabled:inputPower,timing:m.active,done:m.q,elapsedMs:m.elapsedMs,presetMs:e.presetMs,timerPhase:phase,previousQ:before};break;
   }
   case 'counter':{const m=ctx.memory.counters[e.id]??{acc:e.mode==='ctd'?e.preset:0,prevIn:false,tag:e.tag};if(inputPower&&!m.prevIn)m.acc+=e.mode==='ctu'?1:-1;m.prevIn=inputPower;ctx.memory.counters[e.id]=m;const done=e.mode==='ctu'?m.acc>=e.preset:m.acc<=0;ctx.tags[`${e.tag}.ACC`]=m.acc;ctx.tags[`${e.tag}.PRE`]=e.preset;ctx.tags[`${e.tag}.Q`]=done;condition=inputPower;power=inputPower;detail=`${e.mode.toUpperCase()} ACC ${m.acc}, PRE ${e.preset}; ${done?'done':'counting'}`;state={accumulator:m.acc,preset:e.preset,done,counterMode:e.mode};break;}
   case 'reset':{if(inputPower){for(const m of Object.values(ctx.memory.counters))if(m.tag===e.target){m.acc=0;ctx.tags[`${m.tag}.ACC`]=0;ctx.tags[`${m.tag}.Q`]=false;}for(const m of Object.values(ctx.memory.timers))if(m.tag===e.target){m.elapsedMs=0;m.q=false;m.active=false;ctx.tags[`${m.tag}.ACC`]=0;ctx.tags[`${m.tag}.ET`]=0;ctx.tags[`${m.tag}.Q`]=false;}}condition=inputPower;power=inputPower;detail=`RES ${e.target} ${inputPower?'cleared':'unchanged'}`;state={target:e.target,reset:inputPower};break;}
   case 'coil':{if(e.mode==='ote')ctx.tags[e.tag]=inputPower;else if(inputPower)ctx.tags[e.tag]=e.mode==='otl';condition=inputPower;power=inputPower;detail=`${e.mode.toUpperCase()} ${e.tag} ${inputPower?'writes':'holds'} ${ctx.tags[e.tag]}`;state={outputValue:bool(ctx.tags[e.tag]),coilMode:e.mode,outputTag:e.tag};break;}
   case 'math':{const leftValue=num(ctx.tags[e.left]),rightValue=typeof e.right==='string'?num(ctx.tags[e.right]):e.right;let value=leftValue;if(e.op==='add')value=leftValue+rightValue;if(e.op==='sub')value=leftValue-rightValue;if(e.op==='mul')value=leftValue*rightValue;if(e.op==='div'){if(rightValue===0){ctx.diagnostics.push(`${e.id}: division by zero; ${e.dest} unchanged`);detail='Division by zero';condition=inputPower;power=inputPower;break;}value=leftValue/rightValue;}condition=inputPower;if(inputPower)ctx.tags[e.dest]=e.op==='move'?ctx.tags[e.left]:value;power=inputPower;detail=`${e.op.toUpperCase()} writes ${ctx.tags[e.dest]}`;state={left:e.left,leftValue,right:e.right,rightValue,destination:e.dest,result:ctx.tags[e.dest]};break;}
   default:ctx.diagnostics.push(`Unknown instruction type: ${e.type}`);power=false;condition=false;detail=`Unknown instruction ${e.type}`;
  }
  ctx.trace.push({rungId:ctx.rungId,elementId:path?`${path}/${e.id}`:e.id,inputPower,outputPower:power,condition,detail,...state});
 }
 return power;
}
function flatten(elements){return elements.flatMap(e=>e.type==='branch'?[e,...e.paths.flatMap(flatten)]:[e]);}
function programOwnedTags(circuit){const names=new Set();for(const rung of circuit.rungs)for(const e of flatten(rung.elements)){if(e.type==='coil')names.add(e.tag);if(e.type==='timer')for(const suffix of ['EN','TT','Q','ACC','ET','PRE'])names.add(`${e.tag}.${suffix}`);if(e.type==='counter')for(const suffix of ['Q','ACC','PRE'])names.add(`${e.tag}.${suffix}`);if(e.type==='math'||e.type==='compare')if(e.dest)names.add(e.dest);}return names;}

/** Run one deterministic scan. The input circuit is never mutated. */
export function scan(circuit,prior=emptyMemory(),dtMs=0){
 if(!Number.isFinite(dtMs)||dtMs<0)throw new RangeError('dtMs must be a finite non-negative number');
 const memory={...emptyMemory(),...structuredClone(prior)};memory.timers??={};memory.counters??={};memory.edges??={};memory.values??={};
 const owned=programOwnedTags(circuit),inputNames=new Set(circuit.inputTags||Object.keys(circuit.tags).filter(k=>!owned.has(k)));
 const tags={...circuit.tags};for(const [key,value] of Object.entries(memory.values))if(!inputNames.has(key))tags[key]=value;
 const trace=[],diagnostics=[],writers=new Map();
 for(const rung of circuit.rungs){const ctx={tags,memory,dtMs,trace,diagnostics,rungId:rung.id};runElements(rung.elements,true,ctx);for(const e of flatten(rung.elements))if(e.type==='coil'){const old=writers.get(e.tag);if(old)diagnostics.push(`${e.tag} written by ${old} and ${e.id}; later instruction wins`);writers.set(e.tag,e.id);}}
 memory.values={...tags};return {tags,memory,trace,diagnostics};
}
