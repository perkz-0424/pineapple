import React from "react";
import {View, Text, CustomWrapper} from '@tarojs/components';
import Taro from "@tarojs/taro";
import styles from './index.module.scss';
import cx from "classnames";
import base from "@/modules/base";
import Ico from "@/components/Ico";

export type MenuType = 'home' | 'book' | 'mine';

interface Props {
    menu?: MenuType;
    className?: string;
}


const MENUS = [
    {
        icon: 'pineappleDefault',
        iconActive: 'pineapple',
        name: '首页',
        route: 'home',
        iconSize: 45
    },
    {
        icon: 'bookDefault',
        iconActive: 'book',
        name: '广场',
        route: 'book',
        iconSize: 45,
        isDev: true,
    },
    {
        icon: 'mineDefault',
        iconActive: 'mine',
        name: '我的',
        route: 'mine',
        iconSize: 45
    }
] as const;


const Menus: React.FC<Props> = (props) => {
    
    return <CustomWrapper>
        <View className={cx(styles.placeholder, {
            [styles.ipxP]: base.is.isIphoneX()
        })}/>
        <View className={cx(styles.container, {
            [styles.ipx]: base.is.isIphoneX()
        })}>
            {MENUS.map((item, index) => {
                const active = props.menu === item.route;
                return <View key={index} className={cx(styles.menu, {
                    [styles.activeMenus]: active
                })} onClick={() => {
                    if (item['isDev']) {
                        return Taro.showToast({title: '开发中', icon: 'none'});
                    }
                    if (!active) {
                        base.navigator.switchTab(item.route);
                    }
                }}>
                    <View style={{height: `${item.iconSize}rpx`, overflow: 'hidden', justifyContent: "flex-end"}}>
                        <Ico
                            type={(active) ? item.iconActive : item.icon}
                            size={item.iconSize}/>
                    </View>
                    <Text className={styles.name}>
                        {item.name}
                    </Text>
                </View>;
            })}
        </View>
    </CustomWrapper>;
};

Menus.defaultProps = {
    menu: 'home'
};

export default Menus;
