import { createStore, applyMiddleware } from 'redux';
import RootReducer from './RootReducer';
import thunk from 'redux-thunk';

export const createAppState = () => createStore(RootReducer, applyMiddleware(thunk));