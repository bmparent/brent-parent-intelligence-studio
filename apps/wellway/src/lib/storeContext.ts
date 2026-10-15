import {createContext,useContext,type Dispatch} from 'react';
import {seedState} from './data';
import type {AppState,Action} from './types';
export const Context = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
  storageError: string;
  recoveryWarning: string;
  saving: boolean;
}>({ state: seedState(), dispatch: () => {}, storageError: "", recoveryWarning: "", saving: false });

export const useStore=()=>useContext(Context);
