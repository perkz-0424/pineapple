import {CustomWrapper, PickerView, PickerViewColumn, RootPortal, View} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import base from "@/modules/base";

type H = "00"
    | '01'
    | '02'
    | '03'
    | '04'
    | '05'
    | '06'
    | '07'
    | '08'
    | '09'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'
    | '22'
    | '23'

type M = '00' | '10' | '20' | '30' | '40' | '50'

interface Props {
    value?: [H, M];
    onChange?: (value: [H, M]) => void;
    defaultValue?: [H, M];
}


const Time: React.FC<Props> = (props) => {
    const [show, setShow] = React.useState(false);
    const preStyle = React.useRef({});
    const [style, setStyle] = React.useState({});
    
    const id = React.useRef(base.tools.randCode()).current;
    
    const value = React.useMemo<[number, number]>(() => {
        if (props.value) {
            const iH = base.common.pickerRangeH.indexOf(props.value[0]);
            const iM = base.common.pickerRangeM.indexOf(props.value[1]);
            return [iH, iM];
        } else {
            if (props.defaultValue) {
                const iH = base.common.pickerRangeH.indexOf(props.defaultValue[0]);
                const iM = base.common.pickerRangeM.indexOf(props.defaultValue[1]);
                return [iH, iM];
            } else {
                return [0, 0];
            }
        }
    }, [
        props.value, props.defaultValue
    ]);
    
    const time = () => {
        return <>
            <PickerView
                className={styles.picker}
                indicatorClass={styles.indicator}
                value={[value[0]]}
                onChange={(e) => {
                    if (props.onChange) {
                        const i = e.detail.value[0];
                        const newValue = [base.common.pickerRangeH[i], base.common.pickerRangeM[value[1]]] as [H, M];
                        props.onChange(newValue);
                    }
                }}
                immediateChange={true}
            >
                <PickerViewColumn>
                    {base.common.pickerRangeH.map((v, i) => <View
                        className={cx(styles.item)} key={i}>{v}</View>)}
                </PickerViewColumn>
            </PickerView>
            <View className={styles.icon}>
                时
            </View>
            <PickerView
                className={styles.picker}
                indicatorClass={styles.indicator}
                value={[value[1]]}
                onChange={(e) => {
                    if (props.onChange) {
                        const i = e.detail.value[0];
                        const newValue = [base.common.pickerRangeH[value[0]], base.common.pickerRangeM[i]] as [H, M];
                        props.onChange(newValue);
                    }
                }}
                immediateChange={true}
            >
                <PickerViewColumn>
                    {base.common.pickerRangeM.map((v, i) => <View className={cx(styles.item)} key={i}>{v}</View>)}
                </PickerViewColumn>
            </PickerView>
            <View className={styles.icon}>
                分
            </View>
        </>
    }
    
    return <>
        <View className={styles.mainT} onClick={() => {
            const query = Taro.createSelectorQuery();
            query.select(`#${id}`).boundingClientRect(rect => {
                if (rect) {
                    const pre = {
                        top: rect['top'] + 'px',
                        left: rect['left'] + 'px',
                    };
                    preStyle.current = pre;
                    setStyle({
                        ...pre,
                        transition: 'none'
                    });
                    Taro.nextTick(() => {
                        setStyle({
                            top: `calc(100vh / 2 - ${rect['height']}px / 2)`,
                            left: `calc(100vw / 2 - ${rect['width']}px / 2)`
                        });
                        setShow(true);
                    })
                }
            }).exec();
        }} id={id}>
            {time()}
        </View>
        {/*<CustomWrapper>*/}
        {/*    <RootPortal enable={true}>*/}
        {/*        <View className={cx(styles.fixed, {[styles.hidden]: !show})}>*/}
        {/*            <View className={cx(styles.mask)} onClick={() => {*/}
        {/*                setStyle(preStyle.current);*/}
        {/*                setShow(false);*/}
        {/*            }}/>*/}
        {/*            <View className={cx(styles.main, styles.mainT)} style={{...style}}>*/}
        {/*                {time()}*/}
        {/*            </View>*/}
        {/*        </View>*/}
        {/*    </RootPortal>*/}
        {/*</CustomWrapper>*/}
    </>;
};

Time.defaultProps = {};

export default React.memo(Time);
