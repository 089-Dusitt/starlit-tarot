import {Component,type ReactNode} from 'react';
import {th} from '../i18n/th';
export class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}componentDidCatch(){/* Avoid logging private question text. */}render(){if(this.state.failed)return <main className="page narrow center"><h1>{th.errors.title}</h1><p>{th.errors.body}</p><button className="button gold" onClick={()=>window.location.reload()}>{th.errors.reload}</button></main>;return this.props.children;}}

