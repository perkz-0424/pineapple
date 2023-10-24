import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {View} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import Menus from "@/components/Menus";
import config from "./index.config";
import NavBar from "@/components/NavBar";


function Index (props) {
    const router = React.useRef(Taro.useRouter());
    React.useEffect(() => {
        
        return () => {
        
        };
    }, []);
    Taro.useDidShow(async () => {
    
    });
    Taro.useDidHide(() => {
    
    });
    Taro.usePullDownRefresh(async () => {
    
    });
    Taro.useReachBottom(async () => {
    
    });
    
    return <View className={cx(styles.container)}>
        <Menus menu="book"/>
    </View>;
}

export default connect((e: {}) => {

    return {
  
    };
}, (e) => {

    return {

    };
})(Index);
