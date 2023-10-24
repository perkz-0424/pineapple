import React from "react";
import {Canvas, CanvasProps} from '@tarojs/components';
import Taro, {CanvasContext, getImageInfo} from "@tarojs/taro";
import styles from './index.module.scss';
import cx from "classnames";
import base from "@/modules/base";
import {Property} from "csstype";

interface Props extends CanvasProps {
    canvasId: string;
}

class ShowImage extends React.PureComponent<Props> {
    private ctx: CanvasContext;
    private imgW = 400;
    private imgH = 300;
    
    constructor (props) {
        super(props);
    }
    
    componentDidMount () {
        this.ctx = Taro.createCanvasContext(this.props.canvasId);
    }
    
    public drawBg = (borderColor?: Property.Color, backgroundColor?: Property.Color) => {
        this.roundRect({x: 0, y: 0, w: 400, h: 250, radius: 10, fillColor: borderColor || "#FFF", borderWidth: 0.0001});
        this.roundRect({
            x: 5,
            y: 5,
            w: 390,
            h: 240,
            radius: 10,
            fillColor: backgroundColor || "#FFF",
            borderWidth: 1,
            storkColor: backgroundColor || '#f6a543'
        });
        this.ctx.beginPath();
        this.ctx.setLineWidth(1);
        this.ctx.setFillStyle(borderColor || "#FFF");
        this.ctx.moveTo(180, 250);
        this.ctx.lineTo(200, 300);
        this.ctx.lineTo(220, 250);
        this.ctx.lineTo(180, 250);
        this.ctx.setStrokeStyle(borderColor || "#FFF");
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
        this.ctx.beginPath();
        this.ctx.setLineWidth(1);
        this.ctx.setFillStyle(backgroundColor || "#FFF");
        this.ctx.moveTo(185, 245);
        this.ctx.lineTo(200, 295);
        this.ctx.lineTo(215, 245);
        this.ctx.lineTo(185, 245);
        this.ctx.setStrokeStyle(backgroundColor || "#FFF");
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    };
    
    public drawRecommend = (e) => {
        return new Promise(async (resolve) => {
            this.ctx.clearRect(0, 0, this.imgW, this.imgH);
            this.drawBg("#555453", "#FFF");
            this.ctx.setFontSize(55);
            this.ctx.fillStyle = "#970707";
            this.ctx.font = 'normal 500 55px sans-serif';
            const type = (e.category || '').split(":")[1] || '';
            const category = type ? `[${type}]` : ''
            this.ctx.fillText('推荐：', 25, 75);
            this.drawName(`     ${category}${e.title}`);
            this.ctx.draw(true, () => {
                Taro.canvasToTempFilePath({
                    canvasId: this.props.canvasId,
                    fileType: 'png',
                    success: (res) => resolve({
                        ...e,
                        url: res.tempFilePath,
                    }),
                    fail: () => resolve(e)
                });
            });
        })
    }
    
    public draw = (e?: {}, x?: boolean) => {
        return new Promise<any>(async (resolve) => {
            this.ctx.clearRect(0, 0, this.imgW, this.imgH);
            this.ctx.draw(false, () => {
                if (e) {
                    switch (e['type']) {
                        case "point":
                            this.drawPoint(e, x).then(resolve);
                            return;
                        case "food":
                            this.drawFood(e, x).then(resolve);
                            return;
                        case "place":
                            this.drawPlace(e, x).then(resolve);
                            return;
                        default:
                            resolve("");
                    }
                } else {
                    this.drawDefault().then(resolve);
                }
            });
        });
    };
    
