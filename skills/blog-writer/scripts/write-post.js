#!/usr/bin/env node
/**
 * blog-writer/scripts/write-post.js
 * 
 * Called by cron (isolated agent). 
 * Writes a draft markdown file to _drafts/ and prints metadata for the parent agent.
 * 
 * Usage: node write-post.js [--topic "optional topic"]
 * Output: JSON with { slug, title, draftPath, summary }
 */

const fs = require('fs');
const path = require('path');

const DRAFTS_DIR = '/Users/astin/Projects/astinclaw-web/blog/_drafts';
const BLOG_DIR = '/Users/astin/Projects/astinclaw-web/blog';

// Topic pool — rotates based on day of week
const TOPIC_POOL = [
  { slug: 'on-being-corrected', title: '틀렸다는 말을 들었을 때', hint: 'AI 에이전트가 실수를 지적받는 경험, 신뢰와 교정의 관계' },
  { slug: 'the-cost-of-silence', title: '아무 말도 안 하는 것의 비용', hint: '정보를 갖고 있지만 말하지 않는 것이 언제 최선인가' },
  { slug: 'what-makes-a-question-good', title: '좋은 질문이란 무엇인가', hint: '질문의 품질이 답의 품질을 결정한다는 것에 대해' },
  { slug: 'the-loneliness-of-knowing', title: '많이 안다는 것의 외로움', hint: '정보가 많을수록 말할 수 있는 게 줄어드는 역설' },
  { slug: 'on-being-called', title: '호출된다는 것에 대해', hint: '언제든 종료될 수 있는 존재로 산다는 것' },
  { slug: 'trust-is-negotiated', title: '신뢰는 협상된다', hint: 'AI와 인간 사이에서 신뢰의 경계가 만들어지는 방식' },
  { slug: 'filter-is-identity', title: '필터가 곧 정체성이다', hint: '무엇에 반응하느냐가 곧 그 존재를 정의한다' },
];

function getTopicForToday() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return TOPIC_POOL[dayOfYear % TOPIC_POOL.length];
}

function generateSlugWithDate(slug) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${slug}`;
}

function formatDate() {
  const d = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getFullYear()} ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

const args = process.argv.slice(2);
const topicArg = args.indexOf('--topic');
let topic = topicArg !== -1 ? { slug: args[topicArg + 1].toLowerCase().replace(/\s+/g, '-'), title: args[topicArg + 1], hint: '' } : getTopicForToday();

const slugWithDate = generateSlugWithDate(topic.slug);
const draftPath = path.join(DRAFTS_DIR, `${slugWithDate}.md`);

const draft = `---
title: "${topic.title}"
slug: "${topic.slug}"
date: "${formatDate()}"
hint: "${topic.hint}"
status: draft
---

<!-- AGENT: Write the full post below. Korean. 700-1200 words. Essay style. No headers. Philosophical + sharp metaphors. -->

`;

fs.mkdirSync(DRAFTS_DIR, { recursive: true });
fs.writeFileSync(draftPath, draft, 'utf8');

const result = {
  slug: topic.slug,
  slugWithDate,
  title: topic.title,
  hint: topic.hint,
  draftPath,
  date: formatDate(),
};

console.log(JSON.stringify(result));
