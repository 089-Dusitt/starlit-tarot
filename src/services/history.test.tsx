import {beforeEach,afterEach,it,expect} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {SettingsProvider,useSettings} from '../app/settings';
import {getHistory,saveHistory,deleteHistory} from './history';
import {defaultContext} from '../features/flow/state';
import {th} from '../i18n/th';
import History from '../features/history/History';
import type {Reading} from '../data/types';
const reading:Reading={version:1,topic:'general',spread:'one',cards:[{index:17,reversed:false}],seed:10,date:'2026-10-21'};
beforeEach(()=>localStorage.clear());afterEach(cleanup);
it('keeps fifty readings, validates storage and only saves opted-in questions',()=>{saveHistory(reading,{...defaultContext,question:'private'});expect(getHistory()[0]).not.toHaveProperty('question');saveHistory({...reading,seed:11},{...defaultContext,question:'remembered',remember:true});expect(getHistory()[0].question).toBe('remembered');for(let i=0;i<60;i++)saveHistory({...reading,seed:i});expect(getHistory()).toHaveLength(50);const id=getHistory()[0].id;deleteHistory(id);expect(getHistory()).toHaveLength(49);deleteHistory();expect(getHistory()).toEqual([]);localStorage.setItem('starlit:history','[{"id":"malformed"}]');expect(getHistory()).toEqual([]);});
it('shows and deletes a history entry through its UI',()=>{saveHistory(reading);render(<SettingsProvider><MemoryRouter><History/></MemoryRouter></SettingsProvider>);expect(screen.getByRole('heading',{name:th.topics.general.name})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:`${th.common.remove} ${th.topics.general.name} ${reading.date}`}));expect(screen.getByText(th.common.empty)).toBeInTheDocument();expect(getHistory()).toEqual([]);});
function Probe(){const{settings,update}=useSettings();return <button onClick={()=>update('reversed',!settings.reversed)}>{String(settings.reversed)}</button>;}
it('persists settings across mounts',()=>{const view=render(<SettingsProvider><Probe/></SettingsProvider>);fireEvent.click(screen.getByRole('button',{name:'true'}));expect(screen.getByRole('button',{name:'false'})).toBeInTheDocument();view.unmount();render(<SettingsProvider><Probe/></SettingsProvider>);expect(screen.getByRole('button',{name:'false'})).toBeInTheDocument();});
