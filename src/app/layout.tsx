import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Agent Bench · Evaluation Studio',description:'Compare coding-task implementations, inspect assertion failures and keep reproducible evaluation records.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.classList.toggle('dark',localStorage.getItem('agent-bench.theme')!=='light')}catch(e){}"}}/></head><body>{children}</body></html>}
