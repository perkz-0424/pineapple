import db from "@/modules/db/db";
import tools from "@/modules/tools";
import global from "@/modules/redux/common/action";


const timer: { [key: string]: NodeJS.Timeout } = {};

function timeout (name) {
    return new Promise((resolve) => {
        timer[name] = setTimeout(() => {
            resolve(undefined);
        }, 15000);
    });
}

function getPlan (plan) {
    return new Promise((resolve) => {
        const where = plan._id ? {_id: plan._id} : {};
        db.v.where({
            ...tools.removeEmpty({
                vid: plan.vid,
                pid: plan.pid,
                uid: plan.uid,
            }),
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

function getPlans (plan) {
    return new Promise((resolve) => {
        const where = plan._id ? {_id: plan._id} : {};
        db.v.where({
            ...tools.removeEmpty({
                vid: plan.vid,
                pid: plan.pid,
                uid: plan.uid,
            }),
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


function changePlan (plan) {
    return new Promise(async (resolve) => {
        const r = await getPlan(plan);
        if (r) {
            const newObj = tools.removeEmpty({
                ...r,
                ...plan,
                _id: r['_id'],
                uid: r['uid'] || plan['uid'],
                pid: r['pid'] || plan['pid'],
                vid: r['vid'] || plan['vid'],
            });
            const _id = newObj['_id'];
            delete newObj._id;
            delete newObj._openid;
            db.v.doc(_id).update({
                data: newObj,
                success: () => resolve({_id: newObj['_id']}),
                fail: () => resolve({})
            });
        } else {
            db.v.add({
                data: plan,
                success: (i) => resolve({_id: i['_id']}),
                fail: () => resolve({})
            });
        }
    });
}

function updatePlan (plan) {
    return new Promise(async (resolve) => {
        const name = tools.randCode();
        await Promise.race([
            timeout(name),
            changePlan(plan),
        ]);
        timer[name] && clearTimeout(timer[name]);
        delete timer[name];
        resolve(true);
    });
}

function* updatePlansA (plans, callback) {
    for (let i = 0; i < plans.length; i++) {
        yield updatePlan(plans[i]);
        callback && callback((i + 1) / plans.length);
    }
}

function updatePlans (plans, callback) {
    if (plans.length) {
        const g = updatePlansA(plans, callback);
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

function getPlanListByYM (y?: number, m?: number, d?: number) {
    const userinfo = global.get("userinfo") || {};
    return new Promise((resolve) => {
        if (userinfo['_id']) {
            db.v.where(db.command.and([{
                uid: userinfo['_id'],
                ...tools.removeEmpty({
                    y, m, d
                })
            }])).get().then((e) => {
                resolve(e.data || []);
            }).catch(() => {
                resolve([]);
            });
        } else {
            resolve([]);
        }
    });
}

async function getPlanListByYMGroup (date: { y?: number; m?: number; d?: number }[]) {
    const list = await Promise.all(date.map((d) => getPlanListByYM(d.y, d.m, d.d)));
    return list.flat(2) as any[];
}

async function getPlanListByVid (vid: string[], uid?: string) {
    const userinfo = global.get("userinfo") || {};
    const e = await Promise.all(vid.map((v) => {
        return getPlans({vid: v, uid: uid || userinfo['_id']});
    }));
    return e.flat(2) as any[];
}

const plans = {
    updatePlans,
    getPlanListByYMGroup,
    changePlan,
    getPlanListByVid
};

export default plans;