import {Button, ButtonProps} from '@tarojs/components';
import Taro from "@tarojs/taro";
import React from "react";
import cx from "classnames";
import styles from './index.module.scss';

interface Props extends ButtonProps {
    children?: React.ReactNode;
    onChooseImage?: (path: string) => void;
    className?: string;
}


const Avatar: React.FC<Props> = (props) => {
    const {children, className, openType, onClick, onChooseAvatar, onChooseImage, ...restProps} = props;
    const can = React.useMemo(() => {
        return Taro.canIUse('button.open-type.chooseAvatar');
    }, []);
    
    const chooseNotCan = React.useCallback(async () => {
        const {tempFilePaths} = await Taro.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
        });
        if (onChooseImage && tempFilePaths[0]) {
            onChooseImage(tempFilePaths[0]);
        }
    }, []);
    
    
    
    return <Button
        {...restProps}
        className={cx(styles.button, className)}
        openType={can ? 'chooseAvatar' : undefined}
        onChooseAvatar={(can && onChooseImage) ? (e) => {
            const {avatarUrl} = e.detail;
            onChooseImage(avatarUrl);
        } : undefined}
        onClick={(!can && onChooseImage) ? chooseNotCan : undefined}
    >
        {children}
    </Button>;
};

Avatar.defaultProps = {};

export default React.memo(Avatar);
