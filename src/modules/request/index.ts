import Taro from "@tarojs/taro";
import {Method} from "@/type";

const HOST = {
    oioweb: 'https://api.oioweb.cn/api/'
};

class Request {
    private request = (option: {
        data: any;
        method: Method;
        url: string
    }) => {
        return Taro.request({
            data: option.data,
            header: {
                'content-type': 'application/json',
            },
            method: option.method,
            url: option.url,
        });
    };
    
    private oiowebApi = (path: string, method: Method, data: any) => {
        return this.request({
            data: data,
            url: HOST.oioweb + path,
            method
        });
    };
    
    private getData = (response) => {
        if (response && response.data && response.data.code === 200 && response.data.result) {
            return response.data.result;
        }
        return undefined;
    }
    
    public geocoder = async (options: {
        lng: number | string;
        lat: number | string;
    }) => {
        const response = await this.oiowebApi(`ip/geocoder?lng=${options.lng}&lat=${options.lat}`, 'GET', {});
        return this.getData(response)
    };
    
    public weather = async (options: {
        city?: string
    }) => {
        const response = await this.oiowebApi(`weather/GetWeather?city=${options.city || ''}`, 'GET', {});
        return this.getData(response)
    }
}

const request = new Request();

export default request;