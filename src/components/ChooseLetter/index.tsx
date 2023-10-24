import {Text, View} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import base from "@/modules/base";

interface Props {
    cities: any[];
    onChange: (item) => void;
    offsetTop?: number;
}

const ChooseLetter: React.FC<Props> = (props: Props) => {
    const [bodyHeight, setBodyHeight] = React.useState(0);
    const [show, setShow] = React.useState(false);
    const [item, setItem] = React.useState<any>({});
    const {cities} = props;
    
    const offsetTop = React.useMemo(() => {
        return (props.offsetTop || 0) + base.common.navBarHeight;
    }, [props.offsetTop])
    
    const onTouchStart = React.useCallback((e) => {
        e.stopPropagation();
        if (cities.length) {
            setShow(true);
            const query = Taro.createSelectorQuery();
            query.select('#chooseLetter').boundingClientRect(rect => {
                const bodyHeight = rect['height'];
                setBodyHeight(bodyHeight);
                const everyHeight = bodyHeight / cities.length;
                const targetHeight = e.touches[0].clientY - offsetTop - 10;
                const index = Math.floor(targetHeight / everyHeight);
                const item = cities[index];
                if (item) {
                    setItem(item);
                    props.onChange(item);
                }
            }).exec();
        }
    }, [cities.length]);
    
    const onTouchMove = React.useCallback((e) => {
        e.stopPropagation();
        if (cities.length) {
            const everyHeight = bodyHeight / cities.length;
            const targetHeight = e.touches[0].clientY - offsetTop - 10;
            const index = Math.floor(targetHeight / everyHeight);
            const newItem = cities[index];
            if (newItem && newItem.key !== item.key) {
                setItem(newItem);
                props.onChange(newItem);
            }
        }
    }, [cities.length, bodyHeight, item.key]);
    
    return <>
        <View
            id="chooseLetter"
            className={styles.fixed}
            style={{top: `calc(${offsetTop + 10}px)`}}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={(e) => {
                e.stopPropagation();
                setShow(false);
                setItem({});
            }}
            catchMove={true}
        >
            {cities.map((i, index) => {
                const active = show && i.key === item.key;
                return <View key={index} className={styles.key}>
                    <View className={cx(styles.letter, {
                        [styles.letterActive]: active
                    })}>
                        {i.title}
                    </View>
                    {active ? <View className={styles.circle}>
                        <Text>
                            {i.title}
                        </Text>
                    </View> : <></>}
                </View>;
            })}
        </View>
    </>;
};

ChooseLetter.defaultProps = {};

export default React.memo(ChooseLetter);
