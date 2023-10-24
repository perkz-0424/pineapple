import Taro from "@tarojs/taro";
import db from "@/modules/db/db";
import global from "@/modules/redux/common/action";
function getCities () {
    db.c.where({name: 'city'}).orderBy("_id", "asc").limit(1).get().then((e) => {
        if (e.data && e.data[0] && e.data[0].cities) {
            const list = e.data[0].cities;
            global.set({
                cities: list,
                allCities: list.reduce((pre, i) => {
                    return [...pre, ...i.items]
                }, [])
            });
        }
    });
}

function updateFile (filePath: string) {
    return new Promise<string>((resolve) => {
        if (filePath) {
            const stringArray = filePath.split("/");
            const fileName = stringArray[stringArray.length - 1].replace(/\s|[/]/g, '');
            Taro.cloud.uploadFile({
                filePath: filePath,
                cloudPath: fileName,
                success: (e) => {
                    resolve(e.fileID || '');
                },
                fail: () => {
                    resolve('');
                }
            });
        } else {
            resolve('');
        }
    });
}

const common = {
    updateFile,
    getCities,
};
export default common;