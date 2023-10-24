import Taro from "@tarojs/taro";

export default class Setting {
    // 打开设置
    public openSetting = (settingOption: { content: string; title: string; authSetting?: string; }) => {
        return new Promise((resolve, reject) => {
            Taro.showModal({
                content: settingOption.content,
                title: settingOption.title,
                success: (result) => {
                    if (result.confirm && settingOption.authSetting) {
                        Taro.openSetting({
                            success: (res) => {
                                if (res.authSetting && res.authSetting[settingOption.authSetting!]) {
                                    resolve(res);
                                } else {
                                    reject(res);
                                }
                            },
                            fail: reject
                        });
                    }
                },
                fail: reject
            });
        });
    };
}