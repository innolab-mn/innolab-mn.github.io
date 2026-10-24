"use client";
import { useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Locale } from '@/lib/i18n';
const workflowUrl='https://github.com/innolab-mn/innolab-mn.github.io/actions/workflows/nextjs.yml';
type Run={id:number;status:string;conclusion:string|null;url:string};
export default function BuildControl({locale}:{locale:Locale}){
  const en=locale==='en';const inFlight=useRef(false);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  const [run,setRun]=useState<Run|null>(null);const [queued,setQueued]=useState(false);const [previous,setPrevious]=useState<number|null>(null);
  async function request(method:'GET'|'POST'){
    if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');setMessage('');
    try{
      const db=getSupabase();if(!db)throw new Error('not_configured');
      const {data,error}=await db.functions.invoke('trigger-build',{method,...(method==='POST'?{body:{}}:{})});
      if(error){const body=error.context instanceof Response?await error.context.json().catch(()=>null):null;
        if(body?.error==='already_running'){setRun(body.run);setQueued(false);setMessage(en?'A build is already running.':'Build аль хэдийн ажиллаж байна.');return;}
        throw new Error(body?.error||'unavailable');
      }
      if(method==='POST'){setPrevious(data.previousRunId??null);setRun(null);setQueued(true);setMessage(en?'Build requested. Deployment is not complete yet. Use Check status to follow progress.':'Build эхлүүлэх хүсэлт илгээлээ. Нийтлэлт хараахан дуусаагүй. Төлөв шалгах товчоор явцыг харна уу.');}
      else if(queued&&(!data.run||data.run.id===previous)){setMessage(en?'Waiting for GitHub to start the new build.':'GitHub шинэ build эхлүүлэхийг хүлээж байна.');}
      else{setRun(data.run);setQueued(false);if(!data.run)setMessage(en?'No builds found.':'Build олдсонгүй.');}
    }catch(err:any){const code=err?.message;
      setError(code==='github_not_configured'?(en?'Add GITHUB_ACTIONS_TOKEN in the server secrets first.':'Серверийн secrets-д GITHUB_ACTIONS_TOKEN тохируулна уу.'):
        code==='superadmin_required'?(en?'Superadmin access is required.':'Superadmin эрх шаардлагатай.'):
        code==='sign_in_required'?(en?'Sign in again to continue.':'Дахин нэвтэрнэ үү.'):
        code==='rate_limited'?(en?'Please wait a minute before requesting another build.':'Дахин build эхлүүлэхийн өмнө нэг минут хүлээнэ үү.'):
        (en?'Could not confirm the build request. Check its status before retrying.':'Build хүсэлт баталгаажсангүй. Дахин оролдохын өмнө төлөвийг шалгана уу.'));
    }finally{inFlight.current=false;setBusy(false);}
  }
  const result=run?.conclusion==='success'?(en?'Deployed successfully':'Амжилттай нийтлэгдсэн'):run?.conclusion==='failure'?(en?'Build failed':'Build амжилтгүй'):run?.conclusion==='cancelled'?(en?'Cancelled':'Цуцлагдсан'):(en?'Finished':'Дууссан');
  return <section className="order-card build-control" aria-labelledby="build-control-title">
    <p className="eyebrow">GITHUB ACTIONS / MAIN</p><h2 id="build-control-title">{en?'Build & publish website':'Сайт build хийж нийтлэх'}</h2>
    <p>{en?'Build the latest main branch and publish it to innolab.mn. Only superadmins can start a build.':'Main branch-ийн сүүлийн кодоор build хийж innolab.mn дээр нийтэлнэ. Зөвхөн superadmin эхлүүлэх эрхтэй.'}</p>
    <div className="actions"><button className="button" disabled={busy||queued||Boolean(run&&run.status!=='completed')} onClick={()=>void request('POST')}>{busy?(en?'Please wait…':'Түр хүлээнэ үү…'):(en?'Build & deploy':'Build / Нийтлэх')} ↗</button><button className="button button-outline" disabled={busy} onClick={()=>void request('GET')}>{en?'Check status':'Төлөв шалгах'}</button><a className="text-link" href={run?.url||workflowUrl} target="_blank" rel="noopener noreferrer">{en?'Detailed logs':'Дэлгэрэнгүй log'} ↗</a></div>
    <p role="status" aria-live="polite">{message}</p>{run&&<p role="status">{en?'Latest build':'Сүүлийн build'} #{run.id}: {run.status==='completed'?result:(en?'Queued / running':'Хүлээгдэж байна / ажиллаж байна')}</p>}{error&&<p className="auth-error-summary" role="alert">{error}</p>}
  </section>;
}
