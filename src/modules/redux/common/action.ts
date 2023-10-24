import {commonDispatch} from "@/modules/redux";
import commonStore from "@/modules/redux/common/store";


type State = typeof commonStore.state;

type Key = keyof State;

class Global {
    public set = (state: { [key in Key]?: any; }) => {
        Object.assign(commonStore.state, state);
        commonDispatch.dispatch({type: "common/setState", state});
    };
    
    public get = (key?: Key) => {
        if(key){
            return commonStore.state[key];
        } else {
            return {...commonStore.state}
        }
    };
    
    public remove = (key: Key) => {
        const state = {[key]: undefined}
        Object.assign(commonStore.state, state);
        commonDispatch.dispatch({type: "common/setState", state});
    }
    
}

const global = new Global();

export default global;