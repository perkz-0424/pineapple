import Taro from "@tarojs/taro";

const homeStore = {
    namespace: 'home',
    state: {
        myPlan: Taro.getStorageSync("PLAN_TODAY") || []
    },
};

export default homeStore;

