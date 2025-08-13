var qe=Object.defineProperty;var Ee=(t,e,a)=>e in t?qe(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var f=(t,e,a)=>Ee(t,typeof e!="symbol"?e+"":e,a);import{c as ze,a2 as T,j as p,f as B,i as F,F as Te,B as re,aM as oe,a4 as $e,O as Ie,g as le,h as ce,a6 as je,c9 as de,cZ as Me,U as Le,M as De}from"./index-D5qLf1ib.js";import Ne from"./purify.es-BFmuJLeH.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=ze("Hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]]);function H(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var S=H();function fe(t){S=t}var E={exec:()=>null};function m(t,e=""){let a=typeof t=="string"?t:t.source,i={replace:(s,r)=>{let d=typeof r=="string"?r:r.source;return d=d.replace(x.caret,"$1"),a=a.replace(s,d),i},getRegex:()=>new RegExp(a,e)};return i}var x={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}#`),htmlBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}<(?:[a-z].*>|!--)`,"i")},Ge=/^(?:[ \t]*(?:\n|$))+/,Be=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Fe=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,z=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ve=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,U=/(?:[*+-]|\d{1,9}[.)])/,be=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,ke=m(be).replace(/bull/g,U).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Ze=m(be).replace(/bull/g,U).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),W=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Oe=/^[^\n]+/,X=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Qe=m(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",X).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),He=m(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,U).getRegex(),D="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",J=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ue=m("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",J).replace("tag",D).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),xe=m(W).replace("hr",z).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",D).getRegex(),We=m(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",xe).getRegex(),K={blockquote:We,code:Be,def:Qe,fences:Fe,heading:Ve,hr:z,html:Ue,lheading:ke,list:He,newline:Ge,paragraph:xe,table:E,text:Oe},ue=m("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",z).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",D).getRegex(),Xe={...K,lheading:Ze,table:ue,paragraph:m(W).replace("hr",z).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",ue).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",D).getRegex()},Je={...K,html:m(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",J).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:E,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:m(W).replace("hr",z).replace("heading",` *#{1,6} *[^
]`).replace("lheading",ke).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ke=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Ye=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ve=/^( {2,}|\\)\n(?!\s*$)/,et=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,N=/[\p{P}\p{S}]/u,Y=/[\s\p{P}\p{S}]/u,we=/[^\s\p{P}\p{S}]/u,tt=m(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Y).getRegex(),ye=/(?!~)[\p{P}\p{S}]/u,at=/(?!~)[\s\p{P}\p{S}]/u,st=/(?:[^\s\p{P}\p{S}]|~)/u,it=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<(?! )[^<>]*?>/g,Re=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,nt=m(Re,"u").replace(/punct/g,N).getRegex(),rt=m(Re,"u").replace(/punct/g,ye).getRegex(),Pe="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",ot=m(Pe,"gu").replace(/notPunctSpace/g,we).replace(/punctSpace/g,Y).replace(/punct/g,N).getRegex(),lt=m(Pe,"gu").replace(/notPunctSpace/g,st).replace(/punctSpace/g,at).replace(/punct/g,ye).getRegex(),ct=m("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,we).replace(/punctSpace/g,Y).replace(/punct/g,N).getRegex(),dt=m(/\\(punct)/,"gu").replace(/punct/g,N).getRegex(),ut=m(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),pt=m(J).replace("(?:-->|$)","-->").getRegex(),ht=m("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",pt).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),j=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,mt=m(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",j).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Se=m(/^!?\[(label)\]\[(ref)\]/).replace("label",j).replace("ref",X).getRegex(),Ce=m(/^!?\[(ref)\](?:\[\])?/).replace("ref",X).getRegex(),gt=m("reflink|nolink(?!\\()","g").replace("reflink",Se).replace("nolink",Ce).getRegex(),ee={_backpedal:E,anyPunctuation:dt,autolink:ut,blockSkip:it,br:ve,code:Ye,del:E,emStrongLDelim:nt,emStrongRDelimAst:ot,emStrongRDelimUnd:ct,escape:Ke,link:mt,nolink:Ce,punctuation:tt,reflink:Se,reflinkSearch:gt,tag:ht,text:et,url:E},ft={...ee,link:m(/^!?\[(label)\]\((.*?)\)/).replace("label",j).getRegex(),reflink:m(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",j).getRegex()},Z={...ee,emStrongRDelimAst:lt,emStrongLDelim:rt,url:m(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},bt={...Z,br:m(ve).replace("{2,}","*").getRegex(),text:m(Z.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},$={normal:K,gfm:Xe,pedantic:Je},A={normal:ee,gfm:Z,breaks:bt,pedantic:ft},kt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},pe=t=>kt[t];function w(t,e){if(e){if(x.escapeTest.test(t))return t.replace(x.escapeReplace,pe)}else if(x.escapeTestNoEncode.test(t))return t.replace(x.escapeReplaceNoEncode,pe);return t}function he(t){try{t=encodeURI(t).replace(x.percentDecode,"%")}catch{return null}return t}function me(t,e){var r;let a=t.replace(x.findPipe,(d,n,c)=>{let o=!1,l=n;for(;--l>=0&&c[l]==="\\";)o=!o;return o?"|":" |"}),i=a.split(x.splitPipe),s=0;if(i[0].trim()||i.shift(),i.length>0&&!((r=i.at(-1))!=null&&r.trim())&&i.pop(),e)if(i.length>e)i.splice(e);else for(;i.length<e;)i.push("");for(;s<i.length;s++)i[s]=i[s].trim().replace(x.slashPipe,"|");return i}function q(t,e,a){let i=t.length;if(i===0)return"";let s=0;for(;s<i;){let r=t.charAt(i-s-1);if(r===e&&!a)s++;else if(r!==e&&a)s++;else break}return t.slice(0,i-s)}function xt(t,e){if(t.indexOf(e[1])===-1)return-1;let a=0;for(let i=0;i<t.length;i++)if(t[i]==="\\")i++;else if(t[i]===e[0])a++;else if(t[i]===e[1]&&(a--,a<0))return i;return a>0?-2:-1}function ge(t,e,a,i,s){let r=e.href,d=e.title||null,n=t[1].replace(s.other.outputLinkReplace,"$1");i.state.inLink=!0;let c={type:t[0].charAt(0)==="!"?"image":"link",raw:a,href:r,title:d,text:n,tokens:i.inlineTokens(n)};return i.state.inLink=!1,c}function vt(t,e,a){let i=t.match(a.other.indentCodeCompensation);if(i===null)return e;let s=i[1];return e.split(`
`).map(r=>{let d=r.match(a.other.beginningSpace);if(d===null)return r;let[n]=d;return n.length>=s.length?r.slice(s.length):r}).join(`
`)}var M=class{constructor(t){f(this,"options");f(this,"rules");f(this,"lexer");this.options=t||S}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let a=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?a:q(a,`
`)}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let a=e[0],i=vt(a,e[3]||"",this.rules);return{type:"code",raw:a,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:i}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let a=e[2].trim();if(this.rules.other.endingHash.test(a)){let i=q(a,"#");(this.options.pedantic||!i||this.rules.other.endingSpaceChar.test(i))&&(a=i.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:a,tokens:this.lexer.inline(a)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:q(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let a=q(e[0],`
`).split(`
`),i="",s="",r=[];for(;a.length>0;){let d=!1,n=[],c;for(c=0;c<a.length;c++)if(this.rules.other.blockquoteStart.test(a[c]))n.push(a[c]),d=!0;else if(!d)n.push(a[c]);else break;a=a.slice(c);let o=n.join(`
`),l=o.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");i=i?`${i}
${o}`:o,s=s?`${s}
${l}`:l;let h=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(l,r,!0),this.lexer.state.top=h,a.length===0)break;let u=r.at(-1);if((u==null?void 0:u.type)==="code")break;if((u==null?void 0:u.type)==="blockquote"){let k=u,b=k.raw+`
`+a.join(`
`),v=this.blockquote(b);r[r.length-1]=v,i=i.substring(0,i.length-k.raw.length)+v.raw,s=s.substring(0,s.length-k.text.length)+v.text;break}else if((u==null?void 0:u.type)==="list"){let k=u,b=k.raw+`
`+a.join(`
`),v=this.list(b);r[r.length-1]=v,i=i.substring(0,i.length-u.raw.length)+v.raw,s=s.substring(0,s.length-k.raw.length)+v.raw,a=b.substring(r.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:i,tokens:r,text:s}}}list(t){let e=this.rules.block.list.exec(t);if(e){let a=e[1].trim(),i=a.length>1,s={type:"list",raw:"",ordered:i,start:i?+a.slice(0,-1):"",loose:!1,items:[]};a=i?`\\d{1,9}\\${a.slice(-1)}`:`\\${a}`,this.options.pedantic&&(a=i?a:"[*+-]");let r=this.rules.other.listItemRegex(a),d=!1;for(;t;){let c=!1,o="",l="";if(!(e=r.exec(t))||this.rules.block.hr.test(t))break;o=e[0],t=t.substring(o.length);let h=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,_=>" ".repeat(3*_.length)),u=t.split(`
`,1)[0],k=!h.trim(),b=0;if(this.options.pedantic?(b=2,l=h.trimStart()):k?b=e[1].length+1:(b=e[2].search(this.rules.other.nonSpaceChar),b=b>4?1:b,l=h.slice(b),b+=e[1].length),k&&this.rules.other.blankLine.test(u)&&(o+=u+`
`,t=t.substring(u.length+1),c=!0),!c){let _=this.rules.other.nextBulletRegex(b),se=this.rules.other.hrRegex(b),ie=this.rules.other.fencesBeginRegex(b),ne=this.rules.other.headingBeginRegex(b),Ae=this.rules.other.htmlBeginRegex(b);for(;t;){let G=t.split(`
`,1)[0],C;if(u=G,this.options.pedantic?(u=u.replace(this.rules.other.listReplaceNesting,"  "),C=u):C=u.replace(this.rules.other.tabCharGlobal,"    "),ie.test(u)||ne.test(u)||Ae.test(u)||_.test(u)||se.test(u))break;if(C.search(this.rules.other.nonSpaceChar)>=b||!u.trim())l+=`
`+C.slice(b);else{if(k||h.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||ie.test(h)||ne.test(h)||se.test(h))break;l+=`
`+u}!k&&!u.trim()&&(k=!0),o+=G+`
`,t=t.substring(G.length+1),h=C.slice(b)}}s.loose||(d?s.loose=!0:this.rules.other.doubleBlankLine.test(o)&&(d=!0));let v=null,ae;this.options.gfm&&(v=this.rules.other.listIsTask.exec(l),v&&(ae=v[0]!=="[ ] ",l=l.replace(this.rules.other.listReplaceTask,""))),s.items.push({type:"list_item",raw:o,task:!!v,checked:ae,loose:!1,text:l,tokens:[]}),s.raw+=o}let n=s.items.at(-1);if(n)n.raw=n.raw.trimEnd(),n.text=n.text.trimEnd();else return;s.raw=s.raw.trimEnd();for(let c=0;c<s.items.length;c++)if(this.lexer.state.top=!1,s.items[c].tokens=this.lexer.blockTokens(s.items[c].text,[]),!s.loose){let o=s.items[c].tokens.filter(h=>h.type==="space"),l=o.length>0&&o.some(h=>this.rules.other.anyLine.test(h.raw));s.loose=l}if(s.loose)for(let c=0;c<s.items.length;c++)s.items[c].loose=!0;return s}}html(t){let e=this.rules.block.html.exec(t);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(t){let e=this.rules.block.def.exec(t);if(e){let a=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),i=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",s=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:a,raw:e[0],href:i,title:s}}}table(t){var d;let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let a=me(e[1]),i=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),s=(d=e[3])!=null&&d.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],r={type:"table",raw:e[0],header:[],align:[],rows:[]};if(a.length===i.length){for(let n of i)this.rules.other.tableAlignRight.test(n)?r.align.push("right"):this.rules.other.tableAlignCenter.test(n)?r.align.push("center"):this.rules.other.tableAlignLeft.test(n)?r.align.push("left"):r.align.push(null);for(let n=0;n<a.length;n++)r.header.push({text:a[n],tokens:this.lexer.inline(a[n]),header:!0,align:r.align[n]});for(let n of s)r.rows.push(me(n,r.header.length).map((c,o)=>({text:c,tokens:this.lexer.inline(c),header:!1,align:r.align[o]})));return r}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let a=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:a,tokens:this.lexer.inline(a)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let a=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(a)){if(!this.rules.other.endAngleBracket.test(a))return;let r=q(a.slice(0,-1),"\\");if((a.length-r.length)%2===0)return}else{let r=xt(e[2],"()");if(r===-2)return;if(r>-1){let d=(e[0].indexOf("!")===0?5:4)+e[1].length+r;e[2]=e[2].substring(0,r),e[0]=e[0].substring(0,d).trim(),e[3]=""}}let i=e[2],s="";if(this.options.pedantic){let r=this.rules.other.pedanticHrefTitle.exec(i);r&&(i=r[1],s=r[3])}else s=e[3]?e[3].slice(1,-1):"";return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(a)?i=i.slice(1):i=i.slice(1,-1)),ge(e,{href:i&&i.replace(this.rules.inline.anyPunctuation,"$1"),title:s&&s.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let a;if((a=this.rules.inline.reflink.exec(t))||(a=this.rules.inline.nolink.exec(t))){let i=(a[2]||a[1]).replace(this.rules.other.multipleSpaceGlobal," "),s=e[i.toLowerCase()];if(!s){let r=a[0].charAt(0);return{type:"text",raw:r,text:r}}return ge(a,s,a[0],this.lexer,this.rules)}}emStrong(t,e,a=""){let i=this.rules.inline.emStrongLDelim.exec(t);if(!(!i||i[3]&&a.match(this.rules.other.unicodeAlphaNumeric))&&(!(i[1]||i[2])||!a||this.rules.inline.punctuation.exec(a))){let s=[...i[0]].length-1,r,d,n=s,c=0,o=i[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(o.lastIndex=0,e=e.slice(-1*t.length+s);(i=o.exec(e))!=null;){if(r=i[1]||i[2]||i[3]||i[4]||i[5]||i[6],!r)continue;if(d=[...r].length,i[3]||i[4]){n+=d;continue}else if((i[5]||i[6])&&s%3&&!((s+d)%3)){c+=d;continue}if(n-=d,n>0)continue;d=Math.min(d,d+n+c);let l=[...i[0]][0].length,h=t.slice(0,s+i.index+l+d);if(Math.min(s,d)%2){let k=h.slice(1,-1);return{type:"em",raw:h,text:k,tokens:this.lexer.inlineTokens(k)}}let u=h.slice(2,-2);return{type:"strong",raw:h,text:u,tokens:this.lexer.inlineTokens(u)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let a=e[2].replace(this.rules.other.newLineCharGlobal," "),i=this.rules.other.nonSpaceChar.test(a),s=this.rules.other.startingSpaceChar.test(a)&&this.rules.other.endingSpaceChar.test(a);return i&&s&&(a=a.substring(1,a.length-1)),{type:"codespan",raw:e[0],text:a}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t){let e=this.rules.inline.del.exec(t);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let a,i;return e[2]==="@"?(a=e[1],i="mailto:"+a):(a=e[1],i=a),{type:"link",raw:e[0],text:a,href:i,tokens:[{type:"text",raw:a,text:a}]}}}url(t){var a;let e;if(e=this.rules.inline.url.exec(t)){let i,s;if(e[2]==="@")i=e[0],s="mailto:"+i;else{let r;do r=e[0],e[0]=((a=this.rules.inline._backpedal.exec(e[0]))==null?void 0:a[0])??"";while(r!==e[0]);i=e[0],e[1]==="www."?s="http://"+e[0]:s=e[0]}return{type:"link",raw:e[0],text:i,href:s,tokens:[{type:"text",raw:i,text:i}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let a=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:a}}}},y=class O{constructor(e){f(this,"tokens");f(this,"options");f(this,"state");f(this,"tokenizer");f(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||S,this.options.tokenizer=this.options.tokenizer||new M,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let a={other:x,block:$.normal,inline:A.normal};this.options.pedantic?(a.block=$.pedantic,a.inline=A.pedantic):this.options.gfm&&(a.block=$.gfm,this.options.breaks?a.inline=A.breaks:a.inline=A.gfm),this.tokenizer.rules=a}static get rules(){return{block:$,inline:A}}static lex(e,a){return new O(a).lex(e)}static lexInline(e,a){return new O(a).inlineTokens(e)}lex(e){e=e.replace(x.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let a=0;a<this.inlineQueue.length;a++){let i=this.inlineQueue[a];this.inlineTokens(i.src,i.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,a=[],i=!1){var s,r,d;for(this.options.pedantic&&(e=e.replace(x.tabCharGlobal,"    ").replace(x.spaceLine,""));e;){let n;if((r=(s=this.options.extensions)==null?void 0:s.block)!=null&&r.some(o=>(n=o.call({lexer:this},e,a))?(e=e.substring(n.raw.length),a.push(n),!0):!1))continue;if(n=this.tokenizer.space(e)){e=e.substring(n.raw.length);let o=a.at(-1);n.raw.length===1&&o!==void 0?o.raw+=`
`:a.push(n);continue}if(n=this.tokenizer.code(e)){e=e.substring(n.raw.length);let o=a.at(-1);(o==null?void 0:o.type)==="paragraph"||(o==null?void 0:o.type)==="text"?(o.raw+=`
`+n.raw,o.text+=`
`+n.text,this.inlineQueue.at(-1).src=o.text):a.push(n);continue}if(n=this.tokenizer.fences(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.heading(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.hr(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.blockquote(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.list(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.html(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.def(e)){e=e.substring(n.raw.length);let o=a.at(-1);(o==null?void 0:o.type)==="paragraph"||(o==null?void 0:o.type)==="text"?(o.raw+=`
`+n.raw,o.text+=`
`+n.raw,this.inlineQueue.at(-1).src=o.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(e)){e=e.substring(n.raw.length),a.push(n);continue}if(n=this.tokenizer.lheading(e)){e=e.substring(n.raw.length),a.push(n);continue}let c=e;if((d=this.options.extensions)!=null&&d.startBlock){let o=1/0,l=e.slice(1),h;this.options.extensions.startBlock.forEach(u=>{h=u.call({lexer:this},l),typeof h=="number"&&h>=0&&(o=Math.min(o,h))}),o<1/0&&o>=0&&(c=e.substring(0,o+1))}if(this.state.top&&(n=this.tokenizer.paragraph(c))){let o=a.at(-1);i&&(o==null?void 0:o.type)==="paragraph"?(o.raw+=`
`+n.raw,o.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):a.push(n),i=c.length!==e.length,e=e.substring(n.raw.length);continue}if(n=this.tokenizer.text(e)){e=e.substring(n.raw.length);let o=a.at(-1);(o==null?void 0:o.type)==="text"?(o.raw+=`
`+n.raw,o.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):a.push(n);continue}if(e){let o="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,a}inline(e,a=[]){return this.inlineQueue.push({src:e,tokens:a}),a}inlineTokens(e,a=[]){var n,c,o;let i=e,s=null;if(this.tokens.links){let l=Object.keys(this.tokens.links);if(l.length>0)for(;(s=this.tokenizer.rules.inline.reflinkSearch.exec(i))!=null;)l.includes(s[0].slice(s[0].lastIndexOf("[")+1,-1))&&(i=i.slice(0,s.index)+"["+"a".repeat(s[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(s=this.tokenizer.rules.inline.anyPunctuation.exec(i))!=null;)i=i.slice(0,s.index)+"++"+i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(s=this.tokenizer.rules.inline.blockSkip.exec(i))!=null;)i=i.slice(0,s.index)+"["+"a".repeat(s[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let r=!1,d="";for(;e;){r||(d=""),r=!1;let l;if((c=(n=this.options.extensions)==null?void 0:n.inline)!=null&&c.some(u=>(l=u.call({lexer:this},e,a))?(e=e.substring(l.raw.length),a.push(l),!0):!1))continue;if(l=this.tokenizer.escape(e)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.tag(e)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.link(e)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(l.raw.length);let u=a.at(-1);l.type==="text"&&(u==null?void 0:u.type)==="text"?(u.raw+=l.raw,u.text+=l.text):a.push(l);continue}if(l=this.tokenizer.emStrong(e,i,d)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.codespan(e)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.br(e)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.del(e)){e=e.substring(l.raw.length),a.push(l);continue}if(l=this.tokenizer.autolink(e)){e=e.substring(l.raw.length),a.push(l);continue}if(!this.state.inLink&&(l=this.tokenizer.url(e))){e=e.substring(l.raw.length),a.push(l);continue}let h=e;if((o=this.options.extensions)!=null&&o.startInline){let u=1/0,k=e.slice(1),b;this.options.extensions.startInline.forEach(v=>{b=v.call({lexer:this},k),typeof b=="number"&&b>=0&&(u=Math.min(u,b))}),u<1/0&&u>=0&&(h=e.substring(0,u+1))}if(l=this.tokenizer.inlineText(h)){e=e.substring(l.raw.length),l.raw.slice(-1)!=="_"&&(d=l.raw.slice(-1)),r=!0;let u=a.at(-1);(u==null?void 0:u.type)==="text"?(u.raw+=l.raw,u.text+=l.text):a.push(l);continue}if(e){let u="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(u);break}else throw new Error(u)}}return a}},L=class{constructor(t){f(this,"options");f(this,"parser");this.options=t||S}space(t){return""}code({text:t,lang:e,escaped:a}){var r;let i=(r=(e||"").match(x.notSpaceStart))==null?void 0:r[0],s=t.replace(x.endingNewline,"")+`
`;return i?'<pre><code class="language-'+w(i)+'">'+(a?s:w(s,!0))+`</code></pre>
`:"<pre><code>"+(a?s:w(s,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,a=t.start,i="";for(let d=0;d<t.items.length;d++){let n=t.items[d];i+=this.listitem(n)}let s=e?"ol":"ul",r=e&&a!==1?' start="'+a+'"':"";return"<"+s+r+`>
`+i+"</"+s+`>
`}listitem(t){var a;let e="";if(t.task){let i=this.checkbox({checked:!!t.checked});t.loose?((a=t.tokens[0])==null?void 0:a.type)==="paragraph"?(t.tokens[0].text=i+" "+t.tokens[0].text,t.tokens[0].tokens&&t.tokens[0].tokens.length>0&&t.tokens[0].tokens[0].type==="text"&&(t.tokens[0].tokens[0].text=i+" "+w(t.tokens[0].tokens[0].text),t.tokens[0].tokens[0].escaped=!0)):t.tokens.unshift({type:"text",raw:i+" ",text:i+" ",escaped:!0}):e+=i+" "}return e+=this.parser.parse(t.tokens,!!t.loose),`<li>${e}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",a="";for(let s=0;s<t.header.length;s++)a+=this.tablecell(t.header[s]);e+=this.tablerow({text:a});let i="";for(let s=0;s<t.rows.length;s++){let r=t.rows[s];a="";for(let d=0;d<r.length;d++)a+=this.tablecell(r[d]);i+=this.tablerow({text:a})}return i&&(i=`<tbody>${i}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+i+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),a=t.header?"th":"td";return(t.align?`<${a} align="${t.align}">`:`<${a}>`)+e+`</${a}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${w(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:a}){let i=this.parser.parseInline(a),s=he(t);if(s===null)return i;t=s;let r='<a href="'+t+'"';return e&&(r+=' title="'+w(e)+'"'),r+=">"+i+"</a>",r}image({href:t,title:e,text:a,tokens:i}){i&&(a=this.parser.parseInline(i,this.parser.textRenderer));let s=he(t);if(s===null)return w(a);t=s;let r=`<img src="${t}" alt="${a}"`;return e&&(r+=` title="${w(e)}"`),r+=">",r}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:w(t.text)}},te=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}},R=class Q{constructor(e){f(this,"options");f(this,"renderer");f(this,"textRenderer");this.options=e||S,this.options.renderer=this.options.renderer||new L,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new te}static parse(e,a){return new Q(a).parse(e)}static parseInline(e,a){return new Q(a).parseInline(e)}parse(e,a=!0){var s,r;let i="";for(let d=0;d<e.length;d++){let n=e[d];if((r=(s=this.options.extensions)==null?void 0:s.renderers)!=null&&r[n.type]){let o=n,l=this.options.extensions.renderers[o.type].call({parser:this},o);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)){i+=l||"";continue}}let c=n;switch(c.type){case"space":{i+=this.renderer.space(c);continue}case"hr":{i+=this.renderer.hr(c);continue}case"heading":{i+=this.renderer.heading(c);continue}case"code":{i+=this.renderer.code(c);continue}case"table":{i+=this.renderer.table(c);continue}case"blockquote":{i+=this.renderer.blockquote(c);continue}case"list":{i+=this.renderer.list(c);continue}case"html":{i+=this.renderer.html(c);continue}case"paragraph":{i+=this.renderer.paragraph(c);continue}case"text":{let o=c,l=this.renderer.text(o);for(;d+1<e.length&&e[d+1].type==="text";)o=e[++d],l+=`
`+this.renderer.text(o);a?i+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l,escaped:!0}]}):i+=l;continue}default:{let o='Token with "'+c.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return i}parseInline(e,a=this.renderer){var s,r;let i="";for(let d=0;d<e.length;d++){let n=e[d];if((r=(s=this.options.extensions)==null?void 0:s.renderers)!=null&&r[n.type]){let o=this.options.extensions.renderers[n.type].call({parser:this},n);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(n.type)){i+=o||"";continue}}let c=n;switch(c.type){case"escape":{i+=a.text(c);break}case"html":{i+=a.html(c);break}case"link":{i+=a.link(c);break}case"image":{i+=a.image(c);break}case"strong":{i+=a.strong(c);break}case"em":{i+=a.em(c);break}case"codespan":{i+=a.codespan(c);break}case"br":{i+=a.br(c);break}case"del":{i+=a.del(c);break}case"text":{i+=a.text(c);break}default:{let o='Token with "'+c.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return i}},V,I=(V=class{constructor(t){f(this,"options");f(this,"block");this.options=t||S}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}provideLexer(){return this.block?y.lex:y.lexInline}provideParser(){return this.block?R.parse:R.parseInline}},f(V,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"])),V),wt=class{constructor(...t){f(this,"defaults",H());f(this,"options",this.setOptions);f(this,"parse",this.parseMarkdown(!0));f(this,"parseInline",this.parseMarkdown(!1));f(this,"Parser",R);f(this,"Renderer",L);f(this,"TextRenderer",te);f(this,"Lexer",y);f(this,"Tokenizer",M);f(this,"Hooks",I);this.use(...t)}walkTokens(t,e){var i,s;let a=[];for(let r of t)switch(a=a.concat(e.call(this,r)),r.type){case"table":{let d=r;for(let n of d.header)a=a.concat(this.walkTokens(n.tokens,e));for(let n of d.rows)for(let c of n)a=a.concat(this.walkTokens(c.tokens,e));break}case"list":{let d=r;a=a.concat(this.walkTokens(d.items,e));break}default:{let d=r;(s=(i=this.defaults.extensions)==null?void 0:i.childTokens)!=null&&s[d.type]?this.defaults.extensions.childTokens[d.type].forEach(n=>{let c=d[n].flat(1/0);a=a.concat(this.walkTokens(c,e))}):d.tokens&&(a=a.concat(this.walkTokens(d.tokens,e)))}}return a}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(a=>{let i={...a};if(i.async=this.defaults.async||i.async||!1,a.extensions&&(a.extensions.forEach(s=>{if(!s.name)throw new Error("extension name required");if("renderer"in s){let r=e.renderers[s.name];r?e.renderers[s.name]=function(...d){let n=s.renderer.apply(this,d);return n===!1&&(n=r.apply(this,d)),n}:e.renderers[s.name]=s.renderer}if("tokenizer"in s){if(!s.level||s.level!=="block"&&s.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let r=e[s.level];r?r.unshift(s.tokenizer):e[s.level]=[s.tokenizer],s.start&&(s.level==="block"?e.startBlock?e.startBlock.push(s.start):e.startBlock=[s.start]:s.level==="inline"&&(e.startInline?e.startInline.push(s.start):e.startInline=[s.start]))}"childTokens"in s&&s.childTokens&&(e.childTokens[s.name]=s.childTokens)}),i.extensions=e),a.renderer){let s=this.defaults.renderer||new L(this.defaults);for(let r in a.renderer){if(!(r in s))throw new Error(`renderer '${r}' does not exist`);if(["options","parser"].includes(r))continue;let d=r,n=a.renderer[d],c=s[d];s[d]=(...o)=>{let l=n.apply(s,o);return l===!1&&(l=c.apply(s,o)),l||""}}i.renderer=s}if(a.tokenizer){let s=this.defaults.tokenizer||new M(this.defaults);for(let r in a.tokenizer){if(!(r in s))throw new Error(`tokenizer '${r}' does not exist`);if(["options","rules","lexer"].includes(r))continue;let d=r,n=a.tokenizer[d],c=s[d];s[d]=(...o)=>{let l=n.apply(s,o);return l===!1&&(l=c.apply(s,o)),l}}i.tokenizer=s}if(a.hooks){let s=this.defaults.hooks||new I;for(let r in a.hooks){if(!(r in s))throw new Error(`hook '${r}' does not exist`);if(["options","block"].includes(r))continue;let d=r,n=a.hooks[d],c=s[d];I.passThroughHooks.has(r)?s[d]=o=>{if(this.defaults.async)return Promise.resolve(n.call(s,o)).then(h=>c.call(s,h));let l=n.call(s,o);return c.call(s,l)}:s[d]=(...o)=>{let l=n.apply(s,o);return l===!1&&(l=c.apply(s,o)),l}}i.hooks=s}if(a.walkTokens){let s=this.defaults.walkTokens,r=a.walkTokens;i.walkTokens=function(d){let n=[];return n.push(r.call(this,d)),s&&(n=n.concat(s.call(this,d))),n}}this.defaults={...this.defaults,...i}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return y.lex(t,e??this.defaults)}parser(t,e){return R.parse(t,e??this.defaults)}parseMarkdown(t){return(e,a)=>{let i={...a},s={...this.defaults,...i},r=this.onError(!!s.silent,!!s.async);if(this.defaults.async===!0&&i.async===!1)return r(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return r(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return r(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));s.hooks&&(s.hooks.options=s,s.hooks.block=t);let d=s.hooks?s.hooks.provideLexer():t?y.lex:y.lexInline,n=s.hooks?s.hooks.provideParser():t?R.parse:R.parseInline;if(s.async)return Promise.resolve(s.hooks?s.hooks.preprocess(e):e).then(c=>d(c,s)).then(c=>s.hooks?s.hooks.processAllTokens(c):c).then(c=>s.walkTokens?Promise.all(this.walkTokens(c,s.walkTokens)).then(()=>c):c).then(c=>n(c,s)).then(c=>s.hooks?s.hooks.postprocess(c):c).catch(r);try{s.hooks&&(e=s.hooks.preprocess(e));let c=d(e,s);s.hooks&&(c=s.hooks.processAllTokens(c)),s.walkTokens&&this.walkTokens(c,s.walkTokens);let o=n(c,s);return s.hooks&&(o=s.hooks.postprocess(o)),o}catch(c){return r(c)}}}onError(t,e){return a=>{if(a.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let i="<p>An error occurred:</p><pre>"+w(a.message+"",!0)+"</pre>";return e?Promise.resolve(i):i}if(e)return Promise.reject(a);throw a}}},P=new wt;function g(t,e){return P.parse(t,e)}g.options=g.setOptions=function(t){return P.setOptions(t),g.defaults=P.defaults,fe(g.defaults),g};g.getDefaults=H;g.defaults=S;g.use=function(...t){return P.use(...t),g.defaults=P.defaults,fe(g.defaults),g};g.walkTokens=function(t,e){return P.walkTokens(t,e)};g.parseInline=P.parseInline;g.Parser=R;g.parser=R.parse;g.Renderer=L;g.TextRenderer=te;g.Lexer=y;g.lexer=y.lex;g.Tokenizer=M;g.Hooks=I;g.parse=g;g.options;g.setOptions;g.use;g.walkTokens;g.parseInline;R.parse;y.lex;const yt=t=>{try{const e=g(t,{breaks:!0,gfm:!0});return Ne.sanitize(e)}catch(e){return console.error("Error rendering markdown:",e),t}},Rt={"visitantes-manual":{title:"Manual Completo - Módulo de Visitantes",icon:p.jsx(Le,{className:"h-5 w-5"}),sections:[{id:"intro",title:"Introducción al Módulo",level:1,content:`
El **Módulo de Visitantes** es una herramienta integral diseñada para la gestión completa de la experiencia ciudadana en los parques urbanos de Guadalajara. Este módulo permite el monitoreo, análisis y mejora continua de la satisfacción de los visitantes mediante cinco componentes principales:

