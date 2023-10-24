import db from "@/modules/db/db";
import global from "@/modules/redux/common/action";
import dayjs from "dayjs";
import tools from "@/modules/tools";

function getPlan (plan) {
    return new Promise((resolve) => {
        const where = plan._id ? {_id: plan._id} : {};
        db.p.where({
            ...tools.removeEmpty({
                uid: plan.uid,
                pid: plan.pid,
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

function updatePlan (plan) {
    return new Promise(async (resolve) => {
        const p = await getPlan(plan);
        if (p) {
            const newObj = tools.removeEmpty({
                ...plan,
                ...p,
                _id: p['_id'],
                uid: p['uid'] || plan['uid'],
                pid: p['pid'] || plan['pid']
            });
            const _id = newObj['_id'];
            delete newObj._id;
            delete newObj._openid;
            db.p.doc(_id).update({
                data: newObj,
                success: () => resolve({_id: newObj['_id']}),
                fail: () => resolve({})
            });
        } else {
            db.p.add({
                data: plan,
                success: (i) => resolve({_id: i['_id']}),
                fail: () => resolve({})
            });
        }
    });
}

// 获取今天有关的计划
async function getMyPlanToday () {
    const userinfo = global.get("userinfo") || {};
    return new Promise<any[]>((resolve) => {
        if (userinfo['_id']) {
            const stamp = dayjs().valueOf();
            db.p.where(db.command.and([{
                uid: userinfo['_id'],
                startTimeStamp: db.command.lte(stamp),
                endTimeStamp: db.command.gte(stamp),
            }])).limit(20).skip(0).get().then((e) => {
                resolve(e.data || []);
            }).catch(() => {
                resolve([]);
            });
        } else {
            resolve([]);
        }
    });
}

function getPlanByPid (pid) {
    const userinfo = global.get("userinfo") || {};
    return new Promise<any>((resolve) => {
        if (userinfo['_id']) {
            db.p.where(db.command.and([{
                uid: userinfo['_id'],
                pid
            }])).get().then((e) => {
                resolve((e.data || [])[0]);
            }).catch(() => {
                resolve(undefined);
            });
        } else {
            resolve(undefined);
        }
    });
}


const plan = {
    updatePlan,
    getMyPlanToday,
    getPlanByPid
};

export default plan;