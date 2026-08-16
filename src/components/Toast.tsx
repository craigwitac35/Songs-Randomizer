import { CheckCircle2 } from 'lucide-react'; export default function Toast({message}:{message:string}){return message?<div className="toast"><CheckCircle2 size={18}/>{message}</div>:null}
