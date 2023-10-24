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
    ref?: React.ForwardedRef<RightType>;
    width?: Property.Width;
}

export interface RightType {
    onOpen: () => void;
    onClose: () => void;
}

const Right: React.FC<Props> = React.forwardRef((props: Props, ref) => {
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
        <View className={cx(styles.right, {
            [styles.hidden]: !show
        }, props.className)}>
            <View
                onClick={props.onClickMask}
                className={cx(styles.mask)}
            />
            <View className={cx(styles.main, {
                [styles.ipx]: base.is.isIphoneX(),
            })} style={props.width? {
                width: props.width,
                right: show ? '0' : `-${props.width}`,
                paddingTop: `${base.system.statusBarHeight}px`
            } : {
                paddingTop: `${base.system.statusBarHeight}px`
            }}>
                <View style={{height:  `calc(100vh - ${base.system.statusBarHeight}px)`, width: props.width || '100vw'}}>
                    {props.children}
                </View>
            </View>
        </View>
    </RootPortal>;
});

Right.defaultProps = {
    show: false,
};

export default React.memo(Right);
