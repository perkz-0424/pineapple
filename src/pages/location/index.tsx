import React from "react";
import styles from './index.module.scss';
import Taro, {getStorageSync, setStorageSync} from '@tarojs/taro';
import {View, Input, CustomWrapper, ScrollView} from '@tarojs/components';
import {connect} from "react-redux";
import cx from "classnames";
import base from "@/modules/base";
import config from "./index.config";
import NavBar from "@/components/NavBar";
import ChooseLetter from "@/components/ChooseLetter";
import Ico from "@/components/Ico";
import planAction from "@/modules/redux/plan/action";

let h = 0;

function Index (props) {
    const router = React.useRef(Taro.useRouter()).current;
    const {cities} = props;
    const st = React.useRef(0);
    const timer = React.useRef<NodeJS.Timeout>();
    const [height, setHeight] = React.useState(h);
    const [showSearchValue, setShowSearchValue] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [list, setList] = React.useState<any[]>([]);
    
    React.useEffect(() => {
        const query = Taro.createSelectorQuery();
        query.select("#searchP").boundingClientRect((rect) => {
            if (rect) {
                setHeight(rect['height']);
                h = rect['height'];
            }
        }).exec();
        return () => {
            timer.current && clearTimeout(timer.current);
        };
    }, []);
    
    const historyList = React.useMemo(() => {
        return getStorageSync("HISTORY_ADDRESS_CHOOSE") || [];
    }, []);
    const top = React.useMemo(() => {
        return base.common.navBarHeight + height;
    }, [height]);
    
    const onChangeLetter = (e) => {
        if (e) {
            const id = `#LETTER_${e.key}`;
            const query = Taro.createSelectorQuery();
            query.select(id).boundingClientRect(changeScroll).exec();
        }
    };
    
    const changeScroll = (rect) => {
        timer.current && clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            const itemTop = st.current + rect['top'] - top;
            Taro.pageScrollTo({scrollTop: itemTop, duration: 0}).then(() => {
                st.current = itemTop;
            });
        }, 100);
    };
    
    Taro.usePageScroll((e) => {
        st.current = e.scrollTop;
    });
    
    const changeInput = (e) => {
        if (!showSearchValue) {
            setShowSearchValue(true);
        }
        setInputValue(e);
        timer.current && clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            searchCities(e);
        }, 300);
    };
    
    const searchCities = (e) => {
        if (e) {
            const list = props.allCities.filter((i) => {
                return (i.key === e.toUpperCase()) || (i.keys || []).includes(e) || i.name.match(e);
            });
            if (list.length) {
                setList(base.tools.duplicateRemoval([{name: e}, ...list.splice(0, 15)], "name"));
            } else {
                setList([{name: e}]);
            }
        } else {
            setList([]);
        }
    };
    
    const onChangeHistory = (e) => {
        const newList = base.tools.duplicateRemoval([e, ...historyList]).splice(0, 10);
        setStorageSync("HISTORY_ADDRESS_CHOOSE", newList);
    };
    
    const onChoose = React.useCallback((e) => {
        onChangeHistory(e);
        switch (router.params.type) {
            case "departure":
                props.changePlan({departure: e});
                break;
            case "destination":
                props.changePlan({destination: e});
                break;
            default:
        }
        base.navigator.back();
    }, []);
    
    const navigationBarTitleText = React.useMemo(() => {
        switch (router.params.type) {
            case "departure":
                return "出发地选择";
            case "destination":
                return "目的地选择";
            default:
                return "位置选择";
        }
    }, []);
    
    
    return <View className={cx(styles.container)}>
        <NavBar config={{
            ...config,
            navigationBarTitleText
        }}/>
        <CustomWrapper>
            <View className={styles.search} style={{top: `${base.common.navBarHeight}px`}} catchMove={true}>
                <View className={styles.input}>
                    <Ico type="search" size={27}/>
                    <Input
                        placeholder="输入城市名"
                        className={styles.inputBox}
                        maxlength={32}
                        value={inputValue}
                        onInput={(e) => changeInput(e.detail.value)}
                        onFocus={() => {
                            if (inputValue) {
                                setShowSearchValue(true);
                            }
                        }}
                    />
                    {showSearchValue ? <View className={styles.cancel} onClick={() => setShowSearchValue(false)}>
                        取消
                    </View> : <></>}
                </View>
            </View>
        </CustomWrapper>
        <View className={styles.searchP} id="searchP" catchMove={true}/>
        {height ? <>
            {props.location.city ? <View>
                <View className={cx(styles.letter, styles.letterSm)}
                      style={{top: `${top}px`}}>
                    你所在的地区
                </View>
                <View className={styles.tags}>
                    <View className={styles.tag} onClick={() => onChoose(props.location.city)}>
                        <Ico size={28} type="location" className={styles.icon}/>
                        {(props.location.city || '')}
                    </View>
                </View>
            </View> : <></>}
            {historyList.length ? <View>
                <View className={cx(styles.letter, styles.letterSm)}
                      style={{top: `${top}px`}}>
                    地区选择历史
                </View>
                <View className={styles.tags}>
                    {historyList.map((c) => {
                        return <View
                            className={cx(styles.tag, styles.tagB)}
                            key={c}
                            onClick={() => onChoose(c)}
                        >
                            {c}
                        </View>;
                    })}
                </View>
            </View> : <></>}
            <View>
                <View
                    className={cx(styles.letter, styles.letterSm)}
                    style={{top: `${top}px`}}>
                    热门城市
                </View>
                <View className={styles.tags}>
                    {base.common.hotCities.map((c) => {
                        return <View
                            className={cx(styles.tag, styles.tagB)}
                            key={c}
                            onClick={() => onChoose(c)}
                        >
                            {c}
                        </View>;
                    })}
                </View>
            </View>
            {cities.map((item, index) => {
                return <View key={index} id={`LETTER_${item.key}`}>
                    <View className={styles.letter}
                          style={{top: `${top}px`}}>
                        {item.title}
                    </View>
                    <View className={styles.items}>
                        {item.items.map((i, k) => {
                            return <View key={k} className={styles.item} onClick={() => onChoose(i.name)}>
                                {i.name}
                            </View>;
                        })}
                    </View>
                </View>;
            })}
            <View className={styles.bottom}/>
            <ChooseLetter cities={cities} onChange={onChangeLetter} offsetTop={height}/>
        </> : <></>}
        <View className={cx(styles.searchValue, {
            [styles.searchValueShow]: showSearchValue
        })} catchMove={showSearchValue ? true : undefined}>
            {showSearchValue ? <ScrollView className={styles.scroll} scrollY={true} scrollX={false}>
                <View style={{height: `${top}px`}}/>
                {list.length ? <React.Fragment>
                    {list.map((i, k) => {
                        return <View
                            key={k}
                            className={cx(styles.searchItem, {
                                [styles.searchItemEnd]: k === list.length - 1
                            })}
                            onClick={() => {
                                setShowSearchValue(false);
                                onChoose(i.name);
                            }}>
                            {i.name}
                        </View>;
                    })}
                </React.Fragment> : <React.Fragment/>}
                <View className={styles.bottom}/>
            </ScrollView> : <></>}
        </View>
    </View>;
}

export default connect((e: {}) => {
    return {
        cities: e['common'].cities,
        allCities: e['common'].allCities,
        location: e['common'].location,
    };
}, (e) => {
    const planActionFuc = planAction(e);
    return {
        changePlan: planActionFuc.changePlan
    };
})(Index);
