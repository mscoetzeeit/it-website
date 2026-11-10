const fs=require('fs');
const html=fs.readFileSync('src-old.html','utf8');
const S=eval(html.match(/const S = \[[\s\S]*?\n\];/)[0].replace('const S = ',''));
global.LONG={};global.NEW={};
for(let i=1;i<=11;i++) eval(fs.readFileSync(`long-${i}.js`,'utf8'));
const AFTER={
"Enoch walks with God":"Cain and Abel","God's promise under the stars":"Lot chooses the plain","Isaac is born":"Sodom and Gomorrah","Esau sells his birthright":"A bride for Isaac","Joseph in Potiphar's house and prison":"Joseph sold by his brothers","Joseph interprets Pharaoh's dreams":"Joseph in Potiphar's house and prison",
"Moses flees to Midian":"Baby Moses in a basket","Water from the rock":"Manna and quail","Jethro's advice":"Hands held up","The twelve spies":"The golden calf","Moses sees the promised land":"Balaam's donkey",
"Crossing the Jordan":"Rahab and the spies","Caleb asks for his mountain":"The sun stands still","Choose this day":"Caleb asks for his mountain","Ehud the left-handed judge":"Choose this day",
"The ark is captured":"God calls Samuel","David brings the ark to Jerusalem":"Abigail","God's promise to David":"David brings the ark to Jerusalem","Solomon dedicates the temple":"Solomon asks for wisdom",
"Jehoshaphat's singers":"Naboth's vineyard","Four lepers at the gate":"Horses and chariots of fire","Joash the boy king":"Four lepers at the gate","Hosea and Gomer":"Jonah","Hezekiah's fifteen extra years":"Hezekiah spreads out the letter","Jeremiah in the cistern":"The potter's house",
"Nebuchadnezzar's dream":"Daniel's diet","Nebuchadnezzar humbled":"The fiery furnace","The exiles return":"Ezekiel and the dry bones","Esther becomes queen":"The exiles return",
"Jesus is baptised":"The boy Jesus in the temple","Jesus is tempted":"Jesus is baptised","The great catch of fish":"The woman at the well","The centurion's faith":"Through the roof","The woman who anointed Jesus' feet":"The centurion's faith","The man called Legion":"Calming the storm","The transfiguration":"Jairus and the woman who touched His cloak","The good Samaritan":"The transfiguration","The lost sheep and the lost coin":"The good Samaritan","The ten lepers":"Mary and Martha","The rich young man":"The ten lepers","The triumphal entry":"Blind Bartimaeus","The widow's two coins":"The triumphal entry","Jesus washes the disciples' feet":"The widow's two coins","Thomas believes":"The road to Emmaus","The great commission":"Breakfast on the beach",
"The church at Antioch":"Peter and Cornelius","Lydia opens her home":"Peter's escape from prison"};
let list=S.map(s=>({e:s[0],t:s[1],r:s[2],p:s[3],s:s[4],w:s[5],q:s[6]}));
// Isaiah's vision belongs before Hezekiah
const iv=list.findIndex(x=>x.t==="Isaiah's vision");const [isa]=list.splice(iv,1);list.splice(list.findIndex(x=>x.t==="Hezekiah spreads out the letter"),0,isa);
for(const [t,a] of Object.entries(AFTER)){const n=NEW[t];if(!n)throw 'no new '+t;const i=list.findIndex(x=>x.t===a);if(i<0)throw 'no anchor '+a;if(list[i].e!==n[0])throw 'era mismatch '+t;
 list.splice(i+1,0,{e:n[0],t,r:n[1],p:n[2],s:n[3],w:n[4],q:n[5]});}
const left=Object.keys(NEW).filter(t=>!AFTER[t]);if(left.length)throw 'unplaced '+left;
const slugs=new Set();
for(const x of list){x.l=LONG[x.t];if(!x.l)throw 'no long '+x.t;x.id='story-'+x.t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(slugs.has(x.id))throw 'dup '+x.id;slugs.add(x.id);}
// era order must be contiguous
const order='bpejkdxgc';let last=0;for(const x of list){const i=order.indexOf(x.e);if(i<last)throw 'era order '+x.t;last=i;}
fs.writeFileSync('data.js','const STORIES = '+JSON.stringify(list)+';\n');
console.log(list.length,'stories', (fs.statSync('data.js').size/1024|0)+'KB');
const refs=new Set();list.forEach(x=>x.r.split(';').forEach(p=>{const m=p.trim().match(/^((?:[123] )?[A-Za-z]+) /);if(m)refs.add(m[1]);}));console.log([...refs].join(', '));
