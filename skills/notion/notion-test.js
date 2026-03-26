#!/usr/bin/env node
import 'dotenv/config';
import { Client } from '@notionhq/client';

const token = process.env.NOTION_TOKEN;
if (!token) { console.error('Missing NOTION_TOKEN'); process.exit(1); }
const notion = new Client({ auth: token });

(async ()=>{
  try{
    const res = await notion.search({ page_size: 1 });
    console.log(JSON.stringify({ ok: true, results: (res.results||[]).length }, null, 2));
  }catch(e){
    console.error(JSON.stringify({ ok: false, message: e.message }));
    process.exit(1);
  }
})();
