import eventsStore from "@/modules/redux/events/store";
import {Dispatch} from "@/type";
import db from "@/modules/db";
import tools from "@/modules/tools";


type State = typeof eventsStore.state;

export type Key = { [key in keyof State]?: any; };

const eventsAction = (dispatch: Dispatch) => {
    return {
        setState: (state) => {
            Object.assign(eventsStore.state, state);
            dispatch({type: 'events/setState', state});
        },
        getDayEvents: async (date: { y?: number; m?: number; d?: number }[]) => {
            const [dayEventsList] = await Promise.all([
                db.plans.getPlanListByYMGroup(date)
            ]);
            const dayEvents = {
                ...eventsStore.state.dayEvents
            };
            dayEventsList.forEach((d) => {
                if(dayEvents[d.date]){
                    dayEvents[d.date] = tools.duplicateRemoval([...dayEvents[d.date], d], 'vid')
                } else {
                    dayEvents[d.date] = [d]
                }
            });
            const state = {
                dayEvents
            }
            Object.assign(eventsStore.state, state);
            dispatch({type: 'events/setState', state});
            return state;
        }
    };
};


export default eventsAction;