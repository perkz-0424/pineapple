import Taro from "@tarojs/taro";

class DB {
    public db: Taro.DB.Database;
    public u: Taro.DB.Collection;
    public b: Taro.DB.Collection;
    public c: Taro.DB.Collection;
    public p: Taro.DB.Collection;
    public r: Taro.DB.Collection;
    public v: Taro.DB.Collection;
    public command: Taro.DB.Command;
    private env = 'cloud1-0gsp7cpyfd7f079e';
    
    constructor () {
        Taro.cloud.init({env: this.env, traceUser: true});
        this.db = Taro.cloud.database();
        this.u = this.db.collection('user');
        this.b = this.db.collection('bookkeeping');
        this.p = this.db.collection('plan');
        this.c = this.db.collection('common');
        this.r = this.db.collection('routes');
        this.v = this.db.collection('vPlanDate');
        this.command = this.db.command;
    }
}

const db = new DB();

export default db;