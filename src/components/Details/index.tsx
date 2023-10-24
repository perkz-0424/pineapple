import {Image, SwiperItem, Text, View} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import base from "@/modules/base";
import Ico from "@/components/Ico";

interface Props {
    hX: number;
    routes: any[];
    setLocation: (e) => void;
    setPoint: (e) => void;
}


const Details: React.FC<Props> = (props) => {
    const [left, setLeft] = React.useState<any[]>([]);
    const [right, setRight] = React.useState<any[]>([]);
    
    React.useEffect(() => {
        const left: any[] = [];
        const right: any[] = [];
        (props.routes || []).forEach((i, k) => {
            if ((k + 1) % 2 === 1) {
                left.push(i);
            } else {
                right.push(i);
            }
        });
        setLeft(left);
        setRight(right);
    }, [props.routes]);
    
    const getItems = React.useCallback((list) => {
        return list.map((e, o) => {
            return <View key={o} className={styles.itemC} onClick={() => {
                if (e.lat) {
                    props.setLocation({lng: e.lng, lat: e.lat});
                }
            }}>
                <View className={styles.name}>
                    <Text className={cx(styles.nameText, styles.nameTextAL)}>
                        {(e.scenicSpotsName || '某景点').substring(0, 10)}
                    </Text>
                </View>
                {typeof e.reservation === "boolean" ? <View className={styles.name}>
                    是否需要预约：<Text className={styles.nameText}>
                    {e.reservation ? '是' : '否'}
                </Text>
                </View> : <></>}
                {e.weappId ? <View className={styles.name}
                                   onClick={() => base.navigator.redirectToWeapp(e.weappId)}>
                    预约的小程序：<Ico type="weapp" size={40}/>
                </View> : <></>}
                {e.admissionTicket && e.ticket ? <View className={styles.name}>
                    景点门票价格：<Text className={styles.nameText}>{e.ticket}元</Text>
                </View> : <></>}
                {e.openTime || e.closeTime ? <View className={styles.name}>
                    营业时间：
                    <Text className={cx(styles.nameText, styles.nameTextS)}>
                        {((e.openTime || []).join(":") || "09:30") + '至' + ((e.closeTime || []).join(":") || "17:30")}
                    </Text>
                </View> : <></>}
                {e.expectedTime ? <View className={styles.name}>
                    预计到达时间：
                    <Text className={cx(styles.nameText, styles.nameTextS)}>
                        {(e.expectedTime || []).join(":")}
                    </Text>
                </View> : <></>}
                {e.foods && e.foods ? <View className={cx(styles.name, styles.imagesBox)}>
                    此处打卡美食：
                    <View className={styles.itemList}>
                        {e.foods.map((i) => {
                            return <Text className={styles.itemItem} onClick={(e) => {
                                e.stopPropagation();
                                if (i.lat) {
                                    props.setPoint(i.ct);
                                    props.setLocation({lng: i.lng, lat: i.lat});
                                }
                            }}>
                                <Text className={styles.tag}>{i.name || '神秘美食'}</Text>
                                {i.desc ? `：${i.desc}` : ''}
                            </Text>;
                        })}
                    </View>
                </View> : <></>}
                {e.places && e.places ? <View className={cx(styles.name, styles.imagesBox)}>
                    此处打卡景点：
                    <View className={styles.itemList}>
                        {e.places.map((i) => {
                            return <Text className={styles.itemItem} onClick={(e) => {
                                e.stopPropagation();
                                if (i.lat) {
                                    props.setPoint(i.ct);
                                    props.setLocation({lng: i.lng, lat: i.lat});
                                }
                            }}>
                                <Text className={styles.tag}>{i.name || '向往美景'}</Text>
                                {i.desc ? `：${i.desc}` : ''}
                            </Text>;
                        })}
                    </View>
                </View> : <></>}
                {e.images && e.images.length ?
                    <View className={cx(styles.name, styles.imagesBox)}>
                        图片：
                        <View className={cx(styles.images)}>
                            {(e.images || []).map((i, k) => {
                                return <Image
                                    src={i.url}
                                    key={k}
                                    className={styles.image}
                                    mode="aspectFill"
                                    onClick={() => {
                                        Taro.previewImage({
                                            current: i.url,
                                            urls: (e.images || []).map((e) => e.url).filter(Boolean)
                                        });
                                    }}
                                />;
                            })}
                        </View>
                    </View> : <></>}
                {e.desc ? <View className={styles.name}>
                    <Text className={styles.desc}>
                        备注：<Text className={styles.nameText}>
                        {e.desc}
                    </Text>
                    </Text>
                </View> : <></>}
            </View>;
        });
    }, [props.setLocation, props.setPoint]);
    
    return <SwiperItem
        className={styles.item}
        style={{height: `calc(80vh - 80rpx - ${props.hX || 0}px)`}}
    >
        <View className={styles.c}>
            <View className={styles.r}>
                {getItems(left)}
            </View>
            <View className={styles.r}>
                {getItems(right)}
            </View>
        </View>
        <View className={cx(styles.fb, {
            [styles.fbx]: base.is.isIphoneX()
        })}/>
    </SwiperItem>;
};

Details.defaultProps = {};

export default React.memo(Details);
