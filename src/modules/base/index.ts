import assets from '@/modules/assets';
import navigator from '@/modules/navigator';
import * as ROUTES from '@/modules/navigator/routes';
import dayjs from "dayjs";
import qs from 'qs';
import cx from 'classnames';
import * as _interface from '@/modules/interface';
import global from "@/modules/redux/common/action";
import common from "@/modules/common";
import db from "@/modules/db";
import tools from "@/modules/tools";
import request from "@/modules/request";
import location from "@/modules/location";

const base = {
    routers: ROUTES,
    navigator: navigator,
    interface: _interface,
    qs: qs,
    cx: cx,
    assets: assets,
    moment: dayjs,
    system: _interface.systemInfo,
    is: {
        isIOS: _interface.isIOS,
        isIphoneX: _interface.isIphoneX
    },
    global,
    common,
    db,
    tools,
    request,
    location
};
export default base;
