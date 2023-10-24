import {Router} from "@/modules/navigator";


export {Router};

export type MethodApi = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type Method =
    | 'DELETE'
    | 'GET'
    | 'PATCH'
    | 'POST'
    | 'PUT';

export type VoidFunction<F = {}> = (f?: F) => void;

export interface Params {
    [key: string]: string | number | boolean | undefined;
}

export type StoreState = {
    [key: string]: string | number | boolean | { [key: string]: StoreState } | StoreState[]
}

export type StoreMap<T = any, S = any> = {
    namespace: string;
    state: S | StoreState;
    reducers?: {
        [key: string]: (state: StoreState, params: T) => StoreState
    },
    [key: string]: any;
}
export type StoreStores<T = any> = {
    [key: string]: {
        namespace: string;
        state: StoreState;
        reducers?: {
            [key: string]: (state: StoreState, params: T) => StoreState
        };
        [key: string]: any;
    };
};

export type StoreReducers<T = any> = {
    [key: string]: T
}

export type Dispatch<P = any, C = (payload: P) => void> = (
    action: {
        type: string;
        payload?: P;
        callback?: C;
        [key: string]: any;
    }
) => any;

declare var wx: any;