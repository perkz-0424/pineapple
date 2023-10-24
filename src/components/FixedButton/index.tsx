import React from "react";
import {View, Button, ButtonProps, Text} from '@tarojs/components';
import Taro from "@tarojs/taro";
import styles from './index.module.scss';
import cx from "classnames";
import base from "@/modules/base";

interface Props {
    onClick?: (e) => void;
    text?: string;
    disabled?: boolean;
    openType?: ButtonProps.OpenType;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    textStyle?: React.CSSProperties;
}

const FixedButton: React.FC<Props> = (props: Props) => {
    const timer = React.useRef<NodeJS.Timeout>();
    const [disabledClick, setDisabledClick] = React.useState(false);
    
    React.useEffect(() => {
        return () => {
            timer.current && clearTimeout(timer.current);
        };
    }, []);
    return <>
        <View className={cx(styles.p, {
            [styles.ipx]: base.is.isIphoneX()
        })}/>
        <View className={cx(styles.fixedBottom, {
            [styles.disabled]: props.disabled,
            [styles.ipx]: base.is.isIphoneX()
        })}>
            <Button className={styles.btn} onClick={(e) => {
                if (props.onClick && !props.disabled && !disabledClick) {
                    props.onClick(e);
                    setDisabledClick(true);
                    timer.current && clearTimeout(timer.current);
                    timer.current = setTimeout(() => setDisabledClick(false), 2000);
                }
            }} openType={props.openType} style={props.style}>
                <Text className={styles.txt} style={props.textStyle}>{props.text || '保存'}</Text>
            </Button>
        </View>
    </>;
};

FixedButton.defaultProps = {};

export default React.memo(FixedButton);