### ¿Para qué sirve?
- **Monitorear** el flujo de visitantes en tiempo real
- **Medir** la satisfacción ciudadana de manera sistemática
- **Analizar** tendencias de uso y preferencias
- **Mejorar** la calidad del servicio basado en datos reales
- **Reportar** métricas ejecutivas para toma de decisiones

### Acceso al Módulo
1. Inicie sesión en ParkSys con sus credenciales administrativas
2. En el sidebar administrativo, localice la sección **"Visitantes"**
3. Expanda el menú para acceder a las cinco funcionalidades
        `},{id:"dashboard",title:"Dashboard de Visitantes",level:1,content:`
### Descripción
El Dashboard proporciona una vista ejecutiva consolidada de todas las métricas relacionadas con visitantes, evaluaciones y retroalimentación ciudadana.

### Características Principales
- **Métricas Unificadas**: Total de visitantes, evaluaciones recibidas y promedio de calificaciones
- **Análisis Temporal**: Tendencias de visitación por períodos configurables
- **Vista por Parques**: Filtrado específico por ubicación
- **Gráficas Interactivas**: Visualización de datos mediante charts dinámicos

### Cómo Usar el Dashboard

#### Paso 1: Acceso
- Navegue a **Visitantes > Dashboard** en el sidebar administrativo
- El sistema cargará automáticamente los datos más recientes

