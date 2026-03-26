#!/usr/bin/env node
import 'dotenv/config';
import { Client } from '@notionhq/client';
const args = process.argv.slice(2);
const opts = {};
for (let i=0;i<args.length;i++){ if (args[i].startsWith('--') && i+1<args.length){ opts[args[i].slice(2)]=args[i+1]; i++; }}
const token = process.env.NOTION_TOKEN; if(!token){ console.error('Missing NOTION_TOKEN'); process.exit(1); }
const notion = new Client({ auth: token });
if(!opts.id){ console.error('Usage: --id PAGE_ID'); process.exit(1); }
(async()=>{
 try{
   const res = await notion.pages.update({ page_id: opts.id, archived: true });
   console.log(JSON.stringify({ ok: true, id: res.id, archived: res.archived }, null, 2));
 }catch(e){ console.error(JSON.stringify({ ok:false, message: e.message })); process.exit(1); }
})();
