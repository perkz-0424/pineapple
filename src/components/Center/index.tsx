import {View, RootPortal} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';
import {Property} from "csstype";

interface Props {
    children?: React.ReactNode;
    className?: string;
    show?: boolean;
    onClickMask?: () => void;
    ref?: React.ForwardedRef<BottomType>;
    height?: Property.Height;
    width?: Property.Width;
}

export interface BottomType {
    onOpen: () => void;
    onClose: () => void;
}

const Center: React.FC<Props> = React.forwardRef((props: Props, ref) => {
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
    
    const style = React.useMemo(() => {
        if (props.height && props.width) {
            return {
                height: props.height,
                width: props.width
            };
        }
        if (props.height && !props.width) {
            return {
                height: props.height,
            };
        }
        if (!props.height && props.width) {
            return {
                width: props.width
            };
        }
        return {};
    }, [props.height, props.width]);
    
    
    return <RootPortal enable={true}>
        <View className={cx(styles.center, {
            [styles.hidden]: !show
        }, props.className)}>
            <View
                onClick={props.onClickMask}
                className={cx(styles.mask)}
            />
            <View className={cx(styles.main)} style={style}>
                {props.children}
            </View>
        </View>
    </RootPortal>;
});

Center.defaultProps = {
    show: false,
};

export default React.memo(Center);
