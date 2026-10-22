import { NextResponse } from 'next/server';
import { evaluate } from '@/lib/engine';
export const runtime='nodejs';
export async function POST(request:Request){
 try{const body=await request.text();if(body.length>4096)return NextResponse.json({error:'Request is too large.'},{status:413});const data=JSON.parse(body);if(typeof data.name!=='string'||!Array.isArray(data.agents)||typeof data.suite!=='string')throw Error('Provide a name, suite and agents.');const run=evaluate(data.suite,data.agents,data.name);return NextResponse.json(run,{headers:{'Cache-Control':'no-store'}})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to evaluate.'},{status:400})}
}