#### Paso 2: Interpretación de Métricas
Las tarjetas superiores muestran:
- **Total Visitantes**: Suma histórica de todos los registros
- **Evaluaciones**: Cantidad total de evaluaciones recibidas
- **Promedio General**: Calificación promedio del sistema (escala 1-5 estrellas)
- **Retroalimentación**: Cantidad de comentarios y sugerencias

#### Paso 3: Filtrado de Información
- Use el **selector de parques** para filtrar datos específicos
- Seleccione **"Todos los parques"** para vista general
- Los datos se actualizarán automáticamente según su selección
        `},{id:"conteo",title:"Conteo de Visitantes",level:1,content:`
### Descripción
Sistema integral para el registro, seguimiento y análisis de la afluencia de visitantes en todos los parques del sistema.

### Funcionalidades Disponibles

#### Registro Manual de Visitantes
Permite capturar datos de visitación cuando no se cuenta con sistemas automáticos.

**Campos de Registro:**
- **Fecha**: Selección de fecha específica de registro
- **Parque**: Ubicación donde se realiza el conteo
- **Cantidad**: Número total de visitantes registrados
- **Método de Conteo**: Manual, Automático, o Estimado
- **Condiciones Climáticas**: Soleado, Nublado, Lluvioso, Otro
- **Observaciones**: Notas adicionales relevantes

