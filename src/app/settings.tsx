import {createContext,useContext,useState,type ReactNode} from 'react';
import {readStored,writeStored,validSettings,type Settings} from '../services/storage';
const defaults=()=>({reversed:true,motion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,history:true});
const Context=createContext<{settings:Settings;update:(key:keyof Settings,value:boolean)=>void}>({settings:{reversed:true,motion:false,history:true},update:()=>{}});
export function SettingsProvider({children}:{children:ReactNode}){const[settings,setSettings]=useState(()=>readStored('settings',defaults(),validSettings));function update(key:keyof Settings,value:boolean){setSettings(old=>{const next={...old,[key]:value};writeStored('settings',next);return next;});}return <Context.Provider value={{settings,update}}>{children}</Context.Provider>;}
export const useSettings=()=>useContext(Context);
