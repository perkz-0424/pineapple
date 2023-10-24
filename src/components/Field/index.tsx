import React from "react";
import {View, Text} from '@tarojs/components';
import Taro from "@tarojs/taro";
import styles from './index.module.scss';
import cx from "classnames";
import base from "@/modules/base";

interface Props {
    id?: string;
    children?: React.ReactNode;
    className?: string;
    title?: string;
    required?: boolean;
    mode?: 1 | 2;
    placeholder?: string;
    showButton?: {
        text: string,
        color: string,
        onClick: () => void,
        style?: React.CSSProperties;
    };
    onClick?: () => void;
}

const Field: React.FC<Props> = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({}));
    
    return <View className={cx(styles.container, props.className)} id={props.id} style={{
        minHeight: `${base.common.navigatorHeight}px`
    }} onClick={props.onClick}>
        <View className={styles.fieldRow} style={{
            minHeight: `${base.common.navigatorHeight}px`
        }}>
            <View
                className={cx(styles.title, {[styles.required]: props.required})}
            >
                <Text>
                    {props.title ? `${props.title || ""}` : ""}
                </Text>
            </View>
            {props.showButton ? <View className={styles.button} style={{
                borderColor: props.showButton.color,
                color: props.showButton.color,
                ...(props.showButton.style || {})
            }} onClick={props.showButton.onClick}>
                {props.showButton.text}
                <View className={styles.buttonArr} style={{
                    borderColor: `transparent ${props.showButton.color}`
                }}/>
            </View> : <></>}
            {props.mode !== 2 ? <View className={styles.rig}>
                <View className={styles.rigInner} style={{
                    minHeight: `${base.common.navigatorHeight}px`
                }}>
                    {props.children}
                </View>
            </View> : <></>}
        </View>
        {props.mode === 2 ? <View className={styles.fieldRow} style={{
            minHeight: `${base.common.navigatorHeight}px`
        }}>
            <View className={styles.fieldContain}>
                {props.children}
            </View>
        </View> : <></>}
    </View>;
});

Field.defaultProps = {};

export default React.memo(Field);
