import mineStore from "@/modules/redux/mine/store";
import {Dispatch} from "@/type";


type State = typeof mineStore.state;

export type Key = { [key in keyof State]?: any; };

const mineAction = (dispatch: Dispatch) => {
    return {
        setState: (state) => {
            Object.assign(mineStore.state, state);
            dispatch({type: 'mine/setState', state});
        }
    };
};


export default mineAction;