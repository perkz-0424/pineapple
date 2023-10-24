import * as ROUTES from './routes';
import qs from 'qs';
import {
    getCurrentPages,
    navigateBack,
    navigateTo,
    redirectTo,
    reLaunch as _reLaunch,
    switchTab as _switchTab,
    navigateToMiniProgram
} from '@tarojs/taro';

type Params = {[key: string]: any}

export type Router = keyof typeof ROUTES;

export const routers = ROUTES;

function constructUrl (router: Router, params?: Params) {
    let url = ROUTES[router];
    if (params) {
        url += '?' + qs.stringify(params);
    }
    return url;
}


/**
 * 返回
 *
 * @param {navigateBack.Option} [param]
 * @returns
 */
// @ts-ignore
function back (param?: navigateBack.Option) {
    return navigateBack({
        ...param,
        fail: (err) => {
            if (err.errMsg.indexOf('cannot') > -1) {
                // 在第一个页面不能返回时，直接去首页
                return reLaunch('home');
            }
        }
    });
}

/**
 * 前进
 *
 * @param {Router} router
 * @param {Params} [params]
 * @returns
 */
function push (router: Router, params?: Params) {
    return navigateTo({
        url: constructUrl(router, params),
    });
}

/**
 * 重定向
 *
 * @param {Router} router
 * @param {Params} [params]
 * @returns
 */
function redirect (router: Router, params?: Params) {
    return redirectTo({
        url: constructUrl(router, params),
    });
}

/**
 * 重新加载
 *
 * @param {Router} router
 * @param {Params} [params?]
 * @returns
 */
function reLaunch (router: Router, params?: Params) {
    return _reLaunch({
        url: constructUrl(router, params),
    });
}

/**
 * tab跳转
 *
 * @param {Router} router
 * @param {Params} [params]
 * @returns
 */

export function switchTab (router: 'home' | 'book' | 'mine', params?: Params) {
    return _switchTab({
        url: constructUrl(router, params),
    });
}


function redirectToWeapp (appId: string) {
    return navigateToMiniProgram({
        appId,
    });
}

export default {
    back,
    history: getCurrentPages,
    push,
    reLaunch,
    redirect,
    switchTab,
    routers,
    redirectToWeapp
};





