import React from "react";
import {View, Text} from '@tarojs/components';
import Taro from "@tarojs/taro";
import styles from './index.module.scss';
import base from "@/modules/base";
import cx from 'classnames';
import Ico from "@/components/Ico";
import {connect} from "react-redux";

export interface NavBarProps {
    config: Taro.PageConfig;
    hiddenLeft?: boolean;
    address?: string;
    onBack?: () => void;
}

const NavBar = (props: NavBarProps) => {
    const {config} = props;
    const canBack = React.useMemo(() => {
        return base.navigator.history().length > 1;
    }, []);
    const isHome = React.useMemo(() => {
        const history = base.navigator.history();
        if (!history[history.length - 1]) {
            return false;
        }
        return ['pages/index/index'].includes(history[history.length - 1].route!);
    }, []);
    
    const isTab = React.useMemo(() => {
        const history = base.navigator.history();
        if (!history[history.length - 1]) {
            return false;
        }
        return [
            'pages/index/index',
            'pages/book/index',
            'pages/history/index',
            'pages/mine/index',
        ].includes(history[history.length - 1].route!);
    }, []);
    
    
    return <>
        <View style={{height: `${base.common.navBarHeight}px`}} catchMove={true}>
            <View className={styles.navbarWrapper}>
                <View
                    className={cx(styles.statusBar)}
                    style={{
                        backgroundColor: config.navigationBarBackgroundColor || '#FFF',
                        height: `${base.system.statusBarHeight}px`
                    }}
                />
                <View
                    className={styles.navigatorBar}
                    style={{
                        backgroundColor: config.navigationBarBackgroundColor || '#FFF',
                        height: `${base.common.navigatorHeight}px`
                    }}
                >
                    {!props.hiddenLeft ? <>
                        {isTab ? <>
                            {isHome ? <View className={styles.left}>
                                <View className={cx(styles.btn, {
                                    [styles.btnW]: config.navigationBarTextStyle === 'white'
                                })}>
                                    {props.address || ''}
                                    <Ico
                                        size={17}
                                        type={config.navigationBarTextStyle === 'white' ?
                                            'triangleW' :
                                            'triangleB'}
                                        className={styles.icon}
                                    />
                                </View>
                            </View> : <View/>}
                        </> : <View onClick={() => {
                            if (props.onBack) {
                                props.onBack();
                            } else {
                                if (canBack) {
                                    base.navigator.back();
                                } else {
                                    base.navigator.switchTab("home");
                                }
                            }
                        }} className={styles.left}>
                            <View className={styles.arr} style={{
                                borderColor: config.navigationBarTextStyle === 'white' ? '#FFF' : '#000'
                            }}/>
                            <View className={cx(styles.btn, {
                                [styles.btnW]: config.navigationBarTextStyle === 'white'
                            })}>
                                {config.navigationBarTitleText}
                            </View>
                        </View>}
                    </> : <View/>}
                    <View
                        style={{color: config.navigationBarTextStyle || '#000'}}
                        className={styles.title}
                    >
                        <Text className={cx(styles.t, {
                            [styles.small]: config.navigationBarTitleText && config.navigationBarTitleText.length > 7
                        })}>
                        
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    </>;
};

NavBar.defaultProps = {
    config: {}
};

export default connect((e: {}) => {
    return {
        address: e['common'].location.address
    };
})(NavBar);
