import {describe,it,expect} from 'vitest';
import {readStored,writeStored,validSettings} from './storage';
describe('settings storage',()=>{it('validates and restores settings',()=>{writeStored('settings',{reversed:false,motion:true,history:true});expect(readStored('settings',null,validSettings)?.reversed).toBe(false);localStorage.setItem('starlit:settings','{"reversed":"yes"}');expect(readStored('settings',null,validSettings)).toBeNull();});});
