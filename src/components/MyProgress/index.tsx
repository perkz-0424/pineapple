import Taro from "@tarojs/taro";
import React from "react";
import {Progress, RootPortal, Text, View} from "@tarojs/components";
import cx from "classnames";
import styles from './index.module.scss';

interface Props {
    className?: string;
    show?: boolean;
    percent?: number;
}


const MyProgress: React.FC<Props> = (props) => {
    return  <RootPortal enable={true}>
        <View className={cx(styles.percent, {
            [styles.hidden]: !props.show
        }, props.className)}>
            <View
                className={cx(styles.mask)}
            />
            <View className={cx(styles.main)}>
                <Text>正在上传</Text>
                <Progress
                    percent={(props.percent || 0) * 100}
                    strokeWidth={5}
                    active={true}
                    activeColor="#f6a543"
                    className={styles.progress}
                    borderRadius={5}
                    duration={0}
                    activeMode="forwards"
                />
            </View>
        </View>
    </RootPortal>;
};

MyProgress.defaultProps = {};

export default React.memo(MyProgress);