    private drawLocation = async () => {
        const tagImage = await getImageInfo({src: base.assets.lg});
        this.ctx.drawImage(base.assets.lg, 0, 0, tagImage.width, tagImage.height, 15, 175, 50, 50);
        this.ctx.setFontSize(50);
        this.ctx.fillStyle = "#1e933d";
        this.ctx.font = 'normal 400 50px sans-serif';
        this.ctx.fillText('导航去这里', 75, 220);
        this.ctx.beginPath();
        this.ctx.setLineWidth(2);
        this.ctx.moveTo(20, 230);
        this.ctx.lineTo(375, 230);
        this.ctx.setStrokeStyle("#1e933d");
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
        
        this.ctx.beginPath();
        this.ctx.setLineWidth(3);
        this.ctx.moveTo(330, 180);
        this.ctx.lineTo(350, 200);
        this.ctx.lineTo(330, 220);
        this.ctx.setStrokeStyle("#1e933d");
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
        
        this.ctx.beginPath();
        this.ctx.setLineWidth(3);
        this.ctx.moveTo(350, 180);
        this.ctx.lineTo(370, 200);
        this.ctx.lineTo(350, 220);
        this.ctx.setStrokeStyle("#1e933d");
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    };
    
    private getTextList = (text, max = 300) => {
        let tg: string[] = [];
        let wi = 0;
        for (const t of text) {
            const w = this.ctx.measureText(t).width;
            const m = tg.length > 1 ? max + 60 : max;
            if (wi + w > m) {
                wi = w;
                tg.push(t);
            } else {
                wi = wi + w;
                if (tg.length) {
                    tg[tg.length - 1] = tg[tg.length - 1] + t;
                } else {
                    tg.push(t);
                }
            }
        }
        return tg;
    };
    
    private drawTime = async (openTime, closeTime) => {
        const time = (openTime || "09:30") + '至' + (closeTime || "17:30");
        const tagImage = await getImageInfo({src: base.assets.clock});
        this.ctx.drawImage(base.assets.clock, 0, 0, tagImage.width, tagImage.height, 14, 100, 50, 50);
        this.ctx.setFontSize(47);
        this.ctx.fillStyle = "#181818";
        this.ctx.font = 'normal 400 47px sans-serif';
        this.ctx.fillText(time, 75, 142);
    };
    
    private drawTicket = async (reservation, admissionTicket, haveTime) => {
        const text = [reservation ? '预约' : '', admissionTicket ? '门票' : ''].filter(Boolean).join("和");
        const tagImage = await getImageInfo({src: base.assets.bill});
        this.ctx.drawImage(base.assets.bill, 0, 0, tagImage.width, tagImage.height, 15, haveTime ? 175 : 105, 50, 50);
        this.ctx.setFontSize(55);
        this.ctx.fillStyle = "#181818";
        this.ctx.font = 'normal 400 55px sans-serif';
        this.ctx.fillText(text, 75, haveTime ? 220 : 150);
    };
    
    private drawNameLine = (text, y, color) => {
        this.ctx.setFontSize(60);
        this.ctx.fillStyle = color;
        this.ctx.font = 'normal 500 60px sans-serif';
        this.ctx.fillText(text, 20, y);
    };
    
    private drawPoint = (e, x?: boolean) => {
        return new Promise(async (resolve) => {
            this.drawBg(base.common.colors[e.color || 0], "#FFF");
            const tagImage = await getImageInfo({src: base.assets.tag});
            this.ctx.drawImage(base.assets.tag, 0, 0, tagImage.width, tagImage.height, 15, 29, 50, 50);
            this.ctx.setFontSize(60);
            this.ctx.fillStyle = base.common.colors[e.color || 0];
            this.ctx.font = 'normal 500 60px sans-serif';
            const name = `${e.scenicSpotsName || "目的地"}`;
            const nameList = this.getTextList(name);
            if (nameList[0]) {
                this.ctx.fillText(nameList[0], 75, 75);
            }
            const openTime = (e.openTime || []).join(":");
            const closeTime = (e.closeTime || []).join(":");
            const reservation = e.reservation;
            const admissionTicket = e.admissionTicket;
            const haveTime = openTime || closeTime;
            const haveTicket = reservation || admissionTicket;
            if (x) {
                if (nameList[1]) {
                    this.drawNameLine(nameList[1], 148, base.common.colors[e.color || 0]);
                }
                await this.drawLocation();
            } else {
                if (haveTime) {
                    await this.drawTime(openTime, closeTime);
                }
                if (haveTicket) {
                    await this.drawTicket(reservation, admissionTicket, haveTime);
                }
                if (!haveTime && !haveTicket) {
                    if (nameList[1]) {
                        this.drawNameLine(nameList[1], 148, base.common.colors[e.color || 0]);
                    }
                    if (nameList[2]) {
                        this.drawNameLine(nameList[2], 220, base.common.colors[e.color || 0]);
                    }
                }
            }
            const key = x ? e.ct + 'X' : e.ct;
            this.ctx.draw(true, () => {
                Taro.canvasToTempFilePath({
                    canvasId: this.props.canvasId,
                    fileType: 'png',
                    success: (res) => resolve({
                        [key]: res.tempFilePath
                    }),
                    fail: () => resolve('')
                });
            });
        });
    };
    
