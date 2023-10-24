class Tools {
    public randAChar = () => {
        const n = Math.random() * 10;
        const s = String.fromCharCode(Math.floor(Math.random() * 26) + 'a'.charCodeAt(0));
        if (n > 5) {
            return s;
        } else {
            return (s).toUpperCase();
        }
    };
    
    public randCode = (n = Math.random() * 5) => {
        let s = '';
        for (let i = 0; i < n; i++) {
            s += this.randAChar();
        }
        return (((s +
                Math.ceil(
                    Math.random() * 100) +
                Math.ceil(Math.random() * 100)
            )
            .replace(/0/g, 'h'))
            .replace('9', 'f') +
            this.randAChar()).toUpperCase();
    };
    
    public duplicateRemoval = (array: Array<any>, key?: string) => {
        if (key) {
            const map = new Map();
            for (let item of array) {
                !map.has(item[key]) && map.set(item[key], item);
            }
            return [...map.values()];
        } else {
            const set = new Set();
            array.forEach((item) => set.add(item));
            return [...set];
        }
    };
    
    public removeEmpty = (target: { [key: string]: any }) => {
        const obj: { [key: string]: any } = {};
        Object.keys(target).forEach((k) => {
            if (target[k] || target[k] === 0 ||  target[k] === false || target[k] === '') {
                obj[k] = target[k];
            }
        });
        return obj;
    };
}

const tools = new Tools();
export default tools;