import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {Text, View} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import config from "./index.config";
import NavBar from "@/components/NavBar";
import planAction from "@/modules/redux/plan/action";
import calendar from "@/modules/calendar";
import base from "@/modules/base";
import dayjs from "dayjs";


function Index (props) {
    const params = React.useRef<{ type?: string; mode?: "e" | "s" }>(Taro.useRouter().params).current;
    const today = React.useRef(dayjs().format("YYYY-MM-DD")).current;
    const [calendarDays, setCalendarDays] = React.useState<{
        days: ({
            iw: boolean;
            ih: boolean;
            lDay: string;
            y: number;
            m: number;
            d: number;
            w: number;
            day: string;
        } | undefined)[];
        month: number;
        year: number
    }[]>([]);
    const clickEnd = React.useRef(params.mode !== "e");
    
    const time = React.useMemo(() => {
        switch (params.type) {
            case "plan":
                return {s: props.planStart, e: props.planEnd};
            default:
                return {s: '', e: ''};
        }
    }, [props.planStart, props.planEnd]);
    
    React.useEffect(() => {
        const target = time[params.mode || 's'] || time.s || time.e || dayjs().format("YYYY-MM-DD");
        const targetDay = dayjs(target).startOf("month");
        const lastDay = targetDay.add(4, "month");
        const list = calendar.getDateList(targetDay, lastDay);
        setCalendarDays(list);
    }, []);
    
    Taro.usePullDownRefresh(() => {
        Taro.showLoading({title: '加载中'});
        addStart();
        Taro.stopPullDownRefresh({
            success: () => Taro.hideLoading(),
            fail: () => Taro.hideLoading(),
        });
    });
    
    Taro.useReachBottom(() => {
        addEnd();
    });
    
    const addEnd = () => {
        const lastMonth = calendarDays[calendarDays.length - 1];
        const month = dayjs(`${lastMonth.year}-${lastMonth.month}-1`).add(1, "month");
        const list = calendar.getDateList(month, month.endOf("month"));
        const newList = [...calendarDays, ...list];
        setCalendarDays(newList);
    };
    
    const addStart = () => {
        const firstMonth = calendarDays[0];
        const month = dayjs(`${firstMonth.year}-${firstMonth.month}-1`).add(-1, "month");
        const list = calendar.getDateList(month, month.endOf("month"));
        const newList = [...list, ...calendarDays];
        setCalendarDays(newList);
    };
    
    const change = (d, activeS, activeE) => {
        if(!activeS && !activeE){
            if (!time.e) {
                onChange(d.day, true);
                return;
            }
            if (!time.s) {
                onChange(d.day);
                return;
            }
            const day = d.day;
            if (dayjs(day).valueOf() > dayjs(time.e).valueOf()) {
                onChange(d.day, true);
            } else if (dayjs(day).valueOf() < dayjs(time.s).valueOf()) {
                onChange(d.day);
            } else {
                if (clickEnd.current) {
                    onChange(d.day);
                } else {
                    onChange(d.day, true);
                }
        
            }
            return;
        }
        if(activeS && !activeE){
            onChange(d.day, true);
            return;
        }
    
        if(!activeS && activeE){
            onChange(d.day);
            return;
        }
    };
    
    const onChange = (day, isEnd?: boolean) => {
        clickEnd.current = !!isEnd;
        const type = params.type;
        switch (type) {
            case "plan":
                const d = isEnd ? {endDate: day} : {startDate: day};
                const dd = {
                    startDate: props.planStart,
                    endDate: props.planEnd,
                    ...d,
                };
                if (dd.endDate && dd.startDate) {
                    const x = dayjs(dd.endDate).diff(dd.startDate, 'day');
                    const start = dayjs(dd.startDate);
                    const plans: any[] = [];
                    for (let i = 0; i <= x; i++) {
                        const day = start.add(i, "day");
                        const did = Number(`${day.year()}${day.month() + 1}${day.date()}`);
                        const item = props.plans.find((i) => i.did === did);
                        if (item) {
                            plans.push(item);
                        } else {
                            plans.push({
                                date: day.format("YYYY-MM-DD"),
                                y: day.year(),
                                m: day.month() + 1,
                                d: day.date(),
                                did,
                                rid: base.tools.randCode(),
                            });
                        }
                    }
                    props.changePlan({
                        ...d,
                        plans: base.tools.duplicateRemoval(plans, "did").sort((a, b) => a.did - b.did)
                    });
                } else {
                    props.changePlan({...d, plans: []});
                }
                return;
            default:
                return;
        }
    };
    
    
    return <View className={cx(styles.container)}>
        <NavBar config={{
            ...config,
        }}/>
        <View className={cx(styles.week, styles.weekP)} style={{top: `${base.common.navBarHeight}px`}}>
            {["日", "一", "二", "三", "四", "五", "六"].map((w, k) => {
                return <View key={k} className={styles.weekV}>
                    {w}
                </View>;
            })}
        </View>
        <View className={styles.weekP}/>
        <View className={styles.calendar}>
            {calendarDays.map((m, k) => {
                return <View key={k} className={styles.month}>
                    <View className={styles.monthValue}>
                        {m.year}年{m.month}月
                    </View>
                    <View className={styles.days}>
                        {m.days.map((d, kk) => {
                            const activeS = (d || {}).day === time.s;
                            const activeE = (d || {}).day === time.e;
                            return d ? <View
                                key={kk}
                                className={cx(styles.day, {
                                    [styles.dayRest]: d.ih,
                                    [styles.activeS]: activeS,
                                    [styles.activeE]: activeE,
                                    [styles.active]: activeS && activeE
                                })}
                                style={{flexBasis: `${14.2857}%`}}
                                onClick={() => change(d, activeS, activeE)}
                            >
                                <View className={styles.dayBox}>
                                    <Text>
                                        {d.d}
                                    </Text>
                                    <Text className={styles.lday}>
                                        {d.day === today ? '今天' : d.lDay}
                                    </Text>
                                </View>
                            </View> : <View
                                key={kk}
                                className={styles.day}
                                style={{flexBasis: `${14.2857}%`}}
                            />;
                        })}
                    </View>
                </View>;
            })}
        </View>
    </View>;
}

export default connect((e: {}) => {
    return {
        planStart: e['plan'].plan.startDate,
        planEnd: e['plan'].plan.endDate,
        plans: e['plan'].plan.plans || []
    };
}, (e) => {
    const planActionFuc = planAction(e);
    return {
        changePlan: planActionFuc.changePlan
    };
})(Index);
