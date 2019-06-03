import { combineReducers } from 'redux';
import HomeReducer from '../../Components/Home/HomeReducer';

const RootReducer = combineReducers({
    homeState: HomeReducer
});

export default RootReducer;