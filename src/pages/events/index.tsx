import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {View, Map, RootPortal, ScrollView, Swiper, Button} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import Ico from "@/components/Ico";
import dayjs from "dayjs";
import ShowImage from "@/components/ShowImage";
import Details from "@/components/Details";

const minMax = require('dayjs/plugin/minMax');

const getParams = (params) => {
    const {vid, uid} = params;
    return {
        // 某天的某个计划
        vid: JSON.parse(decodeURIComponent(vid || '')) as string[],
        uid: decodeURIComponent(uid || '')
    };
};

function Index (props) {
    const params = React.useRef<{ vid: string[]; uid: string }>(getParams(Taro.useRouter().params)).current;
    const windowHeight = React.useRef(base.system.windowHeight).current;
    const [vPlan, setVPlan] = React.useState<any[]>([]);
    const [tabVid, setTabVid] = React.useState('');
    const [point, setPoint] = React.useState<number>(0);
    const showImage = React.useRef<ShowImage>();
    const [defaultImage, setDefaultImage] = React.useState('');
    const [showImageObj, setShowImageObj] = React.useState<{ [key: number | string]: string }>({});
    const [locationN, setLocation] = React.useState<{ lat?: number; lng?: number }>({});
    const [hX, setHX] = React.useState(0);
    const [lineObj, setLineObj] = React.useState<{ [key: number | string]: any[] }>({});
    const [circlesObj, setCirclesObj] = React.useState<{ [key: number | string]: any[] }>({});
    const clickMarkS = React.useRef(false);
    const vidR = React.useRef<string[]>([]);
    const mapContext = React.useRef<Taro.MapContext>();
    
    React.useEffect(() => {
        mapContext.current = Taro.createMapContext("myMapS");
        if (props.uid && params.vid && params.vid.length) {
            getVPlan();
        }
        return () => {
        
        };
    }, [props.uid]);
    
    const getTitle = React.useCallback(() => {
        const date = vPlan.map(i => i.date ? dayjs(i.date) : undefined).filter(Boolean);
        dayjs.extend(minMax);
        const maxDate = dayjs['max'](...date).format("MM月DD日");
        const minDate = dayjs['min'](...date).format("MM月DD日");
        return maxDate !== minDate ? `${minDate}至${maxDate}` : `${maxDate}`;
    }, [vPlan]);
    
    Taro.useShareTimeline(() => {
        const title = getTitle();
        return {
            imageUrl: base.assets.pineapple,
            query: `mid=${props.uid}&vid=${JSON.stringify(vidR.current)}&uid=${params.uid || props.uid}`,
            title: title + '的旅行计划'
        };
    });
    
    Taro.useShareAppMessage(() => {
        const title = getTitle();
        return {
            imageUrl: base.assets.pineapple,
            path: `${base.routers.events}?mid=${props.uid}&vid=${JSON.stringify(vidR.current)}&uid=${params.uid || props.uid}`,
            title: title + '的旅行计划'
        };
    });
    
    const p = React.useCallback((e) => {
        return new Promise((resolve) => resolve(e));
    }, []);
    
    const drawD = React.useCallback(async (item, skip) => {
        const key = item.ct;
        if (skip) {
            return showImage.current!.draw(item);
        } else {
            if (showImageObj[key]) {
                return p({[key]: showImageObj[key]});
            } else {
                return showImage.current!.draw(item);
            }
        }
    }, [showImage.current, showImageObj]);
    
    const drawX = React.useCallback(async (item, skip) => {
        const key = item.ct + 'X';
        if (skip) {
            return showImage.current!.draw(item, true);
        } else {
            if (showImageObj[key]) {
                return p({[key]: showImageObj[key]});
            } else {
                return showImage.current!.draw(item, true);
            }
        }
    }, [showImage.current, showImageObj]);
    
    const drawDX = React.useCallback((item, skip) => {
        return new Promise((resolve) => {
            drawD(item, skip).then((d) => {
                drawX(item, skip).then((x) => {
                    resolve({...d, ...x});
                });
            });
        });
    }, [drawD, drawX]);
    
    const draw = React.useCallback((vPlan, skip?) => {
        return new Promise((resolve) => {
            const markers = base.common.getMark(vPlan);
            const a = {...showImageObj};
            if (markers.length) {
                const g = (function* drawGroup (list, skip) {
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        yield drawDX(item, skip);
                    }
                })(markers, skip);
                (function next () {
                    const {value, done} = g.next();
                    if (!done) {
                        value.then((e) => {
                            if (e) {
                                Object.assign(a, e);
                                setShowImageObj({...a, ...e});
                            }
                            next();
                        });
                    } else {
                        resolve({...a});
                        setShowImageObj({...a});
                    }
                })();
            } else {
                resolve({});
            }
        });
    }, [setShowImageObj, showImageObj, drawDX]);
    
    const drawDefault = React.useCallback(() => {
        return new Promise<string>((resolve) => {
            if (showImage.current) {
                showImage.current.draw().then((e) => {
                    resolve(e);
                });
            } else {
                resolve('');
            }
        });
    }, [showImage.current]);
    
    Taro.useDidShow(async () => {
        const changeVid = base.global.get('changeVid');
        if (changeVid) {
            const vid = changeVid;
            base.global.remove('changeVid');
            if (vidR.current.includes(vid)) {
                Taro.showLoading({title: '加载中', mask: true});
                Taro.nextTick(async () => {
                    const sPlan = await base.db.plans.getPlanListByVid([vid], params.uid);
                    const fVPlan = sPlan[0];
                    const routes = await base.db.routes.getRoutesByVid([fVPlan.vid], params.uid);
                    const list = JSON.parse(JSON.stringify([...(vPlan || [])]));
                    const newVPlan = list.map((a) => {
                        if (a.vid === vid) {
                            return {...a, ...fVPlan, routes};
                        } else {
                            return a;
                        }
                    });
                    setVPlan(newVPlan);
                    await draw(newVPlan, true);
                    await drawLine(vid, routes);
                    Taro.hideLoading();
                });
            }
        }
    });
    
    const drawLine = React.useCallback(async (vid, routes) => {
        if (routes && routes.length >= 2) {
            const line = await base.location.drawLine(routes);
            const newObj = {...lineObj, [vid]: line.ps};
            const newCObj = {...circlesObj, [vid]: line.cs};
            setCirclesObj(newCObj);
            setLineObj(newObj);
        }
    }, [lineObj, circlesObj, setCirclesObj, setLineObj]);
    
    const saveRoute = React.useCallback(async (vPlan) => {
        if (vPlan.length) {
            const today = dayjs();
            const targetIndex = vPlan.findIndex((i) => i.date === today.format("YYYY-MM-DD"));
            let index;
            if (params.vid.length === 1) {
                const itemIndex = vPlan.findIndex((i) => i.vid === params.vid[0]);
                index = itemIndex > 0 ? itemIndex : (targetIndex > 0 ? targetIndex : 0);
            } else {
                index = targetIndex > 0 ? targetIndex : 0;
            }
            const fVPlan = {...vPlan[index]};
            setTabVid(fVPlan.vid);
            fVPlan['routes'] = await base.db.routes.getRoutesByVid([fVPlan.vid], params.uid);
            vPlan[index] = fVPlan;
            setVPlan(vPlan);
            await draw(vPlan);
            await drawLine(fVPlan.vid, fVPlan.routes);
            Taro.hideLoading();
        } else {
            Taro.hideLoading();
        }
    }, [params.vid, setTabVid, setVPlan, draw, drawLine]);
    
    
    const getVPlan = React.useCallback(async () => {
        Taro.showLoading({title: '加载中', mask: true});
        const [vPlan, di] = await Promise.all([
            base.db.plans.getPlanListByVid(params.vid, params.uid),
            drawDefault()
        ]);
        setDefaultImage(di);
        if (params.vid.length === 1 && !params.uid) {
            const plan = vPlan[0];
            if (plan.pid) {
                const p = await base.db.plan.getPlanByPid(plan.pid);
                if (p && p.vid && p.vid.length) {
                    const vPlanN = await base.db.plans.getPlanListByVid(p.vid);
                    vidR.current = p.vid;
                    saveRoute(vPlanN);
                } else {
                    vidR.current = params.vid;
                    saveRoute(vPlan);
                }
            } else {
                vidR.current = params.vid;
                saveRoute(vPlan);
            }
            
        } else {
            vidR.current = params.vid;
            saveRoute(vPlan);
        }
    }, [saveRoute, drawDefault, setDefaultImage]);
    
    const changeTab = React.useCallback(async (vid) => {
        setTabVid(vid);
        const v = [...vPlan];
        const index = v.findIndex((i) => i.vid === vid);
        if (index !== -1) {
            const e = {...(v[index] || {})};
            if (!e.routes) {
                await Taro.showLoading({title: '加载中', mask: true});
                e['routes'] = await base.db.routes.getRoutesByVid([vid], params.uid);
                v[index] = e;
                setVPlan(v);
                await draw(v);
                await drawLine(e.vid, e['routes']);
                Taro.hideLoading();
            }
        }
        return;
    }, [setTabVid, vPlan, setVPlan, draw, setLineObj, drawLine]);
    
    const current = React.useMemo(() => {
        const index = vPlan.findIndex((i) => i.vid === tabVid);
        return index > 0 ? index : 0;
    }, [tabVid, vPlan]);
    
    const markers = React.useMemo(() => {
        return base.common.getMark(vPlan);
    }, [vPlan]);
    
    const location = React.useMemo(() => {
        if (locationN.lat) {
            return {
                latitude: locationN.lat,
                longitude: locationN.lng
            };
        }
        const item = vPlan.find((i) => i.vid === tabVid) || {};
        const routes = item.routes || [];
        const children: any[] = [];
        routes.forEach((i) => {
            if (i.lat) {
                children.push({lat: i.lat, lng: i.lng});
            } else {
                if (i && i.foods) {
                    i.foods.forEach((f) => f.lat && children.push(f));
                } else {
                    if (i && i.places) {
                        i.places.forEach((p) => p.lat && children.push(p));
                    }
                }
            }
        });
        if (children[0]) {
            return {
                latitude: children[0].lat,
                longitude: children[0].lng
            };
        }
        if (item.lat) {
            return {latitude: item.lat, longitude: item.lng};
        }
        return {
            latitude: props.location.latitude || base.common.defaultLocation.latitude,
            longitude: props.location.longitude || base.common.defaultLocation.longitude
        };
    }, [tabVid, vPlan, props.location, locationN]);
    
    const isMine = React.useMemo(() => {
        return !params.uid || params.uid === props.uid;
    }, [params.uid, props.uid]);
    
    const ms = React.useMemo(() => {
        return markers.map((i) => {
            const active = point === i.ct;
            const isPoint = i.type === "point";
            const key = active ? i.ct + "X" : i.ct;
            const load = showImageObj[i.ct];
            return {
                id: i.ct,
                latitude: i.lat,
                longitude: i.lng,
                zIndex: active ? 2 : (isPoint ? 1 : 0),
                iconPath: (showImageObj[key]) || defaultImage,
                width: load ? (active ? 140 : (isPoint ? 80 : 60)) : 0,
                height: load ? (active ? 105 : (isPoint ? 60 : 45)) : 0,
                alpha: load ? 1 : 0
            };
        });
    }, [markers, point, showImageObj, defaultImage]);
    
    const onMarkerTap = React.useCallback(async (e) => {
        clickMarkS.current = true;
        if (Number(e.detail.markerId) === point) {
            const item = markers.find(i => i.ct === e.detail.markerId);
            if (item) {
                await Taro.openLocation({
                    latitude: item.lat,
                    longitude: item.lng,
                    name: item.scenicSpotsName || item.name
                });
            }
        } else {
            setPoint(Number(e.detail.markerId));
            const item = markers.find(i => i.ct === e.detail.markerId);
            if (item && item.vid && item.vid !== tabVid) {
                await changeTab(item.vid);
            }
            if (item && item.lat && mapContext.current) {
                await mapContext.current.moveToLocation({
                    longitude: item.lng,
                    latitude: item.lat
                });
            }
        }
        Taro.nextTick(() => {
            Taro.nextTick(() => {
                clickMarkS.current = false;
            });
        });
    }, [clickMarkS.current, changeTab, setLocation, markers, point, setPoint, mapContext.current]);
    
    const onTap = React.useCallback(() => {
        Taro.nextTick(() => {
            if (!clickMarkS.current && point) {
                setPoint(0);
            }
            clickMarkS.current = false;
        });
    }, [setPoint, clickMarkS.current, point]);
    
    const onChange = React.useCallback((e) => {
        if (e.detail.source === 'touch') {
            const c = e.detail.current || 0;
            const item = vPlan[c];
            if (item) {
                changeTab(item.vid);
                point && setPoint(0);
                setLocation({});
            }
        }
    }, [vPlan, changeTab, setPoint, setLocation, point]);
    
    const polyline = React.useMemo(() => {
        return Object.values(lineObj).reduce((pre, i) => {
            return [...pre, ...i];
        }, []);
    }, [lineObj]);
    
    return <>
        {React.useMemo(() => {
            return <ShowImage
                canvasId="showImage"
                ref={(e) => showImage.current = e}
            />;
        }, [])}
        <View className={cx(styles.container)}>
            <ScrollView
                className={styles.main}
                // scrollTop={windowHeight * 1.6}
                scrollX={false}
                scrollY={true}
                enhanced={true}
                showScrollbar={false}
                bounces={false}
                onScroll={(e) => setHX(windowHeight * 0.5 - e.detail.scrollTop)}
            >
                <View className={styles.map}>
                    {React.useMemo(() => {
                        return <Map
                            id="myMapS"
                            className={styles.mapMain}
                            scale={14}
                            enablePoi={true}
                            longitude={location.longitude}
                            latitude={location.latitude}
                            showScale={true}
                            showLocation={true}
                            enableTraffic={true}
                            enableOverlooking={true}
                            enableBuilding={true}
                            markers={ms}
                            onMarkerTap={onMarkerTap}
                            onClick={onTap}
                            polyline={polyline}
                        />;
                    }, [onTap, onMarkerTap, ms, location.longitude, location.latitude, polyline])}
                </View>
                <View className={styles.info}>
                    <View className={styles.tab} style={{opacity: vPlan.length ? 1 : 0}}>
                        {React.useMemo(() => {
                            return <ScrollView
                                scrollY={false}
                                scrollX={true}
                                enhanced={true}
                                showScrollbar={false}
                                bounces={false}
                                className={styles.tabsView}
                            >
                                {vPlan.map((v, k) => {
                                    const active = v.vid === tabVid;
                                    return <View key={k} className={cx(styles.tabItem, {
                                        [styles.tabItemActive]: active
                                    })} onClick={() => {
                                        if (!active) {
                                            changeTab(v.vid);
                                            setPoint(0);
                                            setLocation({});
                                        }
                                    }}>
                                        {dayjs(v.date).format("MM月DD日")}
                                    </View>;
                                })}
                            </ScrollView>;
                        }, [tabVid, vPlan, changeTab, setPoint, setLocation])}
                    </View>
                    {React.useMemo(() => {
                        return <View className={styles.mainInfo}>
                            <Swiper
                                className={styles.items}
                                current={current}
                                onChange={onChange}
                            >
                                {vPlan.map((v, k) => {
                                    const routes = v.routes || [];
                                    return <Details
                                        key={k}
                                        hX={hX}
                                        routes={routes}
                                        setLocation={(e) => {
                                            if (e && e.lat) {
                                                if (mapContext.current) {
                                                    mapContext.current.moveToLocation({
                                                        latitude: e.lat,
                                                        longitude: e.lng
                                                    });
                                                } else {
                                                    setLocation(e);
                                                }
                                            }
                                        }}
                                        setPoint={setPoint}
                                    />;
                                })}
                            </Swiper>
                        </View>;
                    }, [current, onChange, vPlan, hX, setLocation, setPoint, mapContext.current])}
                </View>
            </ScrollView>
        </View>
        {React.useMemo(() => {
            return <RootPortal enable={true}>
                <View className={styles.close} style={{
                    top: `${base.system.statusBarHeight}px`
                }} onClick={() => base.navigator.back()}>
                    <View style={{
                        height: `${base.common.navigatorHeight}px`,
                    }} className={styles.closeMap}>
                        <Ico type="close" size={60} className={styles.closeIcon}/>
                    </View>
                </View>
            </RootPortal>;
        }, [])}
        {React.useMemo(() => {
            return <RootPortal enable={true}>
                <View className={cx(styles.bottom, {
                    [styles.bottomX]: base.is.isIphoneX(),
                    [styles.none]: !vPlan.length
                })}>
                    <View className={cx(styles.edit, {[styles.sm]: !(isMine)})} onClick={() => {
                        if (isMine) {
                            const item = vPlan[current];
                            if (item && item.vid) {
                                base.navigator.push("addEvents", {
                                    type: 'event',
                                    vid: item.vid,
                                    did: item.did
                                });
                            }
                        }
                    }}>
                        修 改
                    </View>
                    <Button className={cx(styles.button, styles.buttonG)} openType="share">
                        分享给好友
                        <Ico type="wx" size={30}/>
                    </Button>
                </View>
            </RootPortal>;
        }, [vPlan, isMine, current])}
    </>;
}

export default connect((e: {}) => {
    return {
        location: e['common'].location,
        uid: (e['common'].userinfo || {})._id || '',
    };
})(Index);