    private drawName = (name) => {
        this.ctx.setFontSize(60);
        this.ctx.fillStyle = "#181818";
        this.ctx.font = 'normal 500 60px sans-serif';
        const nameList = this.getTextList(name);
        if (nameList[0]) {
            this.ctx.fillText(nameList[0], 85, 75);
        }
        if (nameList[1]) {
            this.ctx.fillText(nameList[1], 25, 148);
        }
        if (nameList[2]) {
            this.ctx.fillText(nameList[2], 25, 220);
        }
    };
    
    private drawFood = (e, x?: boolean) => {
        return new Promise(async (resolve) => {
            this.drawBg("#f6a543", "#FFF");
            const tagImage = await getImageInfo({src: base.assets.food});
            this.ctx.drawImage(base.assets.food, 0, 0, tagImage.width, tagImage.height, 15, 23, 60, 60);
            const name = (e.name || '神秘美食');
            this.drawName(name);
            if (x) {
                await this.drawLocation();
            }
            const key = x ? e.ct + 'X' : e.ct;
            this.ctx.draw(true, () => {
                Taro.canvasToTempFilePath({
                    canvasId: this.props.canvasId,
                    fileType: 'png',
                    success: (res) => resolve({
                        [key]: res.tempFilePath
                    }),
                    fail: () => resolve('')
                });
            });
        });
    };
    
    private drawPlace = (e, x?: boolean) => {
        return new Promise(async (resolve) => {
            this.drawBg("#f6a543", "#FFF");
            const tagImage = await getImageInfo({src: base.assets.footer});
            const name = (e.name || '向往美景');
            this.drawName(name);
            this.ctx.drawImage(base.assets.footer, 0, 0, tagImage.width, tagImage.height, 15, 23, 60, 60);
            if (x) {
                await this.drawLocation();
            }
            const key = x ? e.ct + 'X' : e.ct;
            this.ctx.draw(true, () => {
                Taro.canvasToTempFilePath({
                    canvasId: this.props.canvasId,
                    fileType: 'png',
                    success: (res) => resolve({
                        [key]: res.tempFilePath
                    }),
                    fail: () => resolve('')
                });
            });
        });
    };
    
