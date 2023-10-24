import Taro from "@tarojs/taro";
import db from "@/modules/db/db";
import global from "@/modules/redux/common/action";


class User {
    constructor () {
    
    }
    
    /**用户**/
    public userAdd = (option: { name?: string; avatar?: string; mid?: string }) => {
        return new Promise<{ _id?: string | number }>((resolve, reject) => {
            db.u.add({
                data: option,
                success: (i) => resolve({_id: i['_id']}),
                fail: reject
            });
        });
    };
    
    public userGet = (where) => {
        db.u.where(where).orderBy("_id", 'asc').limit(1).get().then((e) => {
            if (e.data && e.data[0]) {
                this.userSet(e.data[0]);
            }
        });
    };
    
    public userSet = (body) => global.set({userinfo: body});
    
    public userUpdate = (option: { name?: string; avatar?: string; }) => {
        const userinfo = global.get("userinfo");
        if (userinfo && userinfo['_id']) {
            db.u.doc(userinfo['_id']).update({
                data: option,
                success: () => {
                    // @ts-ignore
                    this.userSet({...userinfo, ...option});
                }
            });
        }
    };
    
    /**登陆**/
    public login = (mid) => {
        return new Promise<{ _id?: string | number }>((resolve, reject) => {
            Taro.cloud.callFunction({
                name: 'login',
                success: (e) => {
                    if (e && e.result && e.result['openid']) {
                        const openid = e.result['openid'];
                        db.u.where({_openid: openid}).orderBy("_openid", 'asc').limit(1).get().then((e) => {
                            if (e.data && e.data[0]) {
                                this.userSet(e.data[0]);
                                resolve({_id: e.data[0]._id});
                            } else {
                                const obj = {name: '微信用户'};
                                if (mid) {
                                    obj['mid'] = mid;
                                }
                                this.userAdd(obj).then((e) => {
                                    this.userGet({_id: e._id});
                                    resolve(e);
                                }).catch(reject);
                            }
                        }).catch(() => {
                            Taro.showModal({
                                title: '提示',
                                content: '网络错误',
                                confirmText: '知道了',
                                showCancel: false
                            });
                        });
                    }
                }
            });
        });
    };
}

const user = new User();

export default user;