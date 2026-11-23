import { mkdirSync,readdirSync,readFileSync,writeFileSync } from 'node:fs';import { join } from 'node:path';
const I=process.env.MAKEFUN_INPUT_DIR ?? '/input',O=process.env.MAKEFUN_OUTPUT_DIR ?? '/output',enc=new TextEncoder();
const OPS=new Map([[0,[0,0,0]],[1,[1,0,1]],[2,[4,0,1]],[3,[0,1,0]],[4,[0,1,2]],[5,[0,2,2]],[6,[0,2,3]],[7,[0,3,3]],[16,[0,2,1]],[17,[0,2,1]],[18,[0,2,1]],[19,[0,2,1]],[20,[0,2,1]],[21,[0,2,1]],[22,[0,2,1]],[23,[0,1,1]],[24,[0,2,1]],[25,[0,2,1]],[26,[0,2,1]],[27,[0,1,1]],[28,[0,2,1]],[29,[0,2,1]],[30,[0,2,1]],[32,[0,2,1]],[33,[0,2,1]],[34,[0,2,1]],[48,[2,0,0]],[49,[2,1,0]],[50,[2,1,0]],[51,[2,0,0]],[52,[0,0,0]],[64,[0,1,1]],[65,[0,2,0]],[80,[0,1,0]],[81,[0,1,0]],[82,[0,0,1]],[83,[0,1,0]]]);
function run(p,input) {
const n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),out=new Uint8Array(65536),done=e=>({out:out.slice(0,olen),exit:e});let sp=0,csp=0,olen=0,ip=0,pc=0,steps=0;
for (;;) {
if (steps===1e6) return done(10);if (pc < 0||pc>=n) return done(9);
const code=p[pc],op=OPS.get(code);if (!op) return done(5);const imm=op[0];if (pc+imm>=n) return done(9);steps++;
const nx=pc+1+imm;if (sp < op[1]) return done(2);if (sp-op[1]+op[2] > 256) return done(3);pc=nx;
let b,a,r,t,rel,v,bytes;switch (code) {
case 0:return done(0);case 1:D[sp++]=p[nx-1]<<24>>24;break;case 2:D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
case 3:sp--;break;case 4:D[sp]=D[sp-1];sp++;break;case 5:t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;break;
case 6:D[sp]=D[sp-2];sp++;break;case 7:a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:b=D[sp-1];a=D[sp-2];
if ((code===19||code===20||code===21||code===22)&&b===0) return done(4);
r=code===16?a+b|0:code===17?a-b|0:code===18?Math.imul(a,b):code===19?(a===-2147483648&&b===-1?a:a/b|0):code===20?(b===-1?0:a%b|0):code===21?Math.floor((a>>>0)/(b>>>0))|0:(a>>>0)%(b>>>0)|0;D[sp-2]=r;sp--;break;
case 23:D[sp-1]=-D[sp-1]|0;break;case 24:D[sp-2]&=D[sp-1];sp--;break;case 25:D[sp-2]|=D[sp-1];sp--;break;case 26:D[sp-2]^=D[sp-1];sp--;break;case 27:D[sp-1]=~D[sp-1];break;
case 28:case 29:case 30:b=D[sp-1];a=D[sp-2];r=code===28?a<<(b&31):code===29?a>>(b&31):a>>>(b&31)|0;D[sp-2]=r;sp--;break;
case 32:case 33:case 34:b=D[sp-1];a=D[sp-2];r=code===32?a===b?1:0:code===33?a < b?1:0:a>>>0 < b>>>0?1:0;D[sp-2]=r;sp--;break;
case 48:case 49:case 50:rel=p[nx-2]|p[nx-1]<<8;if (rel&32768) rel-=65536;v=code===48?0:D[--sp];if (code===48||(code===49)===(v===0)) pc=nx+rel;break;
case 51:if (csp===64) return done(7);C[csp++]=nx;pc=p[nx-2]|p[nx-1]<<8;break;case 52:if (!csp) return done(8);pc=C[--csp];break;
case 64:v=D[sp-1];if (v < 0||v > 255) return done(6);D[sp-1]=M[v];break;case 65:v=D[sp-1];a=D[sp-2];if (v < 0||v > 255) return done(6);sp-=2;M[v]=a;break;
case 80:bytes=enc.encode(String(D[sp-1]));if (olen+bytes.length > 65536) return done(11);sp--;out.set(bytes,olen);olen+=bytes.length;break;
case 81:if (olen+1 > 65536) return done(11);out[olen++]=D[--sp]&255;break;case 82:D[sp++]=ip < input.length?input[ip++]:-1;break;case 83:return done(D[--sp]&255);
}}}
mkdirSync(O,{ recursive:true,mode:0o755 });for (const id of readdirSync(I).sort()) {
const dir=join(I,id),odir=join(O,id);mkdirSync(odir,{ recursive:true,mode:0o755 });const p=readFileSync(join(dir,'program.bin'));let input=new Uint8Array(0);
try { input=readFileSync(join(dir,'input.bin'));} catch {}const r=run(p,input);
writeFileSync(join(odir,'stdout.bin'),r.out,{ mode:0o644 });writeFileSync(join(odir,'exit.txt'),String(r.exit)+'\n',{ mode:0o644 });}