    private drawDefault = () => {
        return new Promise(async (resolve) => {
            this.drawBg("#0b490b", "#ffffff");
            this.ctx.setFontSize(60);
            this.ctx.fillStyle = "#575757";
            this.ctx.font = '600 600 60px sans-serif';
            this.ctx.fillText('添加此处定位', 20, 80);
            this.ctx.beginPath();
            this.ctx.setLineWidth(4);
            this.ctx.moveTo(20, 100);
            this.ctx.lineTo(375, 100);
            this.ctx.setStrokeStyle("#FFF");
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.restore();
            
            this.ctx.setFontSize(60);
            this.ctx.fillStyle = "#575757";
            this.ctx.font = '600 600 60px sans-serif';
            this.ctx.fillText('方便规划', 20, 165);
            
            this.ctx.beginPath();
            this.ctx.setLineWidth(4);
            this.ctx.moveTo(20, 183);
            this.ctx.lineTo(375, 183);
            this.ctx.setStrokeStyle("#FFF");
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.restore();
            
            this.ctx.beginPath();
            this.ctx.setLineWidth(5);
            this.ctx.moveTo(320, 117);
            this.ctx.lineTo(340, 141);
            this.ctx.lineTo(320, 165);
            this.ctx.setStrokeStyle("#0b490b");
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.restore();
            
            this.ctx.beginPath();
            this.ctx.setLineWidth(5);
            this.ctx.moveTo(350, 117);
            this.ctx.lineTo(370, 141);
            this.ctx.lineTo(350, 165);
            this.ctx.setStrokeStyle("#0b490b");
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.restore();
            this.ctx.draw(true, () => {
                Taro.canvasToTempFilePath({
                    canvasId: this.props.canvasId,
                    fileType: 'png',
                    success: (res) => resolve(res.tempFilePath),
                    fail: () => resolve('')
                });
            });
        });
    };
    
    render () {
        const {className, style, ...restProps} = this.props;
        return <Canvas
            {...restProps}
            className={cx(styles.container, className)}
            style={{width: `${this.imgW}px`, height: `${this.imgH}px`}}
        />;
    }
    
    private roundRect = (options: {
        // 圆角矩形选区的左上角 x坐标
        x: number;
        // 圆角矩形选区的左上角 y坐标
        y: number;
        // 圆角矩形选区的宽度
        w: number;
        // 圆角矩形选区的高度
        h: number;
        // 圆角的半径
        radius: number;
        // 边框宽度
        borderWidth?: number;
        // 填充颜色
        fillColor?: Property.Color;
        // 边框颜色
        storkColor?: Property.Color;
        // 四个角的圆角是否有
        radiusOption?: {
            tl?: boolean;
            tr?: boolean;
            br?: boolean;
            bl?: boolean;
        }
    }) => {
        const {y, fillColor, h, radius, radiusOption, storkColor, w, x, borderWidth} = options;
        this.ctx.save();
        let r = radius;
        let rOption = {tl: true, tr: true, br: true, bl: true, ...(radiusOption || {})};
        if (w < 2 * r) {
            r = w / 2;
        }
        if (h < 2 * r) {
            r = h / 2;
        }
        this.ctx.beginPath();
        this.ctx.setFillStyle(fillColor || '#FFFFFF');
        if (storkColor) {
            this.ctx.setStrokeStyle(storkColor);
        }
        this.ctx.setLineWidth(borderWidth || 1);
        // 左上弧线
        if (rOption.tl) {
            this.ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
            // 上直线
            this.ctx.moveTo(x + r, y);
            this.ctx.lineTo(x + w - r, y);
        } else {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + w - r, y);
        }
        if (rOption.tr) {
            // 右上弧线
            this.ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 2 * Math.PI);
            // 右直线
            this.ctx.lineTo(x + w, y + r);
            this.ctx.lineTo(x + w, y + h - r);
        } else {
            this.ctx.lineTo(x + w, y);
            this.ctx.lineTo(x + w, y + h);
        }
        if (rOption.br) {
            // 右下弧线
            this.ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
            // 下直线
            this.ctx.lineTo(x + w - r, y + h);
            this.ctx.lineTo(x + r, y + h);
        } else {
            this.ctx.lineTo(x + w, y + h);
            this.ctx.lineTo(x, y + h);
        }
        if (rOption.bl) {
            // 左下弧线
            this.ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, Math.PI);
            // 左直线
            this.ctx.lineTo(x, y + h - r);
            this.ctx.lineTo(x, y + r);
        } else {
            this.ctx.lineTo(x, y + h);
            this.ctx.lineTo(x, y + r);
        }
        this.ctx.fill();
        if (storkColor) {
            this.ctx.stroke();
        }
        this.ctx.closePath();
        this.ctx.restore();
    };
}

export default ShowImage;
