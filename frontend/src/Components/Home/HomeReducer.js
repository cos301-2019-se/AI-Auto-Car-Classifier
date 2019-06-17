import InitialState from '../../Shared/State/InitialState';
import * as HomeTypes from './HomeActionTypes';

const HomeReducer = (state = InitialState.homeState, action) => {
    switch (action.type) {
    case HomeTypes.UPLOAD_IMAGE_INIT:
    case HomeTypes.UPLOAD_IMAGE_FAILURE:
    case HomeTypes.UPLOAD_IMAGE_SUCCESS:
    case HomeTypes.UPDATE_IMAGE:
    case HomeTypes.UPDATE_CAR_DETAILS:
    case HomeTypes.GET_CAR_DETAILS_INIT:
    case HomeTypes.GET_CAR_DETAILS_FAILURE:
    case HomeTypes.GET_CAR_DETAILS_SUCCESS:
        return {
            ...state,
            ...action.payload
        };
    default: 
        return state;
    }
};

export default HomeReducer;