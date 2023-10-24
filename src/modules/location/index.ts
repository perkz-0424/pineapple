import Taro from "@tarojs/taro";
import Setting from "@/modules/setting";
import dayjs from "dayjs";
// import QqMap from '@/modules/qqmap/qqmap-wx-jssdk.min.js';
import global from "@/modules/redux/common/action";
import request from "@/modules/request";

const QQ_MAP_KEY = '3RZBZ-UE36V-ZN6PR-53BYB-MPY7T-MJB2G';

interface ChooseLocation {
    /** 目标地纬度 */
    latitude?: number;
    /** 目标地经度 */
    longitude?: number;
    /** 地址 */
    address?: string;
}

type L = {
    latitude: number;
    longitude: number
}

class Location extends Setting {
    private isAuthorize: boolean;
    private preAddress?: { address?: { latitude: number; longitude: number }; timeStamp: number };
    private timer?: NodeJS.Timeout;
    private request?: Taro.RequestTask<any>;
    private searching?: boolean;
    
    // private qqMapSdk = new QqMap({key: QQ_MAP_KEY});
    
    constructor () {
        super();
    }
    
    public get getAuthorize () {
        return this.isAuthorize;
    }
    
    public getRecommendByCenter = (e: { latitude: number; longitude: number }) => {
        return new Promise<any[]>((resolve) => {
            Taro.request({
                url: `https://apis.map.qq.com/ws/place/v1/search/?keyword=推荐&key=${QQ_MAP_KEY}&page_index=1&page_size=10&boundary=nearby(${e.latitude},${e.longitude},1000,1)&orderby=_distance`,
                fail: () => {
                    resolve([]);
                },
                success: (e) => {
                    if (e.data && e.data.data) {
                        resolve(e.data.data);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    };
    
    public searchByKeyword = (keyword: string) => {
        return new Promise<any[]>((resolve) => {
            if (keyword) {
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    if (this.searching && this.request) {
                        this.request.abort();
                    }
                    this.searching = true;
                    this.request = Taro.request({
                        url: `https://apis.map.qq.com/ws/place/v1/suggestion/?keyword=${keyword}&key=${QQ_MAP_KEY}&page_size=1&page_index=1`,
                        fail: () => {
                            this.searching = false;
                            resolve([]);
                        },
                        success: (e) => {
                            this.searching = false;
                            if (e.data && e.data.data) {
                                resolve(e.data.data);
                            } else {
                                resolve([]);
                            }
                        }
                    });
                }, 50);
            } else {
                resolve([]);
            }
        });
    };
    
    // 打开权限
    public authorize = () => {
        return new Promise<boolean>((resolve) => {
            Taro.authorize({
                scope: 'scope.userFuzzyLocation',
                success: () => {
                    this.isAuthorize = true;
                    resolve(true);
                },
                fail: () => {
                    this.isAuthorize = false;
                    resolve(false);
                }
            });
        });
    };
    
    public drawLine = (routes) => {
        const getLinePoint = this.getLinePoint;
        return new Promise<{ ps: any[], cs: L[] }>((resolve) => {
            if (routes.length >= 2) {
                const mks = routes.filter((i) => i.lat && i.lng);
                const ps: { from: L, to: L, id: string }[] = [];
                let cs: any[] = [];
                let a: any[] = [];
                for (let i = 0; i < mks.length - 1; i++) {
                    ps.push({
                        from: {latitude: mks[i].lat, longitude: mks[i].lng},
                        to: {latitude: mks[i + 1].lat, longitude: mks[i + 1].lng},
                        id: `${mks[i].lat}-${mks[i].lng}-${mks[i + 1].lat}-${mks[i + 1].lng}`
                    });
                }
                const g = (function* x (ps) {
                    for (let i = 0; i < ps.length; i++) {
                        const item = ps[i];
                        yield getLinePoint(item.from, item.to, item.id);
                    }
                })(ps);
                (function next () {
                    const {value, done} = g.next();
                    if (!done) {
                        value.then((e) => {
                            if (e) {
                                a = [...a, e];
                                const p = e['points'] || [];
                                if (p.length >= 2) {
                                    const e = p[p.length - 1];
                                    if (cs.length) {
                                        const f = p[0];
                                        cs = [...cs, f, e];
                                    } else {
                                        cs = [...cs, e];
                                    }
                                }
                            }
                            next();
                        });
                    } else {
                        resolve({ps: a, cs});
                    }
                })();
            } else {
                resolve({ps: [], cs: []});
            }
        });
    };
    
    public getLinePoint = (from: L, to: L, id: string) => {
        return new Promise((resolve) => {
            Taro.request({
                url: `https://apis.map.qq.com/ws/direction/v1/walking/?key=${QQ_MAP_KEY}&from=${from.latitude},${from.longitude}&to=${to.latitude},${to.longitude}`,
                success: (e) => {
                    const result = e.data.result;
                    if (result) {
                        const route = result.routes[0];
                        const coors = route.polyline;
                        const points: L[] = [];
                        for (let a = 2; a < coors.length; a++) {
                            coors[a] = Number(coors[a - 2]) + Number(coors[a]) / 1000000;
                        }
                        for (let b = 0; b < coors.length; b += 2) {
                            points.push({latitude: coors[b], longitude: coors[b + 1]});
                        }
                        resolve({
                            points,
                            color: '#2c3d8b',
                            width: 2,
                            borderColor: '#13227a',
                            borderWidth: 2,
                            arrowLine: true,
                            id
                        });
                    } else {
                        resolve(undefined);
                    }
                },
                fail: () => resolve(undefined)
            });
        });
    };
    
    // 查看位置 address 具体位置 latitude维度 longitude经度...
    public openLocation = Taro.openLocation;
    
    // 选择位置 address 具体位置 latitude维度 longitude经度...
    public chooseLocation = (chooseLocationObj: ChooseLocation = {}) => {
        return new Promise<{ address: string; latitude: number; longitude: number; name: string; }>((resolve, reject) => {
            Taro.chooseLocation(chooseLocationObj).then((response) => {
                resolve(response);
            }).catch((error) => {
                if (error.errMsg === 'chooseLocation:fail auth deny' || error.errMsg.indexOf('den') != -1) {
                    this.openSetting({
                        content: '请点击确定手动打开定位授权',
                        title: '获取地址失败！',
                    });
                } else {
                    reject(error);
                }
            });
        });
    };
    
    // 自动定位 openSetting 打开位置权限 reset更新定位
    public autoLocation = (openSetting?: boolean, reset?: boolean) => {
        return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
            if (!this.isAuthorize) {
                reject({errMsg: ''});
                return;
            }
            // 2分钟之内有缓存就走缓存
            if (!reset && this.preAddress && this.preAddress.address && (dayjs().valueOf() - this.preAddress.timeStamp) < 120000) {
                resolve(this.preAddress.address);
                return;
            }
            Taro.getFuzzyLocation({
                type: 'gcj02',
                success: (response) => {
                    if (response) {
                        this.preAddress = {
                            address: response,
                            timeStamp: dayjs().valueOf(),
                        };
                        resolve(response);
                        
                    } else {
                        reject(response);
                    }
                },
                fail: (error) => {
                    if (openSetting) {
                        // if (error.errMsg === 'getLocation:fail auth deny' || error.errMsg.indexOf('den') != -1) {
                        //     this.openSetting({
                        //         content: '请点击确定手动打开定位授权',
                        //         title: '获取地址失败！',
                        //         authSetting: 'scope.userLocation'
                        //     }).then(() => this.autoLocation().then(resolve)).catch(() => reject(error));
                        // } else {
                        //     reject(error);
                        // }
                        reject(error);
                    } else {
                        reject(error);
                    }
                }
            });
        });
    };
    
    // 设置全局的位置信息
    public setLocation = (location: { address?: string; latitude?: number; longitude?: number; province?: string; city?: string }) => {
        global.set({location});
    };
    
    // 位置转换
    public convertLocation = (location: { latitude: number; longitude: number }) => {
        return new Promise<{
            status: number; body: {
                address?: string;
                city?: string;
                district?: string;
                lat?: number;
                lng?: number;
                nation?: string;
                province?: string;
                street?: string;
                street_number?: string;
                landmark?: string;
                recommend?: string;
                rough?: string;
                standard_address?: string;
            }
        }>((resolve) => {
            request.geocoder({lat: location.latitude, lng: location.longitude}).then((e) => {
                if (e) {
                    const addressReference = e.address_reference || {};
                    const landmark = (addressReference.landmark_l2 || {}).title || '';
                    resolve({
                        status: 1,
                        body: {
                            ...(e.address_component || {}),
                            ...(e.location || {}),
                            ...(e.formatted_addresses || {}),
                            address: e.address,
                            landmark
                        }
                    });
                } else {
                    resolve({status: 0, body: {}});
                }
            });
        });
    };
    
}

const location = new Location();


export default location;