#### Paso a Paso: Registrar Conteo Manual

1. **Acceso al Formulario**
   - Vaya a **Visitantes > Conteo**
   - Haga clic en **"Nuevo Registro"**

2. **Completar Información Básica**
   - Seleccione la **fecha** del conteo
   - Elija el **parque** correspondiente
   - Ingrese la **cantidad** de visitantes

3. **Especificar Método y Condiciones**
   - Seleccione **"Manual"** en método de conteo
   - Indique las **condiciones climáticas** observadas
   - Agregue **observaciones** si son relevantes

4. **Guardar Registro**
   - Revise la información ingresada
   - Haga clic en **"Guardar"**
   - El sistema confirmará el registro exitoso
        `},{id:"evaluaciones",title:"Evaluaciones de Visitantes",level:1,content:`
### Descripción
Sistema completo para capturar, gestionar y analizar la satisfacción de los visitantes mediante evaluaciones estructuradas.

### Componentes del Sistema

#### Formularios de Evaluación
Los ciudadanos pueden completar evaluaciones que incluyen:
- **Calificación General**: Escala de 1 a 5 estrellas
- **Criterios Específicos**: Limpieza, seguridad, amenidades, etc.
- **Comentarios Escritos**: Retroalimentación cualitativa
- **Datos del Evaluador**: Información demográfica opcional

