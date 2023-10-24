import homeStore from "@/modules/redux/home/store";
import {Dispatch} from "@/type";
import db from "@/modules/db";

type State = typeof homeStore.state;
import Taro from "@tarojs/taro";

export type Key = { [key in keyof State]?: any; };


const homeAction = (dispatch: Dispatch) => {
    return {
        setState: (state) => {
            Object.assign(homeStore.state, state);
            dispatch({type: 'home/setState', state});
        },
        getMyPlan: async (skip?: boolean) => {
            const list = await db.plan.getMyPlanToday();
            if (!skip) {
                const state = {myPlan: list};
                Object.assign(homeStore.state, state);
                dispatch({type: 'home/setState', state});
            }
            if(list[0]){
                Taro.setStorageSync("PLAN_TODAY", [list[0]]);
            } else {
                Taro.setStorageSync("PLAN_TODAY", []);
            }
            return list;
        }
    };
};


export default homeAction;