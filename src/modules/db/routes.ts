import db from "@/modules/db/db";
import tools from "@/modules/tools";
import base from "@/modules/base";
import global from "@/modules/redux/common/action";


const timer: { [key: string]: NodeJS.Timeout } = {};

function timeout (name) {
    return new Promise((resolve) => {
        timer[name] = setTimeout(() => {
            resolve(undefined);
        }, 15000);
    });
}

function getRoute (route) {
    return new Promise((resolve) => {
        const where = route._id ? {_id: route._id} : {};
        const obj = tools.removeEmpty({
            vid: route.vid,
            rid: route.rid,
            pid: route.pid,
            uid: route.uid,
        });
        db.r.where({
            ...obj,
            ...where
        }).limit(1).get().then((e) => {
            if (e.data && e.data[0]) {
                resolve(e.data[0]);
            } else {
                resolve(undefined);
            }
        });
    });
}

function getRoutes (route) {
    return new Promise((resolve) => {
        const where = route._id ? {_id: route._id} : {};
        const obj = tools.removeEmpty({
            vid: route.vid,
            rid: route.rid,
            pid: route.pid,
            uid: route.uid,
        });
        db.r.where({
            ...obj,
            ...where
        }).get().then((e) => {
            if (e.data) {
                resolve(e.data || []);
            } else {
                resolve([]);
            }
        });
    });
}


function changeRoute (route) {
    return new Promise(async (resolve) => {
        const r = await getRoute(route);
        if (r) {
            const newObj = {
                ...tools.removeEmpty({
                    ...r,
                    ...route,
                    _id: r['_id'],
                    uid: r['uid'] || route['uid'] || '',
                    pid: r['pid'] || route['pid'] || '',
                    vid: r['vid'] || route['vid'] || '',
                    rid: r['rid'] || route['rid'] || '',
                }),
            };
            const _id = newObj['_id'];
            delete newObj._id;
            delete newObj._openid;
            db.r.doc(_id).update({
                data: newObj,
                success: () => resolve({_id: newObj['_id']}),
                fail: () => resolve({})
            });
        } else {
            db.r.add({
                data: route,
                success: (i) => resolve({_id: i['_id']}),
                fail: () => resolve({})
            });
        }
    });
}


const updateImage = async (e) => {
    if (e.n) {
        const url = await Promise.race([
            base.db.common.updateFile(e.url),
            timeout(e.url)
        ]);
        if (url) {
            timer[e.url] && clearTimeout(timer[e.url]);
            delete timer[e.url];
            return {url};
        } else {
            // 再传一次
            const url = await Promise.race([
                base.db.common.updateFile(e.url),
                timeout(e.url)
            ]);
            if (url) {
                timer[e.url] && clearTimeout(timer[e.url]);
                delete timer[e.url];
                return {url};
            } else {
                return {
                    ...e,
                    o: true
                };
            }
        }
    } else {
        return {url: e.url};
    }
};

const updateItem = async (item) => {
    const newIs = await Promise.all((item.images || []).map((e) => updateImage(e)));
    return {
        ...item,
        images: newIs.filter(Boolean)
    };
};

function updateRoute (route) {
    return new Promise(async (resolve) => {
        const routeN = await updateItem(route);
        const name = tools.randCode();
        await Promise.race([
            timeout(name),
            changeRoute(routeN),
        ]);
        timer[name] && clearTimeout(timer[name]);
        delete timer[name];
        resolve(true);
    });
}

function* updateRoutesA (routes, callback) {
    for (let i = 0; i < routes.length; i++) {
        yield updateRoute(routes[i]);
        callback && callback((i + 1) / routes.length);
    }
}

function updateRoutes (routes, callback) {
    if (routes.length) {
        const g = updateRoutesA(routes, callback);
        (function next () {
            const {value, done} = g.next();
            if (!done) {
                value.then(() => {
                    next();
                });
            }
        })();
    } else {
        callback(1);
    }
}

async function getRoutesByVid (vid: string[], uid?: string) {
    const userinfo = global.get("userinfo") || {};
    const e = await Promise.all(vid.map((r) => {
        return getRoutes({vid: r, uid: uid || userinfo['_id']});
    }));
    return e.flat(2) as any[];
}

const routes = {
    updateRoutes,
    getRoutesByVid
};

export default routes;