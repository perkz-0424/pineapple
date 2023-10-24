import React from "react";
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import {Button, View, Text, Image, Input, CustomWrapper} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import Menus from "@/components/Menus";
import Avatar from "@/components/Avatar";
import Bottom from "@/components/Bottom";
import Ico from "@/components/Ico";


function Index (props) {
    const {userinfo} = props;
    const avatarChange = React.useRef(false);
    const [name, setName] = React.useState<string>(userinfo.name || '');
    const [avatar, setAvatar] = React.useState<string>(userinfo.avatar || '');
    const [show, setShow] = React.useState(false);
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
    
    const onSubmit = async () => {
        setShow(false);
        let i = avatar;
        if (avatarChange.current) {
            i = await base.db.common.updateFile(i);
            avatarChange.current = false;
        }
        base.db.user.userUpdate({name, avatar: i});
    };
    const disabled = React.useMemo(() => {
        return !(name !== userinfo.name || avatar !== userinfo.avatar);
    }, [name, avatar, userinfo.name, userinfo.avatar]);
    
    return <>
        <View className={cx(styles.container)}>
            <View className={styles.headerBg}>
                <View style={{height: base.common.navBarHeight + 'px'}} className={styles.top}/>
                <View className={styles.header}>
                    <View className={styles.avatarBox} onClick={() => setShow(true)}>
                        <Image
                            src={userinfo.avatar ? userinfo.avatar : base.assets.avatar}
                            className={styles.avatar}
                            mode="aspectFill"
                        />
                    </View>
                    <View className={styles.content}>
                        <View className={styles.info} onClick={() => setShow(true)}>
                            <View className={styles.name}>
                                <Text className={styles.txt}>{userinfo.name || ''}</Text>
                            </View>
                        </View>
                        <View className={styles.info}>
                            <View className={cx(styles.name, styles.bind)}>
                                <Text className={cx(styles.txt, styles.txtSm)}>
                                    {userinfo.mobile || ''}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            
            <Menus menu="mine"/>
        </View>
        <Bottom
            show={show}
            height="540rpx"
        >
            <View className={styles.main}>
                <View className={styles.company}>
                    <View className={styles.ico}>
                        <Ico type="pineapple" size={40}/>
                    </View>
                    <Text className={styles.companyName}>菠萝旅行笔记本 申请</Text>
                </View>
                <View className={styles.tipBox}>
                    <Text className={styles.tip}>
                        获取您的头像、昵称
                    </Text>
                    <Text className={styles.tipSm}>
                        方便为您更好的服务
                    </Text>
                </View>
                <CustomWrapper>
                    <View className={styles.body}>
                        <View className={styles.field}>
                            <Text className={styles.fieldName}>
                                头像
                            </Text>
                            <View className={styles.row}>
                                <Avatar
                                    className={styles.fieldAvatar}
                                    onChooseImage={(e) => {
                                        avatarChange.current = true;
                                        setAvatar(e);
                                    }}
                                >
                                    <Image
                                        src={avatar ? avatar : base.assets.avatar}
                                        className={styles.avatarImage}
                                        mode="aspectFill"
                                    />
                                </Avatar>
                            </View>
                        </View>
                        <View className={styles.field}>
                            <Text className={styles.fieldName}>
                                昵称
                            </Text>
                            <Input
                                type="nickname"
                                className={styles.input}
                                cursorSpacing={50}
                                value={name}
                                onInput={(e) => setName(e.detail.value)}
                                placeholder="请输入昵称"
                                placeholderTextColor="#868686"
                                maxlength={10}
                            />
                        </View>
                    </View>
                </CustomWrapper>
                <View className={styles.footer}>
                    <Button className={styles.btn} onClick={() => setShow(false)}>
                        取 消
                    </Button>
                    <Button
                        className={cx(styles.btn, styles.btnC, {
                            [styles.disabled]: disabled
                        })}
                        onClick={onSubmit}
                        disabled={disabled}
                    >
                        确 定
                    </Button>
                </View>
            </View>
        </Bottom>
    </>;
}

export default connect((e: {}) => {
    return {
        userinfo: e['common'].userinfo || {}
    };
})(Index);
