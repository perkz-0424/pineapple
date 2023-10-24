import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {View, Text, Swiper, SwiperItem} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import Menus from "@/components/Menus";
import Ico from "@/components/Ico";
import dayjs from "dayjs";
import calendar from "@/modules/calendar";
import homeAction from "@/modules/redux/home/action";


function Index (props) {
    const today = React.useRef(calendar.getDay(dayjs())).current;
    const ready = React.useRef(false);
    React.useEffect(() => {
        if (props.uid && !ready.current) {
            init();
        }
        return () => {
        
        };
    }, [props.uid]);
    
    const init = async () => {
        Taro.showLoading({title: '加载中', mask: true});
        const [myPlan] = await Promise.all([
            props.getMyPlan(true),
        ]);
        props.setState({myPlan});
        ready.current = true;
        Taro.hideLoading();
    };
    
    return <View className={cx(styles.container)} style={{opacity: props.ttf ? 1 : 0}}>
        <View style={{height: base.common.navBarHeight + 'px'}} className={styles.user}>
            <View style={{height: `${base.system.statusBarHeight}px`}}/>
            <View className={styles.location}>
                <View className={styles.left}>
                    <View className={cx(styles.btn)}>
                        {props.address || ''}
                        {/*<Ico size={17} type="triangleW" className={styles.icon}/>*/}
                        {props.weather ? <Text className={styles.weather}>
                            {props.weather.condition} {props.weather.temp}°C
                        </Text> : <></>}
                    </View>
                </View>
            </View>
        </View>
        <View className={styles.main}>
            <View className={styles.left}>
                <Text className={styles.text}>
                    菠萝旅行笔记本
                </Text>
                <Text className={styles.small}>
                    让您的旅行更安心
                </Text>
            </View>
            <View className={styles.right}>
                <Ico type="pineapple" size={200}/>
            </View>
        </View>
        <View className={styles.tab}>
            <View className={styles.box}>
                {props.myPlan.length ? <Swiper
                    className={styles.swiper}
                    autoplay={true}
                    indicatorDots={props.myPlan.length > 1}
                    indicatorActiveColor="#f6a543"
                >
                    {props.myPlan.map((plan, k) => {
                        const diff = dayjs(plan.endDate).diff(plan.startDate, 'day');
                        return <SwiperItem
                            key={k}
                            className={styles.swiperItem}
                            onClick={() => base.navigator.push("events", {
                                vid: JSON.stringify(plan.vid)
                            })}
                        >
                            <View className={styles.name}>
                                <Text className={styles.title}>今日行程：</Text>
                                <Text className={styles.nameValue}>
                                    {plan.name}
                                </Text>
                            </View>
                            <View className={styles.mainItem}>
                                <View className={styles.itemLeft}>
                                    <View className={styles.leftItem}>
                                        从<Text className={styles.departure}>{plan.departure}</Text>出发
                                    </View>
                                    <View className={styles.leftItem}>
                                        前往<Text className={styles.destination}>{plan.destination}</Text>
                                    </View>
                                    <View className={styles.leftItem}>
                                        <Text className={styles.diff}>共{diff + 1}天{diff ? `${diff}夜` : <></>}</Text>
                                    </View>
                                </View>
                                <View className={styles.itemRight}>
                                    <Ico type="travel" size={200} className={styles.icon}/>
                                </View>
                            </View>
                        </SwiperItem>;
                    })}
                </Swiper> : <View
                    className={styles.swiper}
                    onClick={() => base.navigator.push("plan")}
                >
                    <View className={styles.swiperItem}>
                        <View className={styles.name}>
                            <Text className={styles.title}>今日没有行程</Text>
                        </View>
                        <View className={styles.mainItem}>
                            <View className={cx(styles.itemLeft, styles.itemLeftEnd)}>
                                <View className={styles.leftItem}>
                                    <View className={styles.travelG}>
                                        <Ico size={40} type="travelG"/>
                                    </View>
                                    去添加行程
                                </View>
                            </View>
                            <View className={styles.itemRight}>
                                <Ico type="travel" size={200} className={styles.icon}/>
                            </View>
                        </View>
                    </View>
                </View>}
            </View>
        </View>
        <View className={styles.tab}>
            <View className={cx(styles.box, styles.box1)} onClick={() => base.navigator.push("eventsCalendar")}>
                <View className={styles.month}>
                    {today.y}年{today.m}月{base.common.weeks[today.w]}
                </View>
                <View className={styles.date}>
                    {today.d}
                </View>
                <View className={cx(styles.month, styles.chineseDate)}>
                    {today.lDay}
                </View>
            </View>
            <View className={cx(styles.box, styles.box2)} style={{opacity: 0}}>
            
            </View>
        </View>
        <Menus menu="home"/>
    </View>;
}

export default connect((e: {}) => {
    return {
        address: e['common'].location.address,
        weather: e['common'].weather,
        ttf: e['common'].ttf,
        uid: (e['common'].userinfo || {})._id || '',
        ...e['home'],
    };
}, (d) => {
    return {
        ...homeAction(d)
    };
})(Index);
