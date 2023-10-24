import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {View, Map, Swiper, Text, CustomWrapper, Button, Input} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import planAction from "@/modules/redux/plan/action";
import dayjs from "dayjs";
import Scenic from "@/components/Scenic";
import Ico from "@/components/Ico";
import Top from "@/components/Top";
import Warn from "@/components/Warn";
import Right from "@/components/Right";
import Add from "@/components/Add";
import MyProgress from "@/components/MyProgress";
import homeAction from "@/modules/redux/home/action";
import eventsAction from "@/modules/redux/events/action";
import ShowImage from "@/components/ShowImage";
import Bottom from "@/components/Bottom";
import {MapProps} from "@tarojs/components/types/Map";

const getParams = (params) => {
    const {type, did, cte, day, vid} = params;
    return {
        type: decodeURIComponent(type || ''),
        did: Number(did || '0'),
        cte: Number(cte || '0'),
        day: decodeURIComponent(day || ''),
        vid: decodeURIComponent(vid || ''),
    };
};

function Index (props) {
    const params = React.useRef<{
        type: string;
        did: number;
        cte: number;
        vid: string;
    }>(getParams(Taro.useRouter().params)).current;
    const isChange = React.useRef(false);
    const newRoute = React.useRef({ct: dayjs().valueOf()}).current;
    const [showImageObj, setShowImageObj] = React.useState<{ [key: number | string]: string }>({});
    const [item, setItem] = React.useState<any>({route: [newRoute]});
    const timer = React.useRef<NodeJS.Timeout>();
    const timerScale = React.useRef<NodeJS.Timeout>();
    const deleteLoading = React.useRef<boolean>();
    const navigationBarTitleText = React.useRef(dayjs(`${params.did}`, "YYYYMMDD").format("MM月DD日")).current;
    const [showMap, setShowMap] = React.useState(false);
    const [showFixed, setShowFixed] = React.useState(false);
    const [showBack, setShowBack] = React.useState(false);
    const [showOther, setShowOther] = React.useState<any>({show: false, item: {}});
    const [showFuzzyLocation, setShowFuzzyLocation] = React.useState<{
        show: boolean;
        location: { scenicSpotsName?: string; lat?: number; lng?: number; is?: boolean; }
    }>({show: false, location: {}});
    const [scale, setScale] = React.useState(14);
    const [showIllustrate, setShowIllustrate] = React.useState(false);
    const timerObj = React.useRef<{ [key: string]: NodeJS.Timeout }>({});
    const [percent, setPercent] = React.useState({num: 0, show: false});
    const showImage = React.useRef<ShowImage>();
    const [defaultImage, setDefaultImage] = React.useState({d: '', e: ''});
    const [point, setPoint] = React.useState<{ latitude?: number; longitude?: number }>({});
    const clickMarkS = React.useRef(false);
    const [hasChangedRoute, setHasChangedRoute] = React.useState<(string | number)[]>([]);
    const [recommend, setRecommend] = React.useState<any[]>([]);
    const [showRecommend, setShowRecommend] = React.useState<any>({show: false, item: {}});
    const mapContext = React.useRef<Taro.MapContext>();
    const route = item.route || [];
    
    React.useEffect(() => {
        Taro.authorize({scope: 'scope.userLocation'});
        mapContext.current = Taro.createMapContext("myMap");
        getItem();
        return () => {
            timer.current && clearTimeout(timer.current);
            timerScale.current && clearTimeout(timerScale.current);
            Object.values(timerObj).forEach((e) => {
                e && clearTimeout(e);
            });
        };
    }, []);
    
    const changeItem = React.useCallback((newItem, isInit?: boolean) => {
        setItem({
            ...item,
            ...newItem
        });
        if (!isInit) {
            isChange.current = true;
        }
    }, [isChange.current, item, setItem]);
    
    
    const changeRoute = React.useCallback((i, v, m?: boolean) => {
        const or = [...(item.route || [])];
        const oi = or[i] || {ct: dayjs().valueOf()};
        or[i] = {...oi, ...v};
        if (v.lat && !m) {
            changeItem({
                route: or,
                lat: v.lat,
                lng: v.lng
            });
        } else {
            changeItem({route: or});
        }
        if (!hasChangedRoute.includes(or[i].ct)) {
            setHasChangedRoute([...hasChangedRoute, or[i].ct]);
        }
        return or;
    }, [
        item,
        changeItem,
        hasChangedRoute,
        setHasChangedRoute
    ]);
    
    const getDefaultImage = React.useCallback(() => {
        return new Promise((resolve) => {
            showImage.current!.draw().then((e) => {
                setDefaultImage({d: e, e: e});
                resolve({d: e, e: e});
            });
        });
    }, [showImage.current, setDefaultImage]);
    
    const initEvent = React.useCallback(() => {
        const newRouteList = [newRoute];
        const routeOne = newRouteList[0];
        const obj = {
            route: newRouteList,
            cte: params.cte || routeOne.ct,
        };
        if (!obj['lat']) {
            const location = props.location.latitude ? {
                lat: props.location.latitude,
                lng: props.location.longitude,
            } : {
                lat: base.common.defaultLocation.latitude,
                lng: base.common.defaultLocation.longitude,
            };
            obj['lat'] = location.lat;
            obj['lng'] = location.lng;
        }
        changeItem(obj, true);
    }, [
        props.location,
        changeItem,
    ]);
    
    const getItem = React.useCallback(async () => {
        switch (params.type) {
            case "plan":
                Taro.showLoading({title: "加载中", mask: true});
                const plans = props.plan.plans;
                const item = plans.find((i) => i.did === params.did);
                const newRouteList = (item.route && item.route.length) ? item.route : [newRoute];
                const routeOne = newRouteList[0];
                const obj = {
                    route: newRouteList,
                    ...item,
                    cte: params.cte || routeOne.ct,
                };
                if (!obj.lat) {
                    const location = (routeOne && routeOne.lat) ? {
                        lat: routeOne.lat,
                        lng: routeOne.lng,
                    } : (props.location.latitude ? {
                        lat: props.location.latitude,
                        lng: props.location.longitude,
                    } : {
                        lat: base.common.defaultLocation.latitude,
                        lng: base.common.defaultLocation.longitude,
                    });
                    obj.lat = location.lat;
                    obj.lng = location.lng;
                }
                changeItem(obj, true);
                await getDefaultImage();
                if (item.route && item.route.length) {
                    await draw([obj], setShowImageObj);
                }
                Taro.hideLoading();
                return;
            case "event":
                if (params.vid) {
                    Taro.showLoading({title: "加载中", mask: true});
                    Promise.all([
                        base.db.plans.getPlanListByVid([params.vid]),
                        base.db.routes.getRoutesByVid([params.vid]),
                    ]).then(async ([v, r]) => {
                        if (v[0]) {
                            const item = {...v[0]};
                            item['route'] = r && r.length ? r : [newRoute];
                            item['cte'] = item.cte || item['route'][0].ct;
                            changeItem(item, true);
                            await getDefaultImage();
                            await draw([item], setShowImageObj);
                            Taro.hideLoading();
                        } else {
                            initEvent();
                            await getDefaultImage();
                            Taro.hideLoading();
                        }
                    }).catch(async () => {
                        await getDefaultImage();
                        Taro.hideLoading();
                    });
                } else {
                    Taro.showLoading({title: "加载中", mask: true});
                    initEvent();
                    await getDefaultImage();
                    Taro.hideLoading();
                }
                return;
            default:
                return;
        }
    }, [
        props.plan,
        props.location,
        changeItem,
        initEvent,
    ]);
    
    const submit = React.useCallback(async () => {
        setShowBack(false);
        switch (params.type) {
            case "plan":
                const plans = [...props.plan.plans];
                const index = plans.findIndex((i) => i.did === params.did);
                plans[index] = {...item};
                props.changePlan({plans});
                base.navigator.back();
                return;
            case "event":
                const day = dayjs(`${params.did}`, "YYYYMMDD");
                setPercent({show: true, num: 0});
                const planItem = {
                    ...item,
                    uid: item.uid ? item.uid : props.uid,
                    vid: item.vid ? item.vid : base.tools.randCode(),
                    date: day.format("YYYY-MM-DD"),
                    y: day.year(),
                    m: day.month() + 1,
                    d: day.date(),
                    did: params.did,
                };
                const routes = (item.route || []).map((e, current) => {
                    return {
                        uid: e.uid ? e.uid : planItem.uid, // 用户id
                        vid: e.vid ? e.vid : planItem.vid, // 计划里的天id
                        rid: e.rid ? e.rid : base.tools.randCode(), // 每天的路线id
                        current,
                        ...e,
                    };
                });
                delete planItem.route;
                base.db.routes.updateRoutes(routes, (k) => {
                    setPercent({show: true, num: 0.6 * k});
                    if (k === 1) {
                        base.db.plans.changePlan(planItem).then(() => {
                            setPercent({show: true, num: 0.8});
                            Promise.all([
                                base.common.isToday(day) ? props.getMyPlan() : base.common.getEmpty(),
                                props.getDayEvents([{y: planItem.y, m: planItem.m, d: planItem.d}])
                            ]).then(() => {
                                setPercent({show: false, num: 1});
                                if (params.vid) {
                                    base.global.set({changeVid: params.vid});
                                    base.navigator.back();
                                } else {
                                    base.navigator.redirect("events", {vid: JSON.stringify([planItem.vid || params.vid])});
                                }
                            });
                        });
                    }
                });
                return;
            default:
                return;
        }
    }, [
        setShowBack,
        showBack,
        props.plan,
        props.changePlan,
        percent,
        item,
        props.getDayEvents,
        props.getMyPlan,
        setPercent,
    ]);
    
    const current = React.useMemo(() => {
        if (item.cte) {
            const i = route.find((e) => e.ct === item.cte);
            if (i) {
                return route.findIndex((e) => e.ct === item.cte);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }, [
        item.cte,
        route
    ]);
    
    const changeRouteNumber = React.useCallback((id?: number) => {
        if (deleteLoading.current) {
            return;
        }
        if (id === undefined) {
            if (route.length >= 5) {
                Taro.showToast({title: '添加的景点达到上限', icon: 'none'});
            } else {
                deleteLoading.current = true;
                timer.current && clearTimeout(timer.current);
                Taro.showLoading({mask: true, title: '添加中'});
                const newRoute = {
                    ct: dayjs().valueOf()
                };
                changeItem({
                    route: [...(item.route || []), newRoute],
                });
                Taro.nextTick(() => {
                    changeItem({
                        route: [...(item.route || []), newRoute],
                        cte: newRoute.ct
                    });
                    timer.current = setTimeout(() => {
                        Taro.hideLoading();
                        deleteLoading.current = false;
                    }, 200);
                });
            }
        } else {
            const list = [...(item.route || [])].filter((i) => i.ct !== id);
            deleteLoading.current = true;
            if (list.length) {
                timer.current && clearTimeout(timer.current);
                Taro.showLoading({mask: true, title: '删除中'});
                let last = list[list.length - 1];
                if (route[current - 1]) {
                    last = route[current - 1];
                }
                if (route[current + 1]) {
                    last = route[current + 1];
                }
                changeItem({
                    route: [...list],
                    cte: last ? last.ct : undefined
                });
                deleteLoading.current = false;
                Taro.hideLoading();
                Taro.showToast({title: '已删除', icon: 'none'});
            } else {
                const newRoute = {ct: dayjs().valueOf()};
                changeItem({
                    route: [newRoute],
                    cte: newRoute.ct
                });
                deleteLoading.current = false;
                Taro.showToast({title: '已全部清空', icon: 'none'});
            }
        }
    }, [
        deleteLoading.current,
        changeItem,
        current,
        item.cte,
        route
    ]);
    
    const changeTab = React.useCallback((id, m?: boolean) => {
        const v = route.find((i) => i.ct === id);
        if (v) {
            if (v.lat && !m) {
                changeItem({
                    cte: id,
                    lat: v.lat,
                    lng: v.lng
                });
            } else {
                changeItem({cte: id});
            }
        }
        return v;
    }, [
        route,
        changeItem
    ]);
    
    const onExchange = React.useCallback((isLeft?: boolean) => {
        if (deleteLoading.current) {
            return;
        }
        if (!isLeft && current === route.length - 1) {
            return Taro.showToast({title: '已经是最后一站了', icon: 'none'});
        }
        if (isLeft && !current) {
            return Taro.showToast({title: '已经是第一站了', icon: 'none'});
        }
        deleteLoading.current = true;
        const targetIndex = isLeft ? current - 1 : current + 1;
        const item = JSON.parse(JSON.stringify(route[targetIndex]));
        changeItem({cte: item.ct});
        deleteLoading.current = false;
    }, [
        deleteLoading.current,
        changeItem,
        route,
        current
    ]);
    
    const getRecommend = React.useCallback((e) => {
        return new Promise(async (resolve) => {
            const list = await base.location.getRecommendByCenter(e);
            const array: any[] = [];
            if (list.length) {
                const g = (function* (list) {
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        yield showImage.current!.drawRecommend(item);
                    }
                })(list);
                (function next () {
                    const {value, done} = g.next();
                    if (!done) {
                        value.then((e) => {
                            if (e) {
                                array.push(e);
                            }
                            next();
                        });
                    } else {
                        if (mapContext.current) {
                            mapContext.current!.moveToLocation(e);
                        }
                        setRecommend(array);
                        resolve(array);
                    }
                })();
            } else {
                setRecommend(array);
                resolve(array);
            }
        });
    }, [setRecommend, showImage.current, mapContext.current, setScale, recommend]);
    
    const markersV = React.useMemo(() => {
        return base.common.getMark([item], 'route');
    }, [item]);
    
    const routes = React.useMemo(() => {
        return markersV.map((i) => {
            const active = i.ct === item.cte;
            const isPoint = i.type === "point";
            return i.lat && showImageObj[i.ct] ? {
                width: isPoint ? (active ? 100 : 80) : 60,
                height: isPoint ? (active ? 75 : 60) : 45,
                latitude: i.lat,
                longitude: i.lng,
                iconPath: showImageObj[i.ct],
                alpha: 1,
                id: i.ct,
                zIndex: active ? 2 : (isPoint ? 1 : 0),
            } : undefined;
        }).filter((i) => i);
    }, [
        item.cte,
        showImageObj,
        markersV
    ]);
    
    const markers = React.useMemo(() => {
        const pointMarker = ((point.latitude && defaultImage.d) ? [{
            width: 80,
            height: 60,
            latitude: point.latitude,
            longitude: point.longitude,
            iconPath: defaultImage.d,
            id: 1,
        }] : []);
        const recommendMarkers = recommend.reduce((pre, e) => {
            const id = Number(e.id);
            const isExist = [...routes, ...pointMarker].filter(Boolean).find((v: any) => v.latitude === e.location.lat && v.longitude === e.location.lng);
            if (id && !isExist && e.location && e.location.lat && e.url) {
                return [...pre, {
                    width: 60, height: 45,
                    latitude: e.location.lat,
                    longitude: e.location.lng,
                    iconPath: e.url, id,
                }];
            } else {
                return pre;
            }
        }, []);
        
        return [...routes, ...pointMarker, ...recommendMarkers] as MapProps.marker[];
    }, [
        routes,
        point.latitude,
        defaultImage.d,
        point.longitude,
        recommend
    ]);
    
    const onMarkerTap = React.useCallback((e) => {
        clickMarkS.current = true;
        if (e.detail.markerId === 1) {
            const obj = {lat: point.latitude, lng: point.longitude};
            Taro.showLoading({title: '加载中'});
            base.location.convertLocation({
                latitude: obj.lat!,
                longitude: obj.lng!
            }).then(async (e) => {
                const body = e.status === 1 ? (e.body || {}) : {};
                setShowFuzzyLocation({
                    show: true,
                    location: {
                        ...obj,
                        scenicSpotsName: body.landmark ||
                            body.recommend ||
                            body.rough ||
                            body.street ||
                            body.standard_address || ''
                    }
                });
                Taro.hideLoading();
            });
        } else {
            setPoint({});
            const tab = changeTab(e.detail.markerId, true);
            if (tab) {
                setShowFuzzyLocation({
                    show: true,
                    location: {
                        lng: tab.lng,
                        lat: tab.lat,
                        scenicSpotsName: tab.scenicSpotsName,
                        is: true
                    }
                });
            } else {
                const other = markersV.find((i) => i.ct === e.detail.markerId);
                if (other && (other.type === 'place' || other.type === 'food')) {
                    setShowOther({show: true, item: other});
                } else {
                    const rItem = recommend.find((i) => i.id == e.detail.markerId);
                    if (rItem) {
                        setShowRecommend({
                            show: true,
                            item: {
                                name: rItem.title,
                                ...(rItem.location || {}),
                                desc: rItem.category || '',
                                ct: dayjs().valueOf()
                            }
                        });
                        if (mapContext.current) {
                            mapContext.current!.moveToLocation({
                                longitude: rItem.location.lng,
                                latitude: rItem.location.lat,
                            });
                        }
                    }
                }
            }
        }
        Taro.nextTick(() => {
            Taro.nextTick(() => {
                clickMarkS.current = false;
            });
        });
    }, [
        clickMarkS.current,
        setPoint,
        changeTab,
        setShowFuzzyLocation,
        point.latitude,
        point.longitude,
        markersV,
        setShowOther,
        recommend,
        setShowRecommend,
        mapContext.current
    ]);
    
    const onTap = React.useCallback((e) => {
        Taro.nextTick(() => {
            if (!clickMarkS.current) {
                setPoint(e.detail);
                setRecommend([]);
            }
            clickMarkS.current = false;
        });
    }, [clickMarkS.current, setPoint, setRecommend]);
    
    const paste = React.useCallback(() => {
        if (props.copyRoute) {
            const newRoutes = [...route];
            newRoutes[current] = {
                ...props.copyRoute,
                ct: newRoutes[current].ct,
                rid: newRoutes[current].rid,
                pid: newRoutes[current].pid,
                vid: newRoutes[current].vid,
                uid: newRoutes[current].uid,
            };
            changeItem({route: newRoutes});
            Taro.showToast({title: '粘贴成功', icon: 'none'});
        }
    }, [props.copyRoute, route, changeItem]);
    
    const locationPoint = React.useMemo(() => {
        return {
            lng: item.lng || props.location.longitude || base.common.defaultLocation.longitude,
            lat: item.lat || props.location.latitude || base.common.defaultLocation.latitude
        };
    }, [item.lng, item.lat, props.location.longitude, props.location.latitude]);
    
    const correct = React.useCallback((p?: boolean) => {
        base.location.chooseLocation({
            latitude: showFuzzyLocation.location.lat || undefined,
            longitude: showFuzzyLocation.location.lng || undefined,
            address: showFuzzyLocation.location.scenicSpotsName
        }).then((e) => {
            if (p) {
                setPoint({
                    latitude: e.latitude,
                    longitude: e.longitude,
                });
                setRecommend([]);
            }
            setShowFuzzyLocation({
                show: showFuzzyLocation.show,
                location: {
                    ...showFuzzyLocation.location,
                    lng: e.longitude,
                    lat: e.latitude,
                    scenicSpotsName: e.name || showFuzzyLocation.location.scenicSpotsName
                }
            });
        });
    }, [
        showFuzzyLocation.location.scenicSpotsName,
        showFuzzyLocation.location.lat,
        showFuzzyLocation.location.lng,
        showFuzzyLocation.show,
        setShowFuzzyLocation,
        setPoint,
        setRecommend
    ]);
    
    const draw = React.useCallback((vPlan, callback?: (e) => void) => {
        return new Promise<{ [key: string | number]: string }>((resolve) => {
            const markers = base.common.getMark(vPlan, 'route');
            const a = {};
            if (markers.length) {
                const g = (function* drawGroup (list) {
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        yield showImage.current!.draw(item);
                    }
                })(markers);
                (function next () {
                    const {value, done} = g.next();
                    if (!done) {
                        value.then((e) => {
                            if (e) {
                                Object.assign(a, e);
                                callback && callback({...a, ...e});
                            }
                            next();
                        });
                    } else {
                        resolve({...a});
                        callback && callback({...a});
                    }
                })();
            } else {
                resolve({});
            }
        });
    }, [showImageObj, showImage.current]);
    
    const add = React.useCallback(() => {
        setPoint({});
        setShowFuzzyLocation({...showFuzzyLocation, show: false});
        setShowFixed(true);
        const or = [...(item.route || [])];
        const changedItem = or[current];
        if (changedItem) {
            Taro.showLoading({title: '加载中', mask: true});
            draw([{route: [{...changedItem, ...showFuzzyLocation.location}]}], (e) => {
                setShowImageObj({...showImageObj, ...e});
            }).then(() => {
                changeRoute(current, showFuzzyLocation.location, true);
                Taro.hideLoading();
            }).catch(() => {
                Taro.hideLoading();
            });
        }
    }, [
        setPoint,
        setShowFixed,
        setShowFuzzyLocation,
        changeRoute,
        showFuzzyLocation.show,
        showFuzzyLocation.location.scenicSpotsName,
        showFuzzyLocation.location.lat,
        showFuzzyLocation.location.lng,
        current,
        draw,
        setShowImageObj,
        showImageObj,
        item.route
    ]);
    
    const addNext = React.useCallback(() => {
        setPoint({});
        setShowFuzzyLocation({...showFuzzyLocation, show: false});
        setShowFixed(true);
        const newRoute = {
            ct: dayjs().valueOf(),
            ...showFuzzyLocation.location
        };
        Taro.showLoading({title: '加载中', mask: true});
        draw([{route: [newRoute]}], (e) => {
            setShowImageObj({...showImageObj, ...e});
        }).then(() => {
            changeItem({
                route: [...(item.route || []), newRoute],
                cte: newRoute.ct
            });
            Taro.hideLoading();
        }).catch(() => {
            Taro.hideLoading();
        });
    }, [
        setPoint,
        showFuzzyLocation.location.scenicSpotsName,
        showFuzzyLocation.location.lat,
        showFuzzyLocation.location.lng,
        showFuzzyLocation.show,
        item.route,
        setShowFuzzyLocation,
        setShowFixed,
        draw,
        setShowImageObj,
        showImageObj,
        item.route
    ]);
    
    const changeColor = React.useCallback((color) => {
        const or = [...(item.route || [])];
        const changedItem = or[current];
        if (changedItem) {
            Taro.showLoading({title: '加载中', mask: true});
            draw([{route: [{...changedItem, color}]}], (e) => {
                setShowImageObj({...showImageObj, ...e});
            }).then(() => {
                changeRoute(current, {color});
                Taro.hideLoading();
            }).catch(() => {
                Taro.hideLoading();
            });
        }
    }, [changeRoute, current, item.route, showImageObj, setShowImageObj, draw]);
    
    const openMap = React.useCallback(() => {
        setShowMap(true);
        setHasChangedRoute([]);
    }, [
        showMap,
        setShowMap,
        setHasChangedRoute
    ]);
    
    const closeMap = React.useCallback(() => {
        setShowMap(false);
        if (hasChangedRoute.length) {
            Taro.showLoading({title: '加载中', mask: true});
            const changeItemRoutes = (item.route || []).filter((i) => hasChangedRoute.includes(i.ct));
            draw([{route: changeItemRoutes}], (e) => {
                setShowImageObj({...showImageObj, ...e});
            }).then(() => {
                Taro.hideLoading();
            }).catch(() => {
                Taro.hideLoading();
            });
        }
    }, [
        showMap,
        setShowMap,
        hasChangedRoute,
        setHasChangedRoute,
        item.route,
        setShowImageObj,
        showImageObj
    ]);
    
    const onSubmitOther = React.useCallback((e) => {
        Taro.showLoading({title: '加载中', mask: true});
        const newRoute = [...route];
        const routeItemIndex = newRoute.findIndex((i) => i.rid === e.rid);
        if (routeItemIndex !== -1) {
            const routeItem = {...route[routeItemIndex]};
            const key = e.type === 'food' ? 'foods' : 'places';
            const list = [...(routeItem[key] || [])];
            const index = list.findIndex((a) => a.ct === e.ct);
            if (index !== -1) {
                list[index] = e;
                routeItem[key] = list;
                draw([{route: [routeItem]}], (e) => {
                    setShowImageObj({...showImageObj, ...e});
                }).then(() => {
                    newRoute[routeItemIndex] = routeItem;
                    changeItem({route: newRoute});
                    Taro.hideLoading();
                }).catch(() => {
                    Taro.hideLoading();
                });
            } else {
                Taro.hideLoading();
            }
        } else {
            Taro.hideLoading();
        }
    }, [route, changeItem, setShowImageObj, showImageObj]);
    
    const isFood = React.useMemo(() => {
        return showOther.item.type === 'food';
    }, [showOther.item.type]);
    
    const changeShowOther = React.useCallback((item, show, init, type) => {
        setShowOther({
            show: typeof show === "boolean" ? show : showOther.show,
            item: init ? {
                ct: dayjs().valueOf(),
                type
            } : {
                ...showOther.item,
                ...item,
                type
            }
        });
    }, [setShowOther, showOther.show, showOther.item]);
    
    const onSearch = React.useCallback((k) => {
        if (mapContext.current) {
            base.location.searchByKeyword(k).then((e) => {
                if (e[0]) {
                    const i = e[0];
                    if (i.location && i.location.lat) {
                        mapContext.current && mapContext.current.moveToLocation({
                            longitude: i.location.lng,
                            latitude: i.location.lat,
                            success: () => {
                                Taro.nextTick(() => {
                                    setPoint({
                                        longitude: i.location.lng,
                                        latitude: i.location.lat,
                                    });
                                    setRecommend([]);
                                });
                            }
                        });
                    }
                }
            });
        }
    }, [mapContext.current, setScale, setPoint, setRecommend]);
    
    return <>
        {React.useMemo(() => {
            return <ShowImage
                canvasId="showImage"
                ref={(e) => showImage.current = e}
            />;
        }, [])}
        <View className={cx(styles.container)}>
            <View className={styles.mapBox}>
                <View className={styles.mapB}>
                    {React.useMemo(() => {
                        return <Map
                            scale={scale}
                            enablePoi={true}
                            className={styles.map}
                            longitude={locationPoint.lng}
                            latitude={locationPoint.lat}
                            showScale={true}
                            showLocation={true}
                            enableTraffic={true}
                            markers={markers}
                            onMarkerTap={onMarkerTap}
                            onTap={onTap}
                            id="myMap"
                        />;
                    }, [
                        locationPoint.lat,
                        locationPoint.lng,
                        markers,
                        onMarkerTap,
                        onTap,
                        scale
                    ])}
                </View>
                {React.useMemo(() => {
                    return <View className={styles.search} style={{
                        top: `${base.system.statusBarHeight}px`,
                        height: `${base.common.navigatorHeight}px`,
                    }}>
                        <CustomWrapper>
                            <Input
                                className={styles.searchInput}
                                placeholder="搜索位置"
                                placeholderTextColor="#FFF"
                                placeholderClass={styles.placeholderS}
                                confirmType="search"
                                onConfirm={(e) => onSearch(e.detail.value)}
                            
                            />
                        </CustomWrapper>
                    </View>;
                }, [onSearch])}
                {React.useMemo(() => {
                    return <View className={styles.colorsBox} style={{
                        top: `${base.system.statusBarHeight}px`
                    }}>
                        <View
                            style={{
                                height: `${base.common.navigatorHeight}px`,
                            }}
                            className={styles.closeMap}
                            onClick={() => {
                                if (isChange.current) {
                                    setShowBack(true);
                                } else {
                                    base.navigator.back();
                                }
                            }}>
                            <Ico type="close" size={60} className={styles.closeIcon}/>
                        </View>
                        {route[current] && route[current].lat ? <View className={styles.colorMain}>
                            {Object.keys(base.common.colors).map((i) => {
                                const v = route[current];
                                const active = v && (v.color || '0') === i;
                                return <View key={i} style={{
                                    backgroundColor: base.common.colors[i],
                                    borderColor: active ? base.common.colors[i] : "#FFF",
                                }} className={cx(styles.color)} onClick={(e) => {
                                    e.stopPropagation();
                                    changeColor(i);
                                }}/>;
                            })}
                        </View> : <></>}
                    </View>;
                }, [
                    isChange.current,
                    route,
                    current,
                    changeRoute,
                    setShowBack,
                    changeColor
                ])}
            </View>
            <View className={cx(styles.bottom, {
                [styles.ipx]: base.is.isIphoneX()
            })}/>
            {React.useMemo(() => {
                return <View className={cx(styles.mapFixed, {
                    [styles.mapFixedShow]: !showMap && !showOther.show,
                    [styles.mapFixedHidden]: showMap || showOther.show
                })}>
                    <View className={styles.itemMap} onClick={openMap}>
                        <View className={styles.icon}>
                            <Ico type="map" size={60}/>
                            {route.filter((i) => i.lat).length ? <View className={styles.red}/> : <></>}
                        </View>
                    </View>
                </View>;
            }, [
                showFixed,
                setShowFixed,
                showMap,
                openMap,
                route,
                showOther.show
            ])}
        </View>
        <CustomWrapper>
            <Top
                show={showMap}
                height="80vh"
                onClickMask={closeMap}
                backNode={<View className={styles.menus}>
                    {React.useMemo(() => {
                        return <Button className={styles.item} onClick={() => changeRouteNumber()}>
                            <View className={styles.icon}>
                                <Ico type="add" size={80}/>
                            </View>
                        </Button>;
                    }, [changeRouteNumber])}
                    {React.useMemo(() => {
                        return <Button className={styles.item} onClick={() => {
                            const i = route[current];
                            if (i && i.ct) {
                                changeRouteNumber(i.ct);
                            }
                        }}>
                            <View className={styles.icon}>
                                <Ico type="del" size={80}/>
                            </View>
                        </Button>;
                    }, [route, current, changeRouteNumber])}
                    {React.useMemo(() => {
                        return <Button className={styles.item} onClick={() => {
                            props.setCopyRoute(route[current]);
                            Taro.showToast({title: '复制成功', icon: 'none'});
                        }}>
                            <View className={styles.icon}>
                                <Ico type="copy" size={80}/>
                            </View>
                        </Button>;
                    }, [route, current, props.setCopyRoute])}
                    {React.useMemo(() => {
                        return <Button className={cx(styles.item)} onClick={closeMap}>
                            <View className={cx(styles.icon, styles.icon90)}>
                                <Ico type="close" size={80}/>
                            </View>
                        </Button>;
                    }, [closeMap])}
                    {React.useMemo(() => {
                        return <Button className={styles.item} onClick={paste}>
                            <View className={styles.icon}>
                                <Ico type="paste" size={80}/>
                            </View>
                        </Button>;
                    }, [paste])}
                    {React.useMemo(() => {
                        return <Button className={styles.item} onClick={() => onExchange(true)}>
                            <View className={styles.icon}>
                                <Ico type="left" size={80}/>
                            </View>
                        </Button>;
                    }, [onExchange])}
                    {React.useMemo(() => {
                        return <Button className={styles.item} onClick={() => onExchange()}>
                            <View className={cx(styles.icon, styles.icon180)}>
                                <Ico type="right" size={80}/>
                            </View>
                        </Button>;
                    }, [onExchange])}
                </View>}
                backNodeHeight="10vh"
            >
                <View className={styles.body}>
                    <View style={{
                        height: `${base.system.statusBarHeight}px`,
                        width: '100%',
                        backgroundColor: "#FFF"
                    }}/>
                    {React.useMemo(() => {
                        return <View
                            className={styles.navigatorBar}
                            style={{height: `${base.common.navigatorHeight}px`}}
                        >
                            <View className={styles.left} onClick={closeMap}>
                                <View className={cx(styles.btn)}>
                                    编辑{navigationBarTitleText}行程{route.length ? <Text className={styles.t}>
                                    （{current + 1}/{route.length}）
                                </Text> : <></>}
                                </View>
                            </View>
                        </View>;
                    }, [
                        route.length,
                        navigationBarTitleText,
                        current,
                        closeMap
                    ])}
                    {React.useMemo(() => {
                        return <Swiper
                            autoplay={false}
                            className={styles.swiper}
                            current={current}
                            onChange={(e) => {
                                if (e.detail.source === 'touch') {
                                    changeTab(Number(e.detail.currentItemId), true);
                                }
                            }}
                            style={{height: `calc(80vh - ${base.system.statusBarHeight}px - ${base.common.navigatorHeight}px)`}}
                        >
                            {route.map((e, k) => {
                                return <Scenic
                                    key={k}
                                    item={e}
                                    number={k}
                                    changeRoute={changeRoute}
                                    onDelete={(id) => changeRouteNumber(id)}
                                    showIllustrate={() => setShowIllustrate(true)}
                                    changeFood={(item, show, init) => {
                                        changeShowOther(item, show, init, 'food');
                                    }}
                                    changePlace={(item, show, init) => {
                                        changeShowOther(item, show, init, 'place');
                                    }}
                                />;
                            })}
                        </Swiper>;
                    }, [
                        route,
                        current,
                        changeTab,
                        changeRoute,
                        changeRouteNumber,
                        setShowIllustrate,
                        changeShowOther
                    ])}
                </View>
            </Top>
            {React.useMemo(() => {
                return <Warn
                    show={showBack}
                    onCancel={(is) => {
                        setShowBack(false);
                        if (is) {
                            base.navigator.back();
                        }
                    }}
                    onOk={submit}
                    content={`是否保存${navigationBarTitleText}的行程？`}
                />;
            }, [
                showBack,
                navigationBarTitleText,
                submit,
                setShowBack
            ])}
            
            {React.useMemo(() => {
                return <Right
                    show={showIllustrate}
                    width="85vw"
                    onClickMask={() => setShowIllustrate(false)}
                >
                    <View className={styles.illustrate}>
                        <View className={styles.title} style={{height: `${base.common.navigatorHeight}px`}}>
                            填写说明
                        </View>
                        <View className={styles.illustrateTitle}>
                            如何获取小程序id：
                        </View>
                        <Text className={cx(styles.illustrateTxt, styles.illustrateTxtT)}>
                            1：点击小程序右上角三个点
                        </Text>
                        <Text className={cx(styles.illustrateTxt, styles.illustrateTxtT)}>
                            2：点击弹出的弹框最上面的小程序名字
                        </Text>
                        <Text className={cx(styles.illustrateTxt, styles.illustrateTxtT)}>
                            3：点击更多资料
                        </Text>
                        <Text className={cx(styles.illustrateTxt, styles.illustrateTxtT)}>
                            4：复制AppId
                        </Text>
                        <View className={styles.illustrateTitle}>
                            操作按钮说明：
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="map" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                记录详情
                            </Text>
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="add" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                添加一页
                            </Text>
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="del" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                删除本页
                            </Text>
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="copy" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                复制
                            </Text>
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="paste" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                粘贴
                            </Text>
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="left" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                前一页
                            </Text>
                        </View>
                        <View className={styles.illustrateItem}>
                            <Ico type="right" size={40}/>
                            <Text className={styles.illustrateTxt}>
                                后一页
                            </Text>
                        </View>
                    </View>
                </Right>;
            }, [
                showIllustrate,
                showIllustrate
            ])}
            {React.useMemo(() => {
                return <Add
                    item={showOther.item}
                    show={showOther.show}
                    isFood={isFood}
                    onChange={(e) => setShowOther({
                        show: showOther.show,
                        item: {...showOther.item, ...e}
                    })}
                    onBack={() => setShowOther({...showOther, show: false})}
                    list={showMap ? [...(route[current][isFood ? 'foods' : 'places'] || [])] : []}
                    onSubmit={(e) => {
                        if (showMap) {
                            changeRoute(current, {[isFood ? 'foods' : 'places']: e});
                        } else {
                            e[0] && onSubmitOther(e[0]);
                        }
                    }}
                />;
            }, [
                showOther.item,
                showOther.show,
                setShowOther,
                onSubmitOther,
                showMap,
                isFood,
                route,
                current,
                changeRoute
            ])}
            {React.useMemo(() => {
                return <MyProgress show={percent.show} percent={percent.num}/>;
            }, [
                percent.show,
                percent.num
            ])}
            
            {React.useMemo(() => {
                return <Bottom
                    zIndex={100001}
                    show={showFuzzyLocation.show}
                    onClickMask={() => {
                        setShowFuzzyLocation({
                            ...showFuzzyLocation,
                            show: false
                        });
                    }}
                    height="440rpx"
                >
                    <View className={styles.fuzzyLocation}>
                        <View className={styles.company}>
                            <View className={styles.ico}>
                                <Ico type="pineapple" size={40}/>
                            </View>
                            <Text className={styles.companyName}>菠萝旅行笔记本</Text>
                        </View>
                        <CustomWrapper>
                            <View className={styles.bodyLocation}>
                                <View className={styles.field}>
                                    <Text className={styles.fieldName}>
                                        地址：
                                    </Text>
                                    <Input
                                        className={styles.input}
                                        cursorSpacing={50}
                                        value={showFuzzyLocation.location.scenicSpotsName}
                                        onInput={(e) => setShowFuzzyLocation({
                                            show: showFuzzyLocation.show,
                                            location: {
                                                ...showFuzzyLocation.location,
                                                scenicSpotsName: e.detail.value
                                            }
                                        })}
                                        placeholder="请输入地址"
                                        placeholderTextColor="#868686"
                                        maxlength={10}
                                    />
                                    <View
                                        className={styles.editP}
                                        onClick={() => correct(!showFuzzyLocation.location.is)}
                                    >
                                        <Ico type="lp" size={50}/>
                                    </View>
                                </View>
                                <View className={styles.p}>
                                    注意：获取到的是大致定位，可在修改定位中调整为准确定位
                                </View>
                            </View>
                        </CustomWrapper>
                        <View className={styles.footer}>
                            <Button className={styles.btn} onClick={() => {
                                setShowFuzzyLocation({
                                    ...showFuzzyLocation,
                                    show: false
                                });
                                setPoint({});
                            }}>
                                取 消
                            </Button>
                            <Button
                                className={cx(styles.btn, styles.btnC)}
                                onClick={add}
                            >
                                {showFuzzyLocation.location.is ? '确 定' : '添加到本页'}
                            </Button>
                            {showFuzzyLocation.location.is ? <>
                                {showFuzzyLocation.location.lat ? <Button
                                    className={cx(styles.btn, styles.btnR)}
                                    onClick={() => {
                                        setShowFuzzyLocation({
                                            ...showFuzzyLocation,
                                            show: false
                                        });
                                        timerScale.current && clearTimeout(timerScale.current);
                                        Taro.showLoading({title: '获取周边推荐'});
                                        Taro.nextTick(async () => {
                                            await getRecommend({
                                                latitude: showFuzzyLocation.location.lat!,
                                                longitude: showFuzzyLocation.location.lng!,
                                            });
                                            Taro.hideLoading();
                                            setScale(18);
                                            if (mapContext.current) {
                                                timerScale.current = setTimeout(async () => {
                                                    await mapContext.current!.moveToLocation({
                                                        longitude: showFuzzyLocation.location.lng!,
                                                        latitude: showFuzzyLocation.location.lat!,
                                                    });
                                                }, 200)
                                            }
                                        });
                                    }}
                                >
                                    周边推荐
                                </Button> : <Button
                                    className={cx(styles.btn, styles.btnG)}
                                    onClick={() => {
                                        setShowFuzzyLocation({
                                            ...showFuzzyLocation,
                                            show: false
                                        });
                                        Taro.nextTick(() => {
                                            openMap();
                                        });
                                    }}
                                >
                                    编 辑
                                </Button>}
                            </> : <>
                                {(route.length < 5 && !showFuzzyLocation.location.is) ? <Button
                                    className={cx(styles.btn, styles.btnG)}
                                    onClick={addNext}
                                >
                                    新建一页添加
                                </Button> : <></>}
                            </>}
                        </View>
                    </View>
                </Bottom>;
            }, [
                setShowFuzzyLocation,
                showFuzzyLocation,
                changeRoute,
                item,
                current,
                setShowFixed,
                setPoint,
                correct,
                addNext,
                add,
                openMap,
                getRecommend,
                timerScale.current,
                setScale
            ])}
            {React.useMemo(() => {
                return <Bottom
                    zIndex={100001}
                    show={showRecommend.show}
                    onClickMask={() => {
                        setShowRecommend({
                            ...showRecommend,
                            show: false
                        });
                    }}
                    height="320rpx"
                >
                    <View className={styles.fuzzyLocation}>
                        <View className={styles.company}>
                            <View className={styles.ico}>
                                <Ico type="pineapple" size={40}/>
                            </View>
                            <Text className={styles.companyName}>菠萝旅行笔记本</Text>
                        </View>
                        <CustomWrapper>
                            <View className={styles.bodyLocation}>
                                <View className={styles.field}>
                                    <Text className={styles.fieldName}>
                                        打卡：
                                    </Text>
                                    <Input
                                        className={styles.input}
                                        cursorSpacing={50}
                                        value={showRecommend.item.name}
                                        onInput={(e) => setShowFuzzyLocation({
                                            show: showRecommend.show,
                                            location: {
                                                ...showRecommend.item,
                                                name: e.detail.value
                                            }
                                        })}
                                        placeholder="请输入打卡点"
                                        placeholderTextColor="#868686"
                                        maxlength={15}
                                    />
                                </View>
                            </View>
                        </CustomWrapper>
                        <View className={styles.footer}>
                            <Button className={styles.btn} onClick={() => {
                                setShowRecommend({
                                    ...showRecommend,
                                    show: false
                                });
                            }}>
                                取 消
                            </Button>
                            <Button
                                className={cx(styles.btn, styles.btnG)}
                                onClick={async () => {
                                    setShowRecommend({
                                        ...showRecommend,
                                        show: false
                                    });
                                    const item = showRecommend.item;
                                    if (item.ct) {
                                        Taro.showLoading({title: '加载中'});
                                        const places = [...(route[current]['places'] || [])];
                                        places.push(item);
                                        const routeItem = {...route[current]};
                                        routeItem['places'] = places;
                                        draw([{route: [routeItem]}], (e) => {
                                            setShowImageObj({...e, ...showImageObj});
                                        }).then(() => {
                                            changeRoute(current, {places});
                                            Taro.hideLoading();
                                        }).catch(() => {
                                            Taro.hideLoading();
                                        });
                                    }
                                }}
                            >
                                添加到打卡列表
                            </Button>
                        </View>
                    </View>
                </Bottom>;
            }, [
                showRecommend,
                setShowRecommend,
                route,
                current,
                changeRoute,
                setShowImageObj,
                showImageObj,
                draw,
            ])}
        </CustomWrapper>
    </>;
}

export default connect((e: {}) => {
    return {
        ...e['plan'],
        location: e['common'].location,
        uid: (e['common'].userinfo || {})._id || '',
    };
}, (d) => {
    const home = homeAction(d);
    const events = eventsAction(d);
    return {
        ...planAction(d),
        getMyPlan: home.getMyPlan,
        getDayEvents: events.getDayEvents
    };
})(Index);
