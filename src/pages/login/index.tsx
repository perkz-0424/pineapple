import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {View, Text, Image, Button} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import Ico from "@/components/Ico";


function Index () {
    const [shaking, setShaking] = React.useState(false);
    const [agree, setAgree] = React.useState(false);
    const timer = React.useRef<NodeJS.Timeout>();
    
    
    React.useEffect(() => {
        return () => {
            timer.current && clearTimeout(timer.current);
        };
    }, []);
    
    const onShaking = () => {
        setShaking(true);
        timer.current = setTimeout(() => setShaking(false), 800);
    };
    
    const onGetPhone = async (event) => {
    
    };
    return <View className={styles.container}>
        <View style={{height: base.common.navBarHeight + 'px', marginBottom: '200rpx'}}/>
        <View className={styles.icon}>
            <Ico type="pineapple" size={120}/>
        </View>
        <Button
            openType={agree ? 'getPhoneNumber' : undefined}
            className={styles.button}
            onGetPhoneNumber={agree ? onGetPhone : undefined}
            onClick={() => !agree && onShaking()}
        >
            <Text className={styles.buttonText}>
                快捷手机号绑定
            </Text>
        </Button>
        <View className={styles.policyBox}>
            <View className={cx(styles.policy, {
                [styles.policyAni]: shaking
            })} onClick={() => setAgree(!agree)}>
                {agree ? <Image src={base.assets.checkRed} className={cx(styles.img)}/> :
                    <View className={styles.circle}/>}
                <Text decode>&nbsp;</Text>
                <Text>绑定即表示同意</Text>
                <View className={styles.link} onClick={e => {
                    e.stopPropagation();
                  
                }}>《用户协议》</View>
                <Text>和</Text>
                <View className={styles.link} onClick={e => {
                    e.stopPropagation();
                    
                }}>《用户隐私政策》</View>
            </View>
        </View>
    </View>;
}

export default connect((e: {}) => ({
    userinfo: e['common']['userinfo'] || {}
}))(Index);
