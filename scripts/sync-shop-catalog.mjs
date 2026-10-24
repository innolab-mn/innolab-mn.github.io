import {writeFile} from 'node:fs/promises';
const {CONTENTFUL_SPACE_ID:space,CONTENTFUL_ACCESS_TOKEN:token,SUPABASE_SERVICE_ROLE_KEY:secret,NEXT_PUBLIC_SUPABASE_URL:url}=process.env;
if(!space||!token)throw new Error('Contentful configuration missing');
if(!process.argv.includes('--sql')&&!secret){console.warn('Shop catalog sync skipped: SUPABASE_SERVICE_ROLE_KEY is not configured. Checkout rejects mismatched prices until the catalog is synchronized.');process.exit(0);}
const response=await fetch(`https://graphql.contentful.com/content/v1/spaces/${space}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:'{ productCollection(limit:1000, where:{slug_exists:true}) { total items { slug title price imageCollection(limit:1){items{url}} } } }'})});
if(!response.ok)throw new Error('Catalog fetch failed');const result=await response.json();
const collection=result.data?.productCollection;
if(result.errors||!collection||collection.total>1000)throw new Error('Incomplete catalog; refusing to synchronize');
const rows=collection.items.filter(p=>p&&p.slug&&p.title&&Number.isFinite(Number(p.price))&&Number(p.price)>0).map(p=>({slug:p.slug,title:p.title,price:Number(p.price),image:p.imageCollection?.items?.[0]?.url||null,active:true}));
if(!rows.length)throw new Error('No priced products; refusing to overwrite the catalog');
if(process.argv.includes('--sql')){
  const literal=value=>"'"+String(value).replaceAll("'","''")+"'";
  const sql='-- Generated from the existing published Contentful products.\nbegin;\nupdate public.shop_catalog set active=false;\n'+rows.map(p=>`insert into public.shop_catalog(slug,title,price,image,active) values(${literal(p.slug)},${literal(p.title)},${p.price},${p.image?literal(p.image):'null'},true) on conflict(slug) do update set title=excluded.title,price=excluded.price,image=excluded.image,active=true,updated_at=now();`).join('\n')+'\ncommit;\n';
  await writeFile(new URL('../supabase/catalog-seed.sql',import.meta.url),sql);console.log(`Prepared ${rows.length} published priced products.`);
}else{
  // The service key is server-only. The RPC updates the complete catalog atomically.
  if(!url)throw new Error('Supabase URL missing');
  const sync=await fetch(url+'/rest/v1/rpc/sync_shop_catalog',{method:'POST',headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({products:rows})});
  if(!sync.ok)throw new Error(`Shop catalog sync failed (${sync.status})`);
  console.log(`Synchronized ${rows.length} priced products.`);
}
