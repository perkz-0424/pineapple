import {RootPortal, View} from '@tarojs/components';
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
    ref?: React.ForwardedRef<TopType>;
    height?: Property.Height;
    backNode?: React.ReactNode;
    backNodeHeight?: Property.Height;
}

export interface TopType {
    onOpen: () => void;
    onClose: () => void;
}

const Top: React.FC<Props> = React.forwardRef((props: Props, ref) => {
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
        <View className={cx(styles.top, {
            [styles.hidden]: !show,
            [styles.hiddenMainB]: props.backNode && props.backNodeHeight
        }, props.className)}>
            <View
                onClick={props.onClickMask}
                className={cx(styles.mask)}
            />
            {props.backNode && props.backNodeHeight ? <View
                className={cx(styles.backNode)}
                style={{
                    height: props.backNodeHeight,
                    top: show ? `${props.height}` : `calc(${props.height} - ${props.backNodeHeight})`,
                }}
            >
                {props.backNode}
            </View> : <></>}
            <View className={cx(styles.main)} style={props.height ? {
                height: props.height,
                top: show ? '0' : `-${props.height}`,
            } : undefined}>
                {props.children}
            </View>
        </View>
    </RootPortal>;
});

Top.defaultProps = {
    show: false,
};

export default React.memo(Top);
