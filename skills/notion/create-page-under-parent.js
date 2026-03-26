#!/usr/bin/env node
import 'dotenv/config';
import { Client } from '@notionhq/client';

const args = process.argv.slice(2);
const opts = {};
for (let i=0;i<args.length;i++){
  if (args[i].startsWith('--') && i+1<args.length){
    opts[args[i].slice(2)] = args[i+1]; i++; }
}
const token = process.env.NOTION_TOKEN;
if(!token){ console.error('Missing NOTION_TOKEN'); process.exit(1); }
const notion = new Client({ auth: token });
if(!opts.parent || !opts.title){ console.error('Usage: --parent PARENT_PAGE_ID --title "Title" [--content "..."]'); process.exit(1); }
(async()=>{
  try{
    const res = await notion.pages.create({
      parent: { page_id: opts.parent },
      properties: {
        title: [ { type: 'text', text: { content: opts.title } } ]
      },
      children: opts.content ? [ { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: opts.content } }] } } ] : []
    });
    console.log(JSON.stringify({ ok: true, id: res.id, url: res.url }, null, 2));
  }catch(e){ console.error(JSON.stringify({ ok:false, message: e.message })); process.exit(1); }
})();
