import Studio from '@/components/Studio';
import {evaluate} from '@/lib/engine';
export const dynamic='force-dynamic';
export default function Page(){return <Studio initial={evaluate('core',['atlas','swift','baseline'],'Core reasoning · reference comparison')}/>}
