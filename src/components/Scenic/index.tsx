import {View, Textarea, CustomWrapper, SwiperItem, Input, Image} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import Field from "@/components/Field";
import base from "@/modules/base";
import Whether from "@/components/Whether";
import Time from "@/components/Time";
import Ico from "@/components/Ico";
import {connect} from "react-redux";
import MyInput from "@/components/MyInput";

interface Props {
    item: any;
    number: number;
    changeRoute: (k: number, e: any) => void;
    onDelete: (id) => void;
    showIllustrate: () => void;
    location?: {
        longitude?: number;
        latitude?: number;
    };
    changeFood: (item?: {}, show?: any, init?: boolean) => void;
    changePlace: (item?: {}, show?: any, init?: boolean) => void
}

const Scenic: React.FC<Props> = (props) => {
    const {item, number} = props;
    const images = item.images || [];
    
    React.useEffect(() => {
    
    }, []);
    
    const onChange = React.useCallback((e) => {
        props.changeRoute(number, e);
    }, [props.changeRoute, number]);
    
    const chooseImage = React.useCallback(async () => {
        const {tempFilePaths} = await Taro.chooseImage({
            count: 9 - images.length,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera']
        });
        onChange({
            images: [...images, ...(tempFilePaths || []).map((i) => ({url: i, n: true}))]
        });
    }, [images, onChange]);
    
    return <>
        <SwiperItem
            className={styles.swiperItem}
            itemId={item.ct}
        >
            <View className={cx(styles.item)}>
                {React.useMemo(() => {
                    return <Field title={`第${base.common.num[number + 1]}站：`} showButton={number === 0 ? {
                        text: '填写说明',
                        color: '#0d3a4c',
                        onClick: () => props.showIllustrate()
                    } : undefined}/>;
                }, [number, props.showIllustrate])}
                {React.useMemo(() => {
                    return <View className={cx(styles.location, styles.placeholder, styles.mr)}>
                        <View className={styles.edit}>
                            <MyInput
                                className={styles.input}
                                value={item.scenicSpotsName}
                                onInput={(e) => onChange({scenicSpotsName: e.detail.value})}
                                placeholder="填写景点名字"
                                placeholderClass={styles.placeholder}
                            />
                        </View>
                    </View>;
                }, [
                    item.scenicSpotsName,
                    item.lat,
                    onChange
                ])}
                {React.useMemo(() => {
                    return <Field title={`是否需要预约：`}>
                        <Whether
                            whether={item.reservation}
                            onChange={(w) => onChange({reservation: w})}
                        />
                    </Field>;
                }, [item.reservation, onChange])}
                {React.useMemo(() => {
                    return <CustomWrapper>
                        {item.reservation ? <Field title={`预约的小程序：`}>
                            <View className={cx(styles.edit, styles.editB)}>
                                <Input
                                    className={cx(styles.input, styles.inputRight)}
                                    value={item.weappId}
                                    onInput={(e) => onChange({weappId: e.detail.value})}
                                    placeholder="填写微信小程序id"
                                    placeholderTextColor="#959595"
                                    placeholderClass={styles.placeholder}
                                />
                            </View>
                        </Field> : <></>}
                    </CustomWrapper>;
                }, [item.reservation, item.weappId, onChange])}
                {React.useMemo(() => {
                    return <Field title={`是否需要门票：`}>
                        <Whether
                            whether={item.admissionTicket}
                            onChange={(w) => onChange({admissionTicket: w})}
                        />
                    </Field>;
                }, [item.admissionTicket, onChange])}
                {React.useMemo(() => {
                    return <CustomWrapper>
                        {item.admissionTicket ? <Field title={`景点门票价格：`}>
                            <View className={cx(styles.edit, styles.editB)}>
                                <Input
                                    className={cx(styles.input, styles.inputRight)}
                                    value={item.ticket}
                                    onInput={(e) => onChange({ticket: e.detail.value})}
                                    placeholder="填写门票单价"
                                    placeholderTextColor="#959595"
                                    placeholderClass={styles.placeholder}
                                    type="number"
                                />
                                <View className={styles.unit}>元/人</View>
                            </View>
                        </Field> : <></>}
                    </CustomWrapper>;
                }, [item.admissionTicket, item.ticket, onChange])}
                {React.useMemo(() => {
                    return <Field title={`景点营业时间：`}>
                        <View className={cx(styles.row, styles.rowLine)}>
                            <Time
                                value={item.openTime}
                                onChange={(w) => onChange({openTime: w})}
                                defaultValue={["09", "30"]}
                            />
                            <View className={styles.txtSm}>至</View>
                            <Time
                                value={item.closeTime}
                                onChange={(w) => onChange({closeTime: w})}
                                defaultValue={["17", "30"]}
                            />
                        </View>
                    </Field>;
                }, [item.openTime, item.closeTime, onChange])}
                {React.useMemo(() => {
                    return <Field title={`预计到达时间：`}>
                        <View className={cx(styles.row, styles.rowLine)}>
                            <Time
                                value={item.expectedTime}
                                onChange={(w) => onChange({expectedTime: w})}
                                defaultValue={["09", "30"]}
                            />
                        </View>
                    </Field>;
                }, [item.expectedTime, onChange])}
                {/*{React.useMemo(() => {*/}
                {/*    return <Field title={`此处打卡美食：`} onClick={() => props.changeFood({}, true, true)}/>;*/}
                {/*}, [props.changeFood])}*/}
                {/*{React.useMemo(() => {*/}
                {/*    return <View className={cx(styles.row, styles.rowP, styles.rowS)}>*/}
                {/*        <View*/}
                {/*            className={cx(styles.add, styles.add2)}*/}
                {/*            onClick={() => props.changeFood({}, true, true)}*/}
                {/*        >*/}
                {/*            <Ico type="addS" size={35}/>*/}
                {/*        </View>*/}
                {/*        {(item.foods || []).map((i, k) => {*/}
                {/*            return <View key={k} className={cx(styles.imageBox, styles.imageBox2)} onClick={() => {*/}
                {/*                props.changeFood(i, true);*/}
                {/*            }}>*/}
                {/*                <View className={styles.del} onClick={(e) => {*/}
                {/*                    e.stopPropagation();*/}
                {/*                    const newFoods = [...(item.foods || [])];*/}
                {/*                    newFoods.splice(k, 1);*/}
                {/*                    onChange({foods: newFoods});*/}
                {/*                }}>*/}
                {/*                    <Ico type="d" size={30}/>*/}
                {/*                </View>*/}
                {/*                <Ico type="food" size={30} className={styles.foodIcon}/>*/}
                {/*                {i.name || '神秘美食'}*/}
                {/*            </View>;*/}
                {/*        })}*/}
                {/*    </View>;*/}
                {/*}, [item.foods, props.changeFood, onChange])}*/}
                {/*<View className={cx(styles.line)}/>*/}
                {React.useMemo(() => {
                    return <Field title={`此处打卡：`} onClick={() => props.changePlace({}, true, true)}/>;
                }, [props.changePlace])}
                {React.useMemo(() => {
                    return <View className={cx(styles.row, styles.rowP, styles.rowS)}>
                        <View
                            className={cx(styles.add, styles.add2)}
                            onClick={() => props.changePlace({}, true, true)}
                        >
                            <Ico type="addS" size={35}/>
                        </View>
                        {(item.places || []).map((i, k) => {
                            return <View
                                key={k}
                                className={cx(styles.imageBox, styles.imageBox2)}
                                onClick={() => props.changePlace(i, true)}
                            >
                                <View className={styles.del} onClick={(e) => {
                                    e.stopPropagation();
                                    const newPlaces = [...(item.places || [])];
                                    newPlaces.splice(k, 1);
                                    onChange({places: newPlaces});
                                }}>
                                    <Ico type="d" size={30}/>
                                </View>
                                <Ico type="footer" size={30} className={styles.foodIcon}/>
                                {i.name || '打卡'}
                            </View>;
                        })}
                    </View>;
                }, [item.places, props.changePlace, onChange])}
                <View className={cx(styles.line)}/>
                {React.useMemo(() => {
                    return <Field title={`其他有帮助的图片：`} mode={2}>
                        <View className={cx(styles.row, styles.rowP, styles.rowS)}>
                            <View className={styles.add} onClick={chooseImage}>
                                <Ico type="addS" size={35}/>
                            </View>
                            {images.map(({url}, k) => {
                                return <View className={styles.imageBox} key={k}>
                                    <View className={styles.del} onClick={() => {
                                        const newImages = [...images];
                                        newImages.splice(k, 1);
                                        onChange({
                                            images: newImages
                                        });
                                    }}>
                                        <Ico type="d" size={30}/>
                                    </View>
                                    <View className={styles.box} onClick={() => {
                                        Taro.previewImage({
                                            current: url || "",
                                            urls: (images || []).map((e) => e.url).filter(Boolean)
                                        });
                                    }}>
                                        <Image src={url} className={styles.image} mode="aspectFill"/>
                                    </View>
                                </View>;
                            })}
                        </View>
                    </Field>;
                }, [images, onChange])}
                <View className={cx(styles.line, styles.lineMr)}/>
                {React.useMemo(() => {
                    return <Field title={`备注：`} mode={2}>
                        <CustomWrapper>
                            <Textarea
                                className={styles.textArea}
                                value={item.desc}
                                onInput={(e) => onChange({desc: e.detail.value})}
                                cursorSpacing={85}
                            />
                        </CustomWrapper>
                    </Field>;
                }, [item.desc, onChange])}
            </View>
        </SwiperItem>
    </>;
};

Scenic.defaultProps = {};

export default React.memo(connect((e: {}) => {
    return {
        location: e['common'].location
    };
})(Scenic));