#### Gestión Administrativa

**Vista de Lista:**
- Tabla completa de todas las evaluaciones recibidas
- Filtros por parque, calificación, fecha
- Paginación para manejo eficiente de volumen
- Exportación a CSV/Excel

**Vista de Fichas:**
- Formato visual tipo tarjetas
- Información resumida por evaluación
- Acceso rápido a detalles completos
- Ideal para revisión ejecutiva
        `},{id:"criterios",title:"Criterios de Evaluación",level:1,content:`
### Descripción
Módulo de configuración que permite definir y personalizar los parámetros de evaluación que utilizarán los visitantes.

### Gestión de Criterios

#### Criterios Predefinidos
El sistema incluye criterios base como:
- **Limpieza General**: Estado de limpieza del parque
- **Seguridad**: Percepción de seguridad personal
- **Amenidades**: Calidad de instalaciones (baños, bancas, etc.)
- **Mantenimiento**: Estado de conservación general
- **Accesibilidad**: Facilidad de acceso para personas con discapacidad

#### Mejores Prácticas
- **Límite de Criterios**: Mantenga entre 5-8 criterios para evitar fatiga del evaluador
- **Claridad**: Use nombres y descripciones fáciles de entender
- **Consistencia**: Mantenga escalas uniformes entre criterios similares
- **Relevancia**: Enfoque en aspectos que realmente puede mejorar
        `},{id:"retroalimentacion",title:"Retroalimentación Ciudadana",level:1,content:`
