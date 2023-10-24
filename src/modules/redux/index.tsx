import React from "react";
import Taro from "@tarojs/taro";
import {
    applyMiddleware,
    combineReducers,
    legacy_createStore as createStore,
    Store,
    compose,
    Dispatch,
    Action
} from "redux";
import thunk from "redux-thunk";
import {connect, Provider} from "react-redux";
import {StoreMap, StoreReducers, StoreState, StoreStores} from "@/type";
import commonStore from "@/modules/redux/common/store";
import planStore from "@/modules/redux/plan/store";
import mineStore from "@/modules/redux/mine/store";
import homeStore from "@/modules/redux/home/store";
import eventsStore from "@/modules/redux/events/store";

export const commonDispatch: {
    dispatch: Dispatch<Action>,
    is?: boolean,
} = {
    dispatch: (action) => action,
};

class CreateStore {
    stores: StoreStores;
    
    constructor (stores: StoreStores | any) {
        this.stores = stores || {};
    }
    
    createState (map: StoreMap) {
        const newMap = {...map};
        newMap.reducers = newMap.reducers ? newMap.reducers : {};
        const newReducers: StoreReducers = {};
        // 设置state对象的set
        newReducers[`${newMap["namespace"]}/setState`] = (_state: StoreState, {state}: { state: StoreState }) => ({..._state, ...state});
        newMap.reducers = newReducers;
        return (state = newMap.state, action: { type: string }) => {
            if (newMap.reducers && newMap.reducers[action.type]) {
                return newMap.reducers[action.type](state, action);
            } else {
                return state;
            }
        };
    };
    
    createReducers (reducers: StoreStores): StoreReducers {
        return Object.entries(reducers).reduce((preItems, item) => ({
            ...preItems,
            [item[1].namespace]: this.createState(item[1])
        }), {});
    };
    
    createStores (): Store {
        return createStore(combineReducers(this.createReducers({...this.stores})), compose(applyMiddleware(thunk)));
    }
}



const stores = new CreateStore({
    // @ts-ignore
    commonStore,
    planStore,
    mineStore,
    homeStore,
    eventsStore
}).createStores();

const Main = connect(undefined, (dispatch) => {
    if (!commonDispatch.is) {
        Object.assign(commonDispatch, {dispatch, is: true});
    }
    return {};
})((props: { children: React.ReactNode }) => {
    return <React.Fragment>
        {props.children}
    </React.Fragment>;
});


const createStoreChildren = (children) => {
    return <Provider store={stores}>
        <Main>
            {children}
        </Main>
    </Provider>;
};

export default createStoreChildren;