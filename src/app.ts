import React, {PropsWithChildren} from 'react';
import Taro from '@tarojs/taro';
import './app.scss';
import createStoreChildren from "@/modules/redux";
import location from "@/modules/location";
import request from "@/modules/request";
import global from "@/modules/redux/common/action";
import base from "@/modules/base";


function App ({children}: PropsWithChildren) {
    const router = React.useRef(Taro.useRouter()).current;
    Taro.useLaunch(async () => {
        wx.loadFontFace({
            global: true,
            family: 'AL',
            source: 'url("https://636c-cloud1-0gsp7cpyfd7f079e-1321264584.tcb.qcloud.la/TsangerYuYangT_W03_W03.ttf")',
            success: () => {
                global.set({ttf: true});
            },
            fail: () => {
                global.set({ttf: true});
            }
        });
        base.db.user.login(decodeURIComponent(router.params.mid || '')).then(() => {
            base.db.common.getCities();
            location.authorize().then(async (e) => {
                if (e) {
                    const a = await location.autoLocation();
                    const {body, status} = await location.convertLocation(a);
                    if (status === 1) {
                        location.setLocation({
                            address: body.city || body.province || '',
                            latitude: body.lat,
                            longitude: body.lng,
                            city: body.city,
                            province: body.province,
                        });
                        request.weather({city: body.city || ''}).then((e) => {
                            if (e && e.condition) {
                                global.set({weather: e.condition});
                            }
                        });
                    }
                }
            });
        });
        const update = Taro.getUpdateManager();
        update.onUpdateReady(update.applyUpdate);
    });
    
    // children 是将要会渲染的页面
    return createStoreChildren(children);
}

export default App;