### Descripción
Canal directo de comunicación entre ciudadanos y administración para reportes, sugerencias y comentarios no estructurados.

### Tipos de Retroalimentación

#### Formularios Disponibles
1. **Compartir Experiencia**: Relatos positivos o negativos detallados
2. **Reportar Problema**: Incidencias específicas que requieren atención
3. **Sugerir Mejora**: Propuestas constructivas de los ciudadanos
4. **Proponer Evento**: Ideas para actividades en los parques

#### Estados de Seguimiento
- **Pendiente**: Retroalimentación recién recibida
- **En Progreso**: Se está trabajando en la respuesta/solución
- **Resuelto**: Acción completada o respuesta enviada
- **Archivado**: Comentarios para referencia histórica

### Sistema de Notificaciones Automáticas
- **Email Automático**: Se envía notificación a administradores al recibir nueva retroalimentación
- **Dashboard Alerts**: Indicadores visuales de items pendientes
- **Reportes Semanales**: Resumen automático de actividad
        `},{id:"faq",title:"Preguntas Frecuentes",level:1,content:`
### Generales

**P: ¿Con qué frecuencia se actualizan los datos en el Dashboard?**
R: Los datos se actualizan en tiempo real. Al ingresar nuevos registros, las métricas se reflejan inmediatamente en todas las vistas.

**P: ¿Puedo recuperar datos si elimino accidentalmente un registro?**
R: El sistema mantiene respaldos automáticos. Contacte al administrador técnico para recuperación de datos eliminados accidentalmente.

### Conteo de Visitantes

**P: ¿Qué hago si me equivoco al ingresar un conteo?**
R: Localice el registro en la lista, haga clic en "Editar" y corrija la información. El sistema mantendrá un historial de cambios.

**P: ¿Qué método de conteo debo seleccionar?**
R: Use "Manual" para conteos realizados por personal, "Automático" para datos de sensores, y "Estimado" para aproximaciones basadas en observación.

### Evaluaciones

**P: ¿Puedo modificar una evaluación después de que un ciudadano la envió?**
R: No es recomendable modificar evaluaciones de ciudadanos. Si hay errores evidentes, documente la situación y mantenga la evaluación original para transparencia.

### Técnicas

**P: ¿Qué navegadores son compatibles?**
R: El sistema funciona en Chrome, Firefox, Safari y Edge en sus versiones más recientes.

**P: ¿Puedo acceder desde dispositivos móviles?**
R: Sí, la interfaz es completamente responsive y funciona en tablets y smartphones.
        `}]},"parques-manual":{title:"Manual Completo - Gestión de Parques",icon:p.jsx(De,{className:"h-5 w-5"}),sections:[{id:"introduccion",title:"Introducción al Módulo",level:1,content:`
El **Módulo de Parques** es el corazón del sistema ParkSys, diseñado para la gestión integral de espacios verdes urbanos en la Ciudad de Guadalajara. Este módulo centraliza toda la información relacionada con la administración, mantenimiento y optimización de los parques municipales.

### Propósito Principal
- **Centralizar** la información de todos los parques del sistema
- **Monitorear** el estado operativo y de mantenimiento
- **Gestionar** amenidades y servicios disponibles
- **Analizar** datos de evaluaciones ciudadanas
- **Facilitar** la toma de decisiones basada en datos

### Acceso al Módulo
1. Inicie sesión en ParkSys con credenciales administrativas
2. En el sidebar administrativo, localice la sección **"Gestión"**
3. Expanda el menú y seleccione **"Parques"**
4. Acceda a los siguientes submenús:
   - Dashboard de Parques
   - Gestión de Parques
   - Evaluaciones de Parques
   - Dashboard de Amenidades
        `},{id:"dashboard",title:"Dashboard de Parques",level:1,content:`
### Descripción General
El Dashboard proporciona una vista ejecutiva consolidada de todos los indicadores clave de rendimiento (KPIs) relacionados con la gestión de parques urbanos.

### Características Principales

#### Métricas Fundamentales
- **Total de Parques**: Cantidad total de espacios verdes registrados
- **Parques Activos**: Espacios operativos y disponibles al público
- **Amenidades Totales**: Servicios e instalaciones disponibles
- **Evaluaciones Recibidas**: Retroalimentación ciudadana recopilada

#### Visualizaciones Interactivas
- **Gráficas de Estado**: Distribución de parques por condición operativa
- **Análisis de Amenidades**: Tipos de servicios más comunes
- **Tendencias de Evaluación**: Evolución de la satisfacción ciudadana
- **Distribución Geográfica**: Mapeo de parques por zona

### Guía de Uso Paso a Paso

#### Paso 1: Acceso al Dashboard
1. Navegue a **Gestión > Parques > Dashboard**
2. El sistema cargará automáticamente los datos más recientes
3. Verifique que las métricas se muestren correctamente

#### Paso 2: Interpretación de Métricas
- **Tarjetas Superiores**: Muestran totales absolutos y porcentajes
- **Gráficas Principales**: Representan distribuciones y tendencias
- **Indicadores de Estado**: Código de colores para alertas

#### Paso 3: Análisis de Datos
- Use los filtros disponibles para segmentar información
- Compare períodos para identificar tendencias
- Identifique parques que requieren atención prioritaria

### Casos de Uso Recomendados

#### Revisión Diaria (5-10 minutos)
- Verificar estado general del sistema
- Identificar alertas o problemas críticos
- Revisar nuevas evaluaciones ciudadanas

#### Análisis Semanal (30-45 minutos)
- Comparar métricas con semana anterior
- Identificar tendencias emergentes
- Planificar intervenciones necesarias
        `},{id:"gestion",title:"Gestión de Parques",level:1,content:`
### Descripción General
La sección de Gestión permite la administración completa del inventario de parques, incluyendo creación, edición, visualización y eliminación de registros.

### Funcionalidades Principales

#### Vista de Lista de Parques
- **Listado Completo**: Todos los parques registrados en el sistema
- **Información Clave**: Nombre, ubicación, estado, amenidades principales
- **Búsqueda Avanzada**: Filtros por nombre, ubicación, estado y tipo
- **Acciones Rápidas**: Ver, editar, gestionar y eliminar parques

#### Creación de Nuevos Parques
**Información Básica Requerida:**
- Nombre oficial del parque
- Dirección completa y referencias
- Coordenadas geográficas (latitud/longitud)
- Área total en metros cuadrados
- Tipo de parque (urbano, metropolitano, vecinal, etc.)

