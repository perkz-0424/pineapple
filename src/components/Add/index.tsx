import {CustomWrapper, Input, Map, Text, View, Textarea} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import base from "@/modules/base";
import Ico from "@/components/Ico";
import Right from "@/components/Right";
import {connect} from "react-redux";

type Item = {
    ct?: number;
    name?: string;
    lat?: number;
    lng?: number;
    // 星级
    star?: string;
    desc?: string;
}

interface Props {
    show?: boolean;
    onBack?: () => void;
    location?: {
        longitude?: number;
        latitude?: number;
    }
    item: Item
    onChange: (e: Item) => void;
    
    onSubmit: (e: Item[]) => void;
    list: Item[];
    isFood?: boolean;
}


const Add: React.FC<Props> = (props) => {
    const {show, item, onChange, onSubmit, onBack, isFood} = props;
    
    const info = React.useMemo(() => {
        return {
            nameTitle: isFood ? '美食名字' : '打卡',
            mapTitle: isFood ? '美食位置' : '位置',
            title: isFood ? '美食家' : '特种兵',
            icon: isFood ? 'food' : 'footer' as 'food' | 'footer'
        };
    }, [isFood]);
    
    const chooseLocation = React.useCallback(() => {
        base.location.chooseLocation({
            latitude: item.lat || undefined,
            longitude: item.lng || undefined,
            address: item.name
        }).then((e) => {
            onChange({lat: e.latitude, lng: e.longitude});
        });
    }, [item.lat, item.lng, item.name, onChange]);
    
    const markers = React.useMemo(() => {
        return item.lat ? [{
            width: 30,
            height: 30,
            alpha: 1,
            latitude: item.lat || 0,
            longitude: item.lng || 0,
            iconPath: base.assets.l as string,
            id: item.ct || 0,
        }] : [];
    }, [item.lat, item.lng, item.ct]);
    
    const ok = React.useCallback(() => {
        onBack && onBack();
        const list = [...props.list || []];
        const index = list.findIndex((i) => i.ct === item.ct);
        if (index === -1) {
            list.push(item);
        } else {
            list[index] = item;
        }
        onSubmit(list);
    }, [props.list, item.ct, onSubmit, item, onBack]);
    return <Right
        show={show}
        width="85vw"
        onClickMask={onBack}
    >
        <View className={styles.show}>
            <View className={styles.showMain}>
                {React.useMemo(() => {
                    return <View
                        className={styles.navigatorBar}
                        style={{height: `${base.common.navigatorHeight}px`}}
                    >
                        <View className={styles.left} onClick={onBack}>
                            <View className={styles.arr}/>
                            <View className={cx(styles.btn)}>
                                {info.title}
                            </View>
                            <Ico type={info.icon} size={35}/>
                        </View>
                    </View>;
                }, [info.icon, info.title, onBack])}
                <View className={styles.body}>
                    {React.useMemo(() => {
                        return <View className={styles.bodyName}>
                            {info.nameTitle}：
                            <CustomWrapper>
                                <Input
                                    value={item.name}
                                    onInput={(e) => onChange({name: e.detail.value})}
                                    className={styles.inputValue}
                                />
                            </CustomWrapper>
                        </View>;
                    }, [info.nameTitle, item.name, onChange])}
                    <View className={styles.bodyName}>
                        <View className={styles.boxBox}>
                            <Text>{info.mapTitle}：<Text className={styles.sm}>（点击地图添加定位）</Text></Text>
                            {React.useMemo(() => {
                                return <Map
                                    onClick={chooseLocation}
                                    scale={14}
                                    enablePoi={true}
                                    className={styles.map}
                                    longitude={item.lng || props.location!.longitude || base.common.defaultLocation.longitude}
                                    latitude={item.lat || props.location!.latitude || base.common.defaultLocation.latitude}
                                    showScale={true}
                                    showLocation={true}
                                    enableTraffic={true}
                                    markers={markers}
                                />;
                            }, [
                                markers,
                                chooseLocation,
                                item.lng,
                                item.lat,
                                props.location!.longitude,
                                props.location!.latitude
                            ])}
                        </View>
                    </View>
                    {React.useMemo(() => {
                        return <View className={styles.bodyName}>
                            <View className={styles.boxBox}>
                                <Text>备注：</Text>
                                <CustomWrapper>
                                    <Textarea
                                        className={styles.textarea}
                                        value={item.desc}
                                        onInput={(e) => onChange({desc: e.detail.value})}
                                    />
                                </CustomWrapper>
                            </View>
                        </View>;
                    }, [item.desc, onChange])}
                    
                    <View className={styles.button} onClick={ok}>
                        确定
                    </View>
                </View>
            </View>
        </View>
    </Right>;
};

Add.defaultProps = {};

export default React.memo(connect((e: {}) => {
    return {
        location: e['common'].location
    };
})(Add));
