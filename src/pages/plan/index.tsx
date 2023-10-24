import React from "react";
import styles from './index.module.scss';
import Taro, {getStorageSync} from '@tarojs/taro';
import {Text, View, CustomWrapper} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import config from "./index.config";
import OpacityNavBar from "@/components/NavBar/OpacityNavBar";
import planAction from "@/modules/redux/plan/action";
import Ico from "@/components/Ico";
import dayjs from "dayjs";
import FixedButton from "@/components/FixedButton";
import Warn from "@/components/Warn";
import homeAction from "@/modules/redux/home/action";
import MyInput from "@/components/MyInput";
import MyProgress from "@/components/MyProgress";
import eventsAction from "@/modules/redux/events/action";


function Index (props) {
    const {plan} = props;
    const [exchange, setExchange] = React.useState(false);
    const [showAllPlans, setShowAllPlans] = React.useState(false);
    const [showBack, setShowBack] = React.useState(false);
    const [percent, setPercent] = React.useState({num: 0, show: false});
    
    React.useEffect(() => {
        init();
        return () => {
        
        };
    }, []);
    
    React.useEffect(() => {
        setShowAllPlans(false);
    }, [plan.startDate, plan.endDate]);
    
    
    const init = () => {
        const prePlan = getStorageSync("PRE_PLAN") || undefined;
        if (prePlan) {
            props.init({
                ...prePlan,
            });
        } else {
            initData();
        }
    };
    
    const initData = () => {
        const start = dayjs();
        const end = start.add(1, "day");
        props.init({
            startDate: start.format("YYYY-MM-DD"),
            endDate: end.format("YYYY-MM-DD"),
            plans: [
                {
                    date: start.format("YYYY-MM-DD"),
                    y: start.year(),
                    m: start.month() + 1,
                    d: start.date(),
                    did: Number(`${start.year()}${start.month() + 1}${start.date()}`),
                    rid: base.tools.randCode(),
                },
                {
                    date: end.format("YYYY-MM-DD"),
                    y: end.year(),
                    m: end.month() + 1,
                    d: end.date(),
                    did: Number(`${end.year()}${end.month() + 1}${end.date()}`),
                    rid: base.tools.randCode(),
                }
            ],
        });
    };
    
    const onChangeDestination = React.useCallback(() => {
        if (plan.destination || plan.departure) {
            props.changePlan({
                departure: plan.destination,
                destination: plan.departure
            });
            setExchange(!exchange);
        }
    }, [plan.departure, plan.destination, exchange]);
    
    // const days = React.useMemo(() => {
    //     if (plan.startDate && plan.endDate) {
    //         return dayjs(plan.endDate).diff(plan.startDate, 'day');
    //     }
    //     return 0;
    // }, [plan.startDate, plan.endDate]);
    
    const haveShowAll = React.useMemo(() => {
        return (plan.plans || []).length > 5;
    }, [(plan.plans || []).length]);
    
    const num = React.useMemo(() => {
        const p = [...(plan.plans || [])];
        if (showAllPlans) {
            return p.length;
        } else {
            return p.splice(0, 5).length;
        }
    }, [showAllPlans, (plan.plans || []).length]);
    
    const onSubmit = async () => {
        if (!props.plan.name) {
            return Taro.showToast({title: '请输入旅行标题', icon: 'none', mask: true});
        }
        if (!props.plan.departure) {
            return Taro.showToast({title: '请选择出发地', icon: 'none', mask: true});
        }
        if (!props.plan.destination) {
            return Taro.showToast({title: '请选择目的地', icon: 'none', mask: true});
        }
        setPercent({show: true, num: 0});
        const plan = {
            uid: props.plan.uid ? props.plan.uid : props.userinfo._id,
            pid: props.plan.pid ? props.plan.pid : base.tools.randCode(),
            plans: props.plan.plans || [],
            ...props.plan,
            startTimeStamp: dayjs(dayjs(props.plan.startDate).format("YYYY-MM-DD 00:00:00")).valueOf(),
            endTimeStamp: dayjs(dayjs(props.plan.endDate).format("YYYY-MM-DD 23:59:59")).valueOf()
        };
        const routes: {}[] = [];
        const plans: {}[] = [];
        const vid: string[] = [];
        ([...(plan.plans)]).forEach((p) => {
            const i = {
                pid: p.pid ? p.pid : plan.pid,
                uid: p.uid ? p.uid : plan.uid,
                vid: p.vid ? p.vid : base.tools.randCode(),
                ...p
            };
            delete i.route;
            plans.push(i);
            vid.push(i.vid);
            (p.route || []).forEach((e, current) => {
                routes.push({
                    uid: e.uid ? e.uid : plan.uid, // 用户id
                    pid: e.pid ? e.pid : plan.pid, // 计划id
                    vid: e.vid ? e.vid : i.vid, // 计划里的天id
                    rid: e.rid ? e.rid : base.tools.randCode(), // 每天的路线id
                    current,
                    ...e
                });
            });
        });
        plan.vid = vid;
        delete plan.plans;
        base.db.routes.updateRoutes(routes, (p) => {
            setPercent({show: true, num: 0.4 * p});
            if (p === 1) {
                base.db.plans.updatePlans(plans, (v) => {
                    setPercent({show: true, num: 0.4 + (0.4 * v)});
                    if (v === 1) {
                        base.db.plan.updatePlan(plan).then(() => {
                            setPercent({show: true, num: 0.9});
                            Promise.all([
                                props.getMyPlan(),
                                props.getDayEvents(plans.map((o) => ({y: o['y'], m: o['m'], d: o['d']})))
                            ]).then(() => {
                                props.setPrePlan(undefined);
                                setPercent({show: false, num: 1});
                                base.navigator.redirect("events", {vid: JSON.stringify(vid)});
                            });
                        });
                    }
                });
            }
        });
    };
    
    return <>
        <View className={cx(styles.container)}>
            <OpacityNavBar config={config} r={264} g={165} b={67} onBack={() => {
                if (plan.isChange) {
                    setShowBack(true);
                } else {
                    base.navigator.back();
                    props.setPrePlan(undefined);
                }
            }}/>
            {plan.ready ? <>
                <View className={styles.header}>
                    <View className={styles.address}>
                        <View className={cx(styles.item)}>
                            <MyInput
                                className={styles.input}
                                value={plan.name}
                                onInput={(e) => props.changePlan({name: e.detail.value})}
                                placeholder="添加旅行标题，如：营口鲅鱼圈之旅"
                                placeholderClass={styles.placeholder}
                            />
                        </View>
                        <View className={styles.line}/>
                        <View className={cx(styles.item, styles.itemBetween)}>
                            <View
                                className={cx(styles.ad, styles.af)}
                                onClick={() => base.navigator.push("location", {type: 'departure'})}
                            >
                                <Text className={cx(styles.txt, {
                                    [styles.txtP]: !plan.departure
                                })}>
                                    {(plan.departure) || '出发地'}
                                </Text>
                            </View>
                            <View onClick={onChangeDestination} className={cx(styles.exchange, {
                                [styles.exchangeT]: exchange
                            })}>
                                <Ico type="change" size={56}/>
                            </View>
                            <View
                                className={cx(styles.ad, styles.ar)}
                                onClick={() => base.navigator.push("location", {type: 'destination'})}
                            >
                                <Text className={cx(styles.txt, {
                                    [styles.txtP]: !plan.destination
                                })}>
                                    {(plan.destination) || '目的地'}
                                </Text>
                            </View>
                        </View>
                        <View className={styles.line}/>
                        <View className={cx(styles.item, styles.itemBetween)}>
                            <View
                                className={cx(styles.ad, styles.af)}
                                onClick={() => base.navigator.push("calendar", {type: 'plan', mode: "s"})}
                            >
                                <Text className={cx(styles.txt, styles.txtSm, {
                                    [styles.txtP]: !plan.startDate
                                })}>
                                    {plan.startDate ? (dayjs(plan.startDate, "YYYY-MM-DD").format("MM月DD日")) : '开始日期'}
                                    {(plan.startDate) ? <Text className={styles.week}>
                                        {base.common.weeks[dayjs(plan.startDate, "YYYY-MM-DD").day() || 0] || ''}
                                    </Text> : <></>}
                                </Text>
                            </View>
                            <View onClick={onChangeDestination} className={styles.center}>
                                {/*<View className={cx(styles.days)}>*/}
                                {/*    /!*{(days || 0) + 1}天{(days || 0) ? `${days || 0}晚` : ``}*!/*/}
                                {/*</View>*/}
                                <View className={styles.go}>
                                    <Ico type="go" size={80} className={styles.icon}/>
                                </View>
                            </View>
                            <View
                                className={cx(styles.ad, styles.ar)}
                                onClick={() => base.navigator.push("calendar", {type: 'plan', mode: "e"})}
                            >
                                <Text className={cx(styles.txt, styles.txtSm, {
                                    [styles.txtP]: !plan.endDate
                                })}>
                                    {plan.endDate ? (dayjs(plan.endDate, "YYYY-MM-DD").format("MM月DD日")) : '结束日期'}
                                    {(plan.endDate) ? <Text className={styles.week}>
                                        {base.common.weeks[dayjs(plan.endDate, "YYYY-MM-DD").day() || 0] || ''}
                                    </Text> : <></>}
                                </Text>
                            </View>
                        </View>
                        {((plan.plans || []).length) ? <View className={styles.line}/> : <></>}
                        <View
                            className={cx(styles.item, styles.itemA)}
                            style={{height: `${100 * num}rpx`}}
                        >
                            {(plan.plans || []).map((p, k) => {
                                const r = p.route || [];
                                return <View
                                    key={k}
                                    className={styles.plan}
                                    onClick={() => base.navigator.push("addEvents", {
                                        type: "plan",
                                        did: p.did
                                    })}
                                >
                                    {k ? <View className={cx(styles.line, styles.planLine)}/> : <></>}
                                    <View className={styles.planItem}>
                                        <Text className={styles.day}>
                                            {dayjs(p.date).format("MM月DD日")}
                                        </Text>
                                        <View className={styles.planMain}>
                                            {r.length ? <View className={styles.planBox}>
                                                <View className={cx(styles.box)}>
                                                    {r.map((c, k) => {
                                                        return <View className={styles.place} key={k} onClick={(e) => {
                                                            e.stopPropagation();
                                                            base.navigator.push("addEvents", {
                                                                type: "plan",
                                                                did: p.did,
                                                                cte: c['ct']
                                                            });
                                                        }}>
                                                            <Ico type="placeA" size={25}/>
                                                            {c.scenicSpotsName || '未知景点'}
                                                        </View>;
                                                    })}
                                                </View>
                                            </View> : <View className={cx(styles.planBox, styles.end)}>
                                                <View className={styles.boxN}>
                                                    点击添加行程
                                                </View>
                                            </View>}
                                        </View>
                                    </View>
                                </View>;
                            })}
                        </View>
                        {haveShowAll ? <>
                            <View className={styles.line}/>
                            <View className={styles.showAll} onClick={() => setShowAllPlans(!showAllPlans)}>
                                {showAllPlans ? '收起计划' : '展开计划'}
                                <View className={cx(styles.arr, {
                                    [styles.arrT]: showAllPlans
                                })}/>
                            </View>
                        </> : <></>}
                    </View>
                </View>
            </> : <></>}
            <FixedButton onClick={() => onSubmit()}/>
        </View>
        <CustomWrapper>
            <Warn
                cancelText="否"
                okText="是"
                show={showBack}
                onCancel={() => {
                    setShowBack(false);
                    base.navigator.back();
                    props.setPrePlan(undefined);
                    initData();
                }}
                onOk={() => setShowBack(false)}
                content={`计划还未保存，是否继续编辑？`}
            />
            <MyProgress show={percent.show} percent={percent.num}/>
        </CustomWrapper>
    </>;
}

export default connect((e: {}) => {
    return {
        ...e['plan'],
        userinfo: e['common'].userinfo || {}
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
