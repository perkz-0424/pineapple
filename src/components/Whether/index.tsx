import {View} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';

interface Props {
    whether?: boolean;
    onChange?: (whether?: boolean) => void;
}

const w = [{title: '是', value: true}, {title: '否', value: false}];


const Whether: React.FC<Props> = (props) => {
    const {} = props;
    
    
    return <View className={styles.main}>
        {w.map((i) => {
            const active = i.value=== props.whether;
            return <View key={i.title} className={cx(styles.item, {
                [styles.left]: i.value,
                [styles.itemActive]: active
            })} onClick={() => !active && props.onChange && props.onChange(i.value)}>
                {i.title}
            </View>
        })}
    </View>;
};

Whether.defaultProps = {};

export default React.memo(Whether);
