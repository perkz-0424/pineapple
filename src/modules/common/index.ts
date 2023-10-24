import * as _interface from "@/modules/interface";
import calendar from "@/modules/calendar";
import dayjs from "dayjs";

class Common {
    // 获取顶部高度
    private navBarH = 0;
    
    private preTodayCalendar: any[] = [];
    
    public hotCities = ["北京市", '广州市', '营口市', '杭州市', '南京市', '厦门市', '长沙市', '重庆市', '沈阳市'];
    
    public weeks = {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六'
    };
    
    public get todayCalendar () {
        if (this.preTodayCalendar.length) {
            return this.preTodayCalendar;
        }
        const target = dayjs().format("YYYY-MM-DD");
        const targetMonth = dayjs(target).startOf("month");
        const lastMonth = targetMonth.add(3, "month");
        this.preTodayCalendar = calendar.getDateList(targetMonth, lastMonth);
        return this.preTodayCalendar;
    }
    
    
    public num = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '七',
        8: '八',
        9: '九',
        10: '十',
        11: '十一',
        12: '十二'
    };
    
    public isToday(day: dayjs.Dayjs){
        return day.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
    }
    
    public getEmpty = () => {
        return undefined;
    };
    
    
    public pickerRangeH = [
        '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
    ] as const;
    
    public pickerRangeM = [
        '00', '10', '20', '30', '40', '50'
    ] as const;
    
    public defaultLocation = {
        latitude: 39.925374,
        longitude: 116.39535
    };
    
    public colors = {
        0: '#d81e06',
        1: '#f68a08',
        2: '#1296db',
        3: '#d4237a'
    };
    
    constructor () {
        this.navBarHeight;
    }
    
    public compareVersion (v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        const len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);
            
            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    }
    
    // 获取顶部高度
    public get navBarHeight () {
        if (this.navBarH > 0) {
            return this.navBarH;
        } else {
            this.navBarH = (_interface.systemInfo.statusBarHeight || 0) + this.navigatorHeight;
            return (_interface.systemInfo.statusBarHeight || 0) + this.navigatorHeight;
        }
    }
    
    // 获取顶部高度
    public get navigatorHeight () {
        const version = _interface.systemInfo.SDKVersion;
        if (this.compareVersion(version, '2.1.0') >= 0) {
            const menuRect = _interface.getMenuButtonBoundingClientRect();
            const padding = menuRect.top - (_interface.systemInfo.statusBarHeight || 0);
            return padding > 50 ? 40 : padding * 2 + menuRect.height;
            //键盘唤起时，menuRect.top可能获取到383。padding正常差不多是16，超过50肯定不正常
        } else {
            // 当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。
            return 40;
        }
    }
    
    public getMark = (vPlan, key?: string) => {
        const markerList: any[] = [];
        vPlan.forEach((v) => {
            const routes = v[key || 'routes'] || [];
            routes.forEach((i) => {
                if (i && i.lat) {
                    markerList.push({...i, type: 'point'});
                }
                if (i && i.foods) {
                    i.foods.forEach((f) => f.lat && markerList.push({...f, type: 'food', vid: i.vid, rid: i.rid}));
                }
                if (i && i.places) {
                    i.places.forEach((p) => p.lat && markerList.push({...p, type: 'place', vid: i.vid, rid: i.rid}));
                }
            });
        });
        return markerList;
    };
}

const common = new Common();

export default common;