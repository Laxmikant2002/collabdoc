import assert from 'node:assert/strict';
import test from 'node:test';
import { parseUploadedFile } from '../src/services/storage';

test('imports Markdown as rich text while preserving headings and lists', async () => {
  const file = new File(
    ['# Launch plan\n\n- Draft brief\n- Review with team'],
    'launch-plan.md',
    { type: 'text/markdown' },
  );

  const result = await parseUploadedFile(file);

  assert.equal(result.title, 'launch-plan');
  assert.match(result.html, /<h1[^>]*>Launch plan<\/h1>/);
  assert.match(result.html, /<li>Draft brief<\/li>/);
  assert.equal(result.rawText, '# Launch plan\n\n- Draft brief\n- Review with team');
});

test('imports plain text as escaped paragraphs', async () => {
  const file = new File(['First paragraph\n\n<script>alert("x")</script>'], 'notes.txt', {
    type: 'text/plain',
  });

  const result = await parseUploadedFile(file);

  assert.equal(result.title, 'notes');
  assert.match(result.html, /<p>First paragraph<\/p>/);
  assert.match(result.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(result.html, /<script>/);
});
