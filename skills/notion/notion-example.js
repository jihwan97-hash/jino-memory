#!/usr/bin/env node
import 'dotenv/config';
import { Client } from '@notionhq/client';
import fs from 'fs';

const args = process.argv.slice(2);
const opts = {};
for (let i=0;i<args.length;i++){
  if (args[i].startsWith('--') && i+1<args.length){
    opts[args[i].slice(2)]=args[i+1]; i++;
  }
}

const token = process.env.NOTION_TOKEN;
if (!token){
  console.error('Missing NOTION_TOKEN env var'); process.exit(1);
}
const notion = new Client({ auth: token });

async function queryDatabase(databaseId){
  const res = await notion.databases.query({ database_id: databaseId });
  console.log(JSON.stringify(res, null, 2));
}

async function createPage(parentId, title, content){
  const res = await notion.pages.create({
    parent: { database_id: parentId },
    properties: {
      Name: { title: [{ text: { content: title } }] }
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { text: [{ type: 'text', text: { content: content } }] }
      }
    ]
  });
  console.log(JSON.stringify(res, null, 2));
}

(async ()=>{
  try{
    if (opts.action==='query' && opts.database) await queryDatabase(opts.database);
    else if (opts.action==='create' && opts.parent && opts.title) await createPage(opts.parent, opts.title, opts.content||'');
    else console.error('Usage: --action query|create --database ID | --action create --parent ID --title "..." --content "..."');
  }catch(e){
    console.error(e.message);
    process.exit(1);
  }
})();