**Información Adicional:**
- Descripción detallada del espacio
- Historia y contexto del parque
- Horarios de operación
- Contacto de administración local
- Fotografías representativas

#### Edición de Parques Existentes
1. **Acceso**: Click en "Editar" desde la lista de parques
2. **Modificación**: Actualizar cualquier campo disponible
3. **Validación**: El sistema verifica la integridad de los datos
4. **Confirmación**: Guardar cambios con registro de auditoría

### Gestión de Amenidades

#### Asignación de Amenidades
- **Selección Múltiple**: Asignar varias amenidades simultáneamente
- **Categorización**: Organizar por tipo de servicio
- **Estado**: Activar/desactivar amenidades específicas
- **Notas**: Agregar observaciones sobre condición o disponibilidad

#### Tipos de Amenidades Disponibles
**Recreación:**
- Juegos infantiles
- Canchas deportivas
- Áreas de ejercicio
- Espacios para mascotas

**Servicios:**
- Baños públicos
- Bebederos
- Estacionamiento
- Iluminación

**Infraestructura:**
- Bancas y mobiliario
- Senderos y caminos
- Áreas verdes
- Sistemas de riego
        `},{id:"evaluaciones",title:"Evaluaciones de Parques",level:1,content:`
### Descripción General
Sistema integral para la gestión y análisis de evaluaciones ciudadanas sobre la calidad y servicios de los parques urbanos.

### Características del Sistema

#### Recopilación de Evaluaciones
- **Formularios Web**: Disponibles en páginas públicas de cada parque
- **Aplicación Móvil**: Evaluación in-situ por parte de visitantes
- **Encuestas Programadas**: Campañas específicas de retroalimentación
- **Integración QR**: Códigos QR en parques para evaluación rápida

#### Métricas de Evaluación
**Criterios Principales:**
- Limpieza y mantenimiento (1-5 estrellas)
- Seguridad y iluminación (1-5 estrellas)
- Calidad de amenidades (1-5 estrellas)
- Accesibilidad universal (1-5 estrellas)
- Experiencia general (1-5 estrellas)

**Información del Evaluador:**
- Nombre completo (opcional)
- Correo electrónico para seguimiento
- Edad y género (estadísticas demográficas)
- Frecuencia de visita al parque
- Motivo principal de la visita

### Análisis y Reportes

#### Dashboard de Evaluaciones
- **Resumen Ejecutivo**: Promedio general y total de evaluaciones
- **Distribución por Criterio**: Gráficas de calificaciones específicas
- **Tendencias Temporales**: Evolución de satisfacción por período
- **Ranking de Parques**: Clasificación por calificación promedio

#### Filtros y Segmentación
- **Por Parque**: Evaluaciones específicas de un espacio
- **Por Período**: Rangos de fechas personalizables
- **Por Calificación**: Filtrar por nivel de satisfacción
- **Por Evaluador**: Análisis demográfico de usuarios

#### Gestión de Retroalimentación
1. **Visualización**: Lista completa de evaluaciones recibidas
2. **Detalle Individual**: Información completa de cada evaluación
3. **Seguimiento**: Estado de atención a comentarios y sugerencias
4. **Respuesta**: Sistema de comunicación con evaluadores
        `},{id:"amenidades",title:"Dashboard de Amenidades",level:1,content:`
### Descripción General
Panel especializado para la gestión integral del inventario de amenidades y servicios disponibles en todos los parques del sistema.

### Funcionalidades Principales

#### Inventario de Amenidades
- **Catálogo Completo**: Todas las amenidades registradas en el sistema
- **Clasificación por Tipo**: Categorización según función y propósito
- **Estado Operativo**: Disponible, en mantenimiento, fuera de servicio
- **Distribución por Parques**: Qué amenidades tiene cada espacio

#### Análisis de Distribución
**Gráficas de Distribución:**
- Amenidades más comunes en el sistema
- Parques con mayor cantidad de servicios
- Tipos de amenidades por zona geográfica
- Evolución del inventario por período

**Indicadores de Cobertura:**
- Porcentaje de parques con amenidades básicas
- Identificación de gaps en servicios
- Recomendaciones de equipamiento
- Análisis de necesidades no cubiertas

#### Gestión de Categorías
1. **Creación de Categorías**: Nuevos tipos de amenidades
2. **Organización**: Jerarquía y subcategorías
3. **Descripción**: Especificaciones técnicas y funcionales
4. **Iconografía**: Símbolos y representación visual

### Administración de Amenidades

#### Registro de Nuevas Amenidades
**Información Requerida:**
- Nombre descriptivo de la amenidad
- Categoría y subcategoría
- Descripción detallada
- Especificaciones técnicas
- Estado inicial (activa/inactiva)

#### Asignación a Parques
1. **Selección de Parque**: Elegir espacio específico
2. **Selección de Amenidades**: Múltiple selección disponible
3. **Configuración**: Estado y observaciones específicas
4. **Validación**: Verificar compatibilidad y requisitos

#### Mantenimiento y Actualización
- **Cambio de Estado**: Activar/desactivar servicios
- **Actualización de Información**: Modificar descripciones y especificaciones
- **Registro de Incidencias**: Reportes de problemas o daños
- **Programación de Mantenimiento**: Calendarios preventivos
        `},{id:"mejores-practicas",title:"Mejores Prácticas",level:1,content:`
### Gestión de Datos

#### Calidad de la Información
1. **Completitud**: Asegurar que todos los campos obligatorios estén llenos
2. **Precisión**: Verificar coordenadas geográficas y direcciones
3. **Actualización**: Mantener información de amenidades al día
4. **Consistencia**: Usar nomenclatura estándar para categorías

#### Fotografías y Multimedia
1. **Calidad**: Imágenes de alta resolución y buena iluminación
2. **Representatividad**: Mostrar aspectos más importantes del parque
3. **Actualización**: Renovar fotos cuando cambien instalaciones
4. **Organización**: Mantener galería organizada y etiquetada

### Análisis de Evaluaciones

#### Frecuencia de Revisión
- **Evaluaciones Críticas** (1-2 estrellas): Revisión inmediata
- **Evaluaciones Generales**: Revisión diaria
- **Análisis de Tendencias**: Revisión semanal
- **Reportes Ejecutivos**: Revisión mensual

#### Respuesta a Ciudadanos
1. **Tiempo de Respuesta**: Máximo 48 horas para evaluaciones críticas
2. **Tono Profesional**: Respuestas corteses y constructivas
3. **Seguimiento**: Informar sobre acciones tomadas
4. **Cierre del Ciclo**: Confirmar resolución de problemas

### Optimización del Sistema

#### Rendimiento
1. **Carga de Imágenes**: Usar formatos optimizados (WebP preferible)
2. **Filtros Eficientes**: Combinar criterios para búsquedas rápidas
3. **Exportaciones**: Programar reportes grandes en horarios de baja demanda
4. **Cache**: Aprovechar almacenamiento temporal para consultas frecuentes

#### Seguridad
1. **Contraseñas Seguras**: Políticas robustas para cuentas administrativas
2. **Accesos Limitados**: Principio de menor privilegio
3. **Auditoría**: Registro completo de acciones administrativas
4. **Respaldos**: Exportaciones regulares de datos críticos
        `},{id:"faq",title:"Preguntas Frecuentes",level:1,content:`
### Preguntas Generales

**P: ¿Cómo accedo al módulo de Parques?**
R: Inicie sesión en ParkSys, vaya al sidebar administrativo, expanda "Gestión" y seleccione "Parques". Verá los submenús disponibles según sus permisos.

