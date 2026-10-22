import {agents,tasks,type AgentId,type SuiteId} from './catalog.ts';
export type Check={name:string;passed:boolean;input:unknown[];expected:unknown;actual:unknown;error?:string};
export type TaskResult={taskId:string;passed:number;total:number;durationMs:number;checks:Check[]};
export type AgentResult={agentId:AgentId;name:string;passed:number;total:number;durationMs:number;tasks:TaskResult[]};
export type Run={id:string;name:string;suite:SuiteId;createdAt:string;source:'measured'|'imported';results:AgentResult[]};
type Candidate=(...args:any[])=>unknown;
const implementations:Record<AgentId,Record<string,Candidate>>={
 atlas:{
 unique:a=>[...new Set<number>(a)],palindrome:s=>{const a=s.toLowerCase().replace(/[^a-z0-9]/g,'');return a===[...a].reverse().join('')},
 chunks:(a,n)=>Number.isInteger(n)&&n>0?Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n)):[],
 sequence:a=>{const set=new Set<number>(a);let best=0;for(const n of set)if(!set.has(n-1)){let len=1;while(set.has(n+len))len++;best=Math.max(best,len)}return best},
 group:a=>{const out=Object.create(null);for(const o of a)out[o.customer]=(out[o.customer]??0)+o.cents;return Object.fromEntries(Object.entries(out))},
 sort:a=>[...a].sort((a,b)=>a.priority-b.priority),
 merge:(a,b)=>{const map=new Map<string,number>();for(const x of [...a,...b])map.set(x.sku,(map.get(x.sku)??0)+x.qty);return [...map].sort(([a],[b])=>a.localeCompare(b)).map(([sku,qty])=>({sku,qty}))},
 flatten:a=>a.flat(Infinity),parse:(s,f)=>{try{return JSON.parse(s)}catch{return f}},
 clamp:(v,a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b);return typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):lo},
 email:s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),retry:(f,r)=>({attempts:Math.min(f+1,r+1),ok:f<=r}),
 },
 swift:{
 unique:a=>[...new Set<number>(a)],palindrome:s=>s.toLowerCase()===[...s.toLowerCase()].reverse().join(''),
 chunks:(a,n)=>n>0?Array.from({length:Math.floor(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n)):[],
 sequence:a=>{const b=[...a].sort((a,b)=>a-b);let max=0,len=0,prev:number|undefined;for(const n of b){len=prev!==undefined&&n===prev+1?len+1:1;max=Math.max(max,len);prev=n}return max},
 group:a=>{const o:Record<string,number>={};for(const x of a)o[x.customer]=(o[x.customer]||0)+x.cents;return o},
 sort:a=>[...a].sort((a,b)=>a.priority-b.priority),merge:(a,b)=>[...a,...b].sort((a,b)=>a.sku.localeCompare(b.sku)),
 flatten:a=>a.flat(),parse:(s,f)=>{try{return JSON.parse(s)||f}catch{return f}},clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),
 email:s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),retry:(f,r)=>({attempts:Math.min(f+1,r+1),ok:f<=r}),
 },
 baseline:{
 unique:a=>[...new Set<number>(a)].sort((a,b)=>a-b),palindrome:s=>s===[...s].reverse().join(''),chunks:(a,n)=>n>0?[a.slice(0,n)]:[],
 sequence:a=>a.length,group:a=>Object.fromEntries(a.map((x:any)=>[x.customer,x.cents])),sort:a=>[...a].sort((a,b)=>String(a.priority).localeCompare(String(b.priority))),
 merge:(a,b)=>[...a,...b],flatten:a=>a.flat().filter(Boolean),parse:s=>JSON.parse(s),clamp:(v,a,b)=>Math.max(a,v),email:s=>s.includes('@'),retry:(f,r)=>({attempts:Math.min(f+1,r),ok:f<r}),
 },
};
const canonical=(v:unknown):string=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
export function evaluate(suite:SuiteId,ids:AgentId[],name='Untitled evaluation'):Run{
 const selected=tasks.filter(t=>t.category===suite);if(!selected.length||ids.length<1||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!agents.some(a=>a.id===id)))throw new Error('Select a valid suite and one to three distinct agents.');
 return {id:crypto.randomUUID(),name:name.trim().slice(0,80)||'Untitled evaluation',suite,createdAt:new Date().toISOString(),source:'measured',results:ids.map(agentId=>{
 const results=selected.map(task=>{const start=performance.now();const checks=task.tests.map(test=>{try{const actual=implementations[agentId][task.id](...structuredClone(test.input));return {...test,actual:actual??null,passed:canonical(actual)===canonical(test.expected)}}catch(e){return {...test,actual:null,passed:false,error:e instanceof Error?e.message:'Execution failed'}}});return {taskId:task.id,passed:checks.filter(c=>c.passed).length,total:checks.length,durationMs:Math.max(0,performance.now()-start),checks}});
 return {agentId,name:agents.find(a=>a.id===agentId)!.name,passed:results.reduce((s,t)=>s+t.passed,0),total:results.reduce((s,t)=>s+t.total,0),durationMs:results.reduce((s,t)=>s+t.durationMs,0),tasks:results};})};
}
export function parseRun(value:unknown):Run{
 if(!value||typeof value!=='object')throw new Error('Expected a run object.');
 const v=value as Run;if(!['core','data','reliability'].includes(v.suite)||typeof v.name!=='string'||v.name.length>80||!Array.isArray(v.results)||v.results.length<1||v.results.length>3||!Number.isFinite(Date.parse(v.createdAt)))throw new Error('Invalid run metadata.');
 if(new Set(v.results.map(a=>a.agentId)).size!==v.results.length)throw new Error('Duplicate agents.');
 for(const a of v.results){if(typeof a.name!=='string'||!a.name.trim()||a.name.length>80||!agents.some(x=>x.id===a.agentId)||!Array.isArray(a.tasks)||a.tasks.length!==4||!Number.isFinite(a.durationMs)||a.durationMs<0)throw new Error('Invalid agent results.');const allowed=tasks.filter(t=>t.category===v.suite).map(t=>t.id);if(new Set(a.tasks.map(t=>t.taskId)).size!==4)throw new Error('Duplicate tasks.');
 for(const t of a.tasks){if(!allowed.includes(t.taskId)||!Array.isArray(t.checks)||t.checks.length!==4||!Number.isFinite(t.durationMs)||t.durationMs<0||t.checks.some(c=>typeof c.name!=='string'||typeof c.passed!=='boolean'||!Array.isArray(c.input)||(c.error!==undefined&&typeof c.error!=='string')))throw new Error('Invalid task checks.');if(t.total!==t.checks.length||t.passed!==t.checks.filter(c=>c.passed).length)throw new Error('Task totals do not match checks.');}
 if(a.total!==a.tasks.reduce((s,t)=>s+t.total,0)||a.passed!==a.tasks.reduce((s,t)=>s+t.passed,0))throw new Error('Agent totals do not match tasks.');}
 return {...v,id:crypto.randomUUID(),name:v.name.trim()||'Imported evaluation',source:'imported'};
}
