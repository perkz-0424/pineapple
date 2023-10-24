import {View} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import Center from "@/components/Center";

interface Props {
    onOk?: () => void;
    onCancel?: (is?:boolean) => void;
    show?: boolean;
    title?: string;
    content?: string;
    cancelText?: string;
    okText?:string;
}


const Warn: React.FC<Props> = (props) => {
    
    
    
    return <Center
        show={props.show}
        onClickMask={() => props.onCancel && props.onCancel()}
        width="570rpx"
        height={props.title ? "400rpx" : '320rpx'}
    >
        {props.title ? <View className={styles.title}>
            {props.title}
        </View> : <></>}
        <View className={styles.body}>
            {props.content}
        </View>
        <View className={styles.footer}>
            <View className={styles.button} onClick={() =>  props.onCancel && props.onCancel(true)}>
                {props.cancelText || '取消'}
            </View>
            <View className={styles.line}/>
            <View className={cx(styles.button, styles.button2)} onClick={props.onOk}>
                {props.okText || '确定'}
            </View>
        </View>
    </Center>;
};

Warn.defaultProps = {};

export default React.memo(Warn);
