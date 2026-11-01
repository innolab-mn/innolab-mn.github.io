import assert from 'node:assert/strict';
import { READING_RANKS, readingRank, readingRankProgress, readingRankPromotion } from '../public/fast_read/reading-logic.js';

assert.equal(READING_RANKS.length,9);
assert.equal(new Set(READING_RANKS.map(rank=>rank.name)).size,9);
assert.equal(readingRank(null),null);
assert.equal(readingRank(NaN),null);
for (let i=0;i<READING_RANKS.length;i++) {
  assert.equal(readingRank(READING_RANKS[i].min),i);
  if(i>0) assert.equal(readingRank(READING_RANKS[i].min-.01),i-1);
}
assert.deepEqual(readingRankProgress([]),{best:null,average:null});
const record=(words,elapsedMs)=>({words,elapsedMs});
assert.deepEqual(readingRankProgress([record(100,9999)]),{best:null,average:null});
assert.deepEqual(readingRankProgress([record(180,60000),record(20,60000)]),{best:8,average:100});
assert.deepEqual(readingRankProgress([record(50,60000),record(150,60000)]),{best:4,average:100});
assert.deepEqual(readingRankProgress([record(50,60000),record(100,1000)]),{best:1,average:50});
assert.equal(readingRankProgress([record(30,60000),record(210,60000)]).best,5);
assert.equal(readingRankPromotion([],record(20,60000)),0);
assert.equal(readingRankPromotion([],record(20,1000)),null);
assert.equal(readingRankPromotion([record(40,60000)],record(80,60000)),2);
assert.equal(readingRankPromotion([record(180,60000),record(20,60000)],record(200,60000)),null);
console.log('Reading ranks: nine boundaries, weighted progression, short attempts and retained achievements verified.');
