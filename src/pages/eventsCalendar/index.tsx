import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {ScrollView, Text, View} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import config from "./index.config";
import NavBar from "@/components/NavBar";
import calendar from "@/modules/calendar";
import base from "@/modules/base";
import dayjs from "dayjs";
import eventsAction from "@/modules/redux/events/action";
import Bottom from "@/components/Bottom";


type Day = {
    iw: boolean;
    ih: boolean;
    lDay: string;
    y: number;
    m: number;
    d: number;
    w: number;
    day: string;
}

type CalendarDay = {
    days: (Day | undefined)[];
    month: number;
    year: number
}

interface Option {
    showA?: boolean,
    day?: string,
}


function Index (props) {
    const today = React.useRef(dayjs()).current;
    const ipx = React.useRef(base.is.isIphoneX()).current;
    const [calendarDays, setCalendarDays] = React.useState<CalendarDay[]>(base.common.todayCalendar);
    const [option, setOption] = React.useState<Option>({});
    
    React.useEffect(() => {
        if (props.uid) {
            init();
        }
    }, [props.uid]);
    
    const init = async () => {
        Taro.showLoading({title: '加载中', mask: true});
        const target = dayjs().format("YYYY-MM-DD");
        const targetMonth = dayjs(target).startOf("month");
        const nextMonth = targetMonth.add(1, "month");
        const nextNextMonth = targetMonth.add(2, "month");
        const nextNextNextMonth = targetMonth.add(3, "month");
        await props.getDayEvents([{
            y: targetMonth.year(),
            m: targetMonth.month() + 1
        }, {
            y: nextMonth.year(),
            m: nextMonth.month() + 1
        }, {
            y: nextNextMonth.year(),
            m: nextNextMonth.month() + 1
        }, {
            y: nextNextNextMonth.year(),
            m: nextNextNextMonth.month() + 1
        }]);
        Taro.hideLoading();
    };
    
    Taro.usePullDownRefresh(() => {
        Taro.stopPullDownRefresh();
        onTop();
    });
    
    Taro.useReachBottom(() => {
        onBottom();
    });
    
    const onTop = async () => {
        Taro.showLoading({title: '加载中', mask: true});
        const firstMonth = calendarDays[0];
        const month = dayjs(`${firstMonth.year}-${firstMonth.month}-1`).add(-1, "month");
        const list = calendar.getDateList(month, month.endOf("month"));
        const newList = [...list, ...calendarDays];
        setCalendarDays(newList);
        await props.getDayEvents([{
            y: month.year(),
            m: month.month() + 1
        }]);
        Taro.hideLoading();
    };
    
    const onBottom = async () => {
        Taro.showLoading({title: '加载中', mask: true});
        const lastMonth = calendarDays[calendarDays.length - 1];
        const month = dayjs(`${lastMonth.year}-${lastMonth.month}-1`).add(1, "month");
        const list = calendar.getDateList(month, month.endOf("month"));
        const newList = [...calendarDays, ...list];
        setCalendarDays(newList);
        await props.getDayEvents([{
            y: month.year(),
            m: month.month() + 1
        }]);
        Taro.hideLoading();
    };
    
    const targetEvents = React.useMemo(() => {
        if (option.day) {
            return props.dayEvents[option.day] || [];
        } else {
            return [];
        }
    }, [option.day, props.dayEvents]);
    
    const height = React.useMemo(() => {
        return ((4) * 130 + (ipx ? 50 : 0)) + 'rpx';
    }, []);
    
    return <>
        <View className={cx(styles.container)}>
            <NavBar config={{
                ...config,
            }}/>
            <View className={cx(styles.week, styles.weekP)} style={{
                top: `${(base.system.statusBarHeight || 0) + base.common.navigatorHeight}px`
            }}>
                {["日", "一", "二", "三", "四", "五", "六"].map((w, k) => {
                    return <View key={k} className={styles.weekV}>
                        {w}
                    </View>;
                })}
            </View>
            <View className={styles.weekP}/>
            <View className={styles.calendar}>
                {calendarDays.map((m, k) => {
                    return <React.Fragment key={k}>
                        <View className={styles.month}>
                            <View className={styles.monthValue}>
                                {m.year}年{m.month}月
                            </View>
                            <View className={styles.days}>
                                {m.days.map((d, kk) => {
                                    const haveEvents = d ? props.dayEvents[d.day] : undefined;
                                    return d ? <View
                                        key={kk}
                                        className={cx(styles.day, {
                                            [styles.dayRest]: d.ih,
                                            [styles.activeE]: !!haveEvents,
                                            [styles.activeT]: d.day === today.format("YYYY-MM-DD"),
                                        })}
                                        style={{flexBasis: `${14.2857}%`}}
                                        onClick={() => {
                                            if (haveEvents) {
                                                setOption({showA: true, day: d.day});
                                            } else {
                                                const did = Number(dayjs(d.day).format("YYYYMMDD"));
                                                base.navigator.push('addEvents', {
                                                    type: "event",
                                                    did
                                                });
                                            }
                                        }}
                                    >
                                        <View className={styles.dayBox}>
                                            <Text>
                                                {d.d}
                                            </Text>
                                            <Text className={styles.lday}>
                                                {d.day === today.format("YYYY-MM-DD") ? '今天' : d.lDay}
                                            </Text>
                                        </View>
                                    </View> : <View
                                        key={kk}
                                        className={styles.day}
                                        style={{flexBasis: `${14.2857}%`}}
                                    />;
                                })}
                            </View>
                        </View>
                    </React.Fragment>;
                })}
            </View>
        </View>
        <Bottom
            height={height}
            show={!!option.showA}
            onClickMask={() => setOption({...option, showA: false})}
            borderTopLeftRadius="6rpx"
            borderTopRightRadius="6rpx"
        >
            <ScrollView
                className={styles.eventsList}
                scrollX={false}
                scrollY={true}
                enhanced={true}
                showScrollbar={false}
                bounces={false}
            >
                <View className={cx(styles.events, styles.eventsY)} onClick={() => {
                    setOption({...option, showA: false});
                    Taro.nextTick(() => {
                        const did = Number(dayjs(option.day).format("YYYYMMDD"));
                        base.navigator.push('addEvents', {
                            type: "event",
                            did
                        });
                    });
                }}>
                    添加行程
                </View>
                {targetEvents.length ? <>
                    {targetEvents.map((e, key) => {
                        const d = dayjs(option.day).format("MM月DD日");
                        return <View className={styles.events} key={key} onClick={() => {
                            setOption({...option, showA: false});
                            Taro.nextTick(() => {
                                if (e.vid) {
                                    base.navigator.push("events", {vid: JSON.stringify([e.vid])});
                                }
                            });
                        }}>
                            {d}的行程
                        </View>;
                    })}
                </> : <View>
                
                </View>}
            </ScrollView>
        </Bottom>
    </>;
}

export default connect((e: {}) => {
    return {
        dayEvents: e['events'].dayEvents,
        uid: (e['common'].userinfo || {})._id || '',
    };
}, (d) => {
    const events = eventsAction(d);
    return {
        getDayEvents: events.getDayEvents
    };
})(Index);
