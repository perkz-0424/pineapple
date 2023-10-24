import planStore from "@/modules/redux/plan/store";
import {Dispatch} from "@/type";
import {setStorageSync, removeStorageSync} from "@tarojs/taro";


type State = typeof planStore.state;

export type Key = { [key in keyof State]?: any; };

const planAction = (dispatch: Dispatch) => {
    return {
        setState: (state) => {
            Object.assign(planStore.state, state);
            dispatch({type: 'plan/setState', state});
        },
        
        init: (plan) => {
            const state = {
                plan: {...(plan || {}), ready: true}
            };
            Object.assign(planStore.state, state);
            dispatch({type: 'plan/setState', state});
        },
        changePlan: (plan) => {
            const state = {
                plan: {
                    ...planStore.state.plan,
                    ...plan,
                    isChange: true
                }
            };
            Object.assign(planStore.state, state);
            dispatch({type: 'plan/setState', state});
        },
        setPrePlan: (prePlan) => {
            if (prePlan) {
                setStorageSync("PRE_PLAN", prePlan);
            } else {
                removeStorageSync("PRE_PLAN");
            }
        },
        setCopyRoute: (route) => {
            const newRoute = {...route};
            delete newRoute.ct;
            delete newRoute.rid;
            delete newRoute.pid;
            delete newRoute.vid;
            delete newRoute.uid;
            const state = {
                copyRoute: newRoute
            };
            Object.assign(planStore.state, state);
            dispatch({type: 'plan/setState', state});
        }
    };
};


export default planAction;