import workday from "chinese-workday";
import dayjs from "dayjs";
import lunar from "lunar-calendar";

class Calendar {
    
    private ghd = {
        "01-01": "元旦",
        "05-01": "劳动节",
        "10-01": "国庆节"
    };
    
    private lhd = {
        "11": "春节",
        "55": "端午",
        "815": "中秋"
    };
    
    constructor () {
    
    }
    
    private getHD = (l, d) => {
        if (this.ghd[d]) {
            return this.ghd[d];
        }
        
        if (l && this.lhd[`${l.lunarMonth}${l.lunarDay}`]) {
            return this.lhd[`${l.lunarMonth}${l.lunarDay}`];
        }
        return "";
    };
    
    public getDay = (day: dayjs.Dayjs) => {
        const format = day.format("YYYY-MM-DD");
        const iw = workday['isWorkday'](format);
        const ih = workday['isHoliday'](format);
        const l = lunar.solarToLunar(...format.split("-"));
        return {
            iw,
            ih,
            lDay: this.getHD(l, day.format("MM-DD")) || l.term || (l.lunarDayName),
            y: day.get("year"),
            m: day.get("month") + 1,
            d: day.get("date"),
            w: day.get("day"),
            day: format
        };
    };
    
    
    public getDateList = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
        const obj = {};
        const x = (end.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24);
        for (let i = 0; i < x; i++) {
            const day = start.add(i, "day");
            const o = this.getDay(day);
            if (obj[o.m]) {
                obj[o.m].push(o);
            } else {
                obj[o.m] = [o];
            }
        }
        return Object.keys(obj).reduce((pre, i) => {
            const ds = obj[i];
            const n = ds[0];
            const year = n ? n.y : dayjs().get("year");
            for (let i = 0; i < n.w; i++) {
                ds.unshift(undefined);
            }
            return [...pre, {
                month: Number(i),
                year,
                days: ds,
                id: Number(dayjs(`${year}-${i}-1`).format("YYYYMM"))
            }];
        }, []).sort((a, b) => a.id - b.id);
    };
}

const calendar = new Calendar();
export default calendar;