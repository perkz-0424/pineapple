// 新的存放全局数据

interface State {
    location: {
        address?: string;
        latitude?: number;
        longitude?: number;
        province?: string;
        city?: string;
    };
    userinfo?: {
        name: string;
        avatar: string;
    };
    weather?: {
        condition: string;
        conditionId: string;
        humidity: string;
        realFeel: string;
        temp: string;
        tips: string;
        windDegrees: string;
        windDir: string;
        windLevel: string;
        windSpeed: string;
    };
    cities: any[];
    allCities: any[];
    ttf: boolean;
    tempEvent: any;
    changeVid?: number;
}

const commonStore = {
    namespace: 'common',
    state: {
        location: {
            address: ''
        },
        userinfo: undefined,
        weather: undefined,
        cities: [],
        allCities: [],
        ttf: false,
        tempEvent: undefined
    } as State,
};

export default commonStore;

