import '@testing-library/jest-dom/vitest';

Object.defineProperty(window,'matchMedia',{writable:true,value:()=>({matches:false,addEventListener:()=>{},removeEventListener:()=>{},addListener:()=>{},removeListener:()=>{}})});
window.scrollTo=()=>{};

globalThis.fetch=async()=>{throw Error('External network is disabled in tests');};