**P: ¿Puedo gestionar varios parques simultáneamente?**
R: Sí, el sistema permite selección múltiple para acciones masivas como asignación de amenidades o exportación de datos.

**P: ¿Con qué frecuencia se actualizan los datos del dashboard?**
R: Los datos se actualizan en tiempo real. Las métricas reflejan información hasta el último registro ingresado en el sistema.

### Gestión de Parques

**P: ¿Qué información es obligatoria para crear un nuevo parque?**
R: Nombre, dirección, coordenadas geográficas, área total y tipo de parque son campos obligatorios.

**P: ¿Puedo modificar las coordenadas de un parque existente?**
R: Sí, desde la opción "Editar" del parque específico. Asegúrese de verificar la precisión de las nuevas coordenadas.

**P: ¿Cómo subo múltiples fotos de un parque?**
R: En la página de gestión del parque, use la sección "Gestión de Imágenes" para subir hasta 10 fotos adicionales a la imagen principal.

### Evaluaciones

**P: ¿Cómo se calculan los promedios de evaluación?**
R: Se promedian todas las calificaciones válidas recibidas. Las evaluaciones sin calificación numérica no afectan el promedio.

**P: ¿Puedo eliminar evaluaciones inapropiadas?**
R: Solo usuarios con permisos de Super Administrador pueden eliminar evaluaciones. Se recomienda marcarlas como "revisadas" en lugar de eliminarlas.

### Amenidades

**P: ¿Cómo creo una nueva categoría de amenidad?**
R: En el Dashboard de Amenidades, use la opción "Gestionar Categorías" para crear nuevos tipos de servicios.

**P: ¿Puedo asignar la misma amenidad a múltiples parques?**
R: Sí, las amenidades pueden asignarse a tantos parques como sea necesario.

### Problemas Técnicos

**P: Las imágenes no cargan correctamente, ¿qué hago?**
R: Verifique que las imágenes sean JPG, PNG o WebP y no excedan 5MB. Limpie la caché del navegador.

**P: ¿Por qué no puedo editar ciertos parques?**
R: Verifique sus permisos de usuario. Es posible que solo tenga acceso de lectura o a parques específicos.
        `},{id:"soporte",title:"Soporte Técnico",level:1,content:`
### Canales de Comunicación

#### Soporte Inmediato
- **Chat en Vivo**: Disponible en horario de oficina (8:00 AM - 6:00 PM)
- **Teléfono**: +52 (33) 1234-5678 ext. 100
- **WhatsApp Business**: +52 (33) 9876-5432

#### Soporte por Email
- **Técnico**: soporte.parksys@guadalajara.gob.mx
- **Administrativo**: admin.parksys@guadalajara.gob.mx
- **Urgencias**: urgencias.parksys@guadalajara.gob.mx

### Procedimiento de Reporte de Problemas

#### Información Requerida
1. **Usuario**: Nombre y rol en el sistema
2. **Fecha/Hora**: Cuándo ocurrió el problema
3. **Acción**: Qué estaba intentando hacer
4. **Error**: Mensaje específico o comportamiento inesperado
5. **Navegador**: Tipo y versión del navegador utilizado
6. **Capturas**: Screenshots que muestren el problema

#### Categorías de Urgencia
**Crítica (Respuesta en 1 hora):**
- Sistema completamente inaccesible
- Pérdida de datos confirmada
- Problemas de seguridad

**Alta (Respuesta en 4 horas):**
- Funcionalidades principales no disponibles
- Errores que impiden operación normal
- Problemas de rendimiento severos

**Media (Respuesta en 24 horas):**
- Funcionalidades específicas con problemas
- Errores menores que permiten trabajo alternativo
- Solicitudes de mejoras importantes

### Acuerdos de Nivel de Servicio (SLA)

#### Disponibilidad del Sistema
- **Objetivo**: 99.5% de uptime mensual
- **Horario de Operación**: 24/7/365
- **Tiempo de Respuesta**: < 2 segundos para operaciones básicas
- **Tiempo de Carga**: < 5 segundos para reportes complejos

#### Soporte Técnico
- **Horario de Atención**: Lunes a viernes 8:00 AM - 6:00 PM
- **Emergencias**: 24/7 para problemas críticos
- **Resolución**: 90% de tickets resueltos en tiempo acordado
- **Satisfacción**: Meta de 95% de satisfacción en encuestas
        `}]}};function At({documentId:t,onBack:e}){const[a,i]=T.useState(""),[s,r]=T.useState(""),[d,n]=T.useState([]),c=Rt[t];if(T.useEffect(()=>{if(!c)return;const l=c.sections.filter(h=>h.title.toLowerCase().includes(a.toLowerCase())||h.content.toLowerCase().includes(a.toLowerCase()));n(l),l.length>0&&!s&&r(l[0].id)},[c,a,s]),!c)return p.jsx(B,{className:"max-w-4xl mx-auto",children:p.jsxs(F,{className:"p-8 text-center",children:[p.jsx(Te,{className:"h-12 w-12 mx-auto mb-4 text-gray-400"}),p.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"Documento no encontrado"}),p.jsx("p",{className:"text-gray-600 mb-4",children:"El documento solicitado no está disponible."}),e&&p.jsxs(re,{onClick:e,variant:"outline",children:[p.jsx(oe,{className:"h-4 w-4 mr-2"}),"Volver"]})]})});const o=d.find(l=>l.id===s)||d[0];return p.jsxs("div",{className:"max-w-7xl mx-auto p-6",children:[p.jsxs("div",{className:"flex items-center justify-between mb-6",children:[p.jsxs("div",{className:"flex items-center gap-3",children:[e&&p.jsxs(re,{onClick:e,variant:"outline",size:"sm",children:[p.jsx(oe,{className:"h-4 w-4 mr-2"}),"Volver"]}),c.icon,p.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:c.title})]}),p.jsxs("div",{className:"relative w-80",children:[p.jsx($e,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),p.jsx(Ie,{placeholder:"Buscar en el documento...",value:a,onChange:l=>i(l.target.value),className:"pl-10"})]})]}),p.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-4 gap-6",children:[p.jsx("div",{className:"lg:col-span-1",children:p.jsxs(B,{className:"sticky top-6",children:[p.jsx(le,{children:p.jsxs(ce,{className:"text-lg flex items-center gap-2",children:[p.jsx(je,{className:"h-4 w-4"}),"Índice"]})}),p.jsx(F,{className:"p-0",children:p.jsx(de,{className:"h-[600px]",children:p.jsx("div",{className:"p-4 space-y-2",children:d.map(l=>p.jsx("button",{onClick:()=>r(l.id),className:`w-full text-left p-2 rounded-md text-sm transition-colors ${s===l.id?"bg-primary text-primary-foreground":"hover:bg-gray-100"}`,children:p.jsxs("div",{className:"flex items-center gap-2",children:[p.jsx(_e,{className:"h-3 w-3"}),l.title]})},l.id))})})})]})}),p.jsx("div",{className:"lg:col-span-3",children:p.jsxs(B,{children:[p.jsx(le,{children:p.jsxs(ce,{className:"flex items-center gap-2",children:[p.jsx(Me,{className:"h-5 w-5"}),o==null?void 0:o.title]})}),p.jsx(F,{children:p.jsx(de,{className:"h-[600px]",children:p.jsx("div",{className:"prose prose-gray max-w-none",children:p.jsx("div",{dangerouslySetInnerHTML:{__html:yt((o==null?void 0:o.content)||"")}})})})})]})})]})]})}export{At as D};
