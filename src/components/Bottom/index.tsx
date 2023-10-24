import {View, RootPortal} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import base from "@/modules/base";
import {Property} from "csstype";

interface Props {
    children?: React.ReactNode;
    className?: string;
    show?: boolean;
    onClickMask?: () => void;
    ref?: React.ForwardedRef<BottomType>;
    height?: Property.Height;
    borderTopRightRadius?: Property.BorderTopRightRadius;
    borderTopLeftRadius?: Property.BorderTopLeftRadius;
    zIndex?: number;
}

export interface BottomType {
    onOpen: () => void;
    onClose: () => void;
}

const Bottom: React.FC<Props> = React.forwardRef((props: Props, ref) => {
    React.useImperativeHandle(ref, () => ({onOpen, onClose}));
    const [show, setShow] = React.useState(props.show);
    React.useEffect(() => {
        setShow(props.show);
    }, [props.show]);
    
    const onOpen = React.useCallback(() => {
        setShow(true);
    }, []);
    
    const onClose = React.useCallback(() => {
        setShow(false);
    }, []);
    
    
    return <RootPortal enable={true}>
        <View className={cx(styles.bottom, {
            [styles.hidden]: !show
        }, props.className)} style={props.zIndex ? {zIndex: props.zIndex} : {}}>
            <View
                onClick={props.onClickMask}
                className={cx(styles.mask)}
            />
            <View className={cx(styles.main, {
                [styles.ipx]: base.is.isIphoneX(),
            })} style={props.height? {
                height: props.height,
                bottom: show ? '0' : `-${props.height}`,
                borderTopRightRadius: props.borderTopRightRadius,
                borderTopLeftRadius: props.borderTopLeftRadius,
            } : undefined}>
                {props.children}
            </View>
        </View>
    </RootPortal>;
});

Bottom.defaultProps = {
    show: false,
};

export default React.memo(Bottom);
