import{aD as u,j as e,aB as d,T as x,aE as h}from"./index-VG22aPDC.js";import{F as l}from"./flower-CBAEYh02.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=u("Shrub",[["path",{d:"M12 22v-7l-2-2",key:"eqv9mc"}],["path",{d:"M17 8v.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8a5 5 0 0 1 10 0Z",key:"ubcgy"}],["path",{d:"m14 14-2 2",key:"847xa2"}]]),f=({iconType:t,customIconUrl:a,size:s=32,className:n=""})=>{if(t==="custom"&&a)return e.jsx("img",{src:a,alt:"Icono de especie",width:s,height:s,className:`object-cover rounded ${n}`,onError:i=>{var c;const o=i.target;o.style.display="none",(c=o.nextElementSibling)==null||c.classList.remove("hidden")}});const r={size:s,className:`text-green-600 ${n}`};switch(t){case"leaf":return e.jsx(h,{...r});case"trees":return e.jsx(x,{...r});case"shrub":return e.jsx(m,{...r});case"flower":return e.jsx(l,{...r});default:return e.jsx(d,{...r})}};export{f as T};
