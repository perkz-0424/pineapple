import {Image, ImageProps} from '@tarojs/components';
import Taro from "@tarojs/taro";
import assets, {AssetsType} from '@/modules/assets';
import React from "react";

interface Props extends Pick<ImageProps, 'onClick'> {
    size: number;
    type: AssetsType;
    onClick?: (e) => void;
    className?: string;
    sizeH?: number;
}


const Ico: React.FC<Props> = (props) => {
    return <Image
        onClick={props.onClick}
        mode={props.sizeH ? 'aspectFill' : 'widthFix'}
        className={props.className}
        src={assets[props.type]}
        style={{width: `${props.size}rpx`, height: props.sizeH ? `${props.sizeH}rpx` : 'auto'}}
    />;
};

Ico.defaultProps = {};

export default React.memo(Ico);
