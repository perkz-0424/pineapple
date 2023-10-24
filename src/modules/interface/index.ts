import {
    canIUse,
    chooseImage,
    chooseLocation,
    chooseVideo,
    createAnimation,
    createCanvasContext,
    createMapContext,
    createSelectorQuery,
    createVideoContext,
    downloadFile,
    getImageInfo,
    getClipboardData,
    getLocation,
    getMenuButtonBoundingClientRect,
    getNetworkType,
    getSystemInfoSync,
    makePhoneCall,
    onNetworkStatusChange,
    openDocument,
    openLocation,
    pageScrollTo as scroll,
    previewImage,
    requestPayment,
    saveImageToPhotosAlbum,
    saveVideoToPhotosAlbum,
    scanCode,
    setClipboardData,
    setNavigationBarTitle,
    startPullDownRefresh,
    stopPullDownRefresh,
    uploadFile,
    vibrateShort,
    navigateToMiniProgram,
    openSetting,
    getSetting,
    canvasToTempFilePath,
    previewMedia
} from '@tarojs/taro';

const systemInfo = getSystemInfoSync();

function isIphoneX (): boolean {
    const model = systemInfo.model;
    return Boolean(model.indexOf('iPhone X') > -1 || model.indexOf('iPhone 12') > -1 || model.indexOf('iPhone 13') > -1 || model.indexOf('iPhone 14') > -1);
}

function isIOS (): boolean {
    return Boolean(systemInfo.model.indexOf('iPhone') > -1);
}

export {
    canIUse,
    chooseImage,
    chooseLocation,
    chooseVideo,
    createAnimation,
    createCanvasContext,
    createMapContext,
    createSelectorQuery,
    createVideoContext,
    downloadFile,
    getImageInfo,
    getClipboardData,
    getLocation,
    getMenuButtonBoundingClientRect,
    getNetworkType,
    makePhoneCall,
    onNetworkStatusChange,
    openDocument,
    openLocation,
    previewImage,
    requestPayment,
    saveImageToPhotosAlbum,
    saveVideoToPhotosAlbum,
    scanCode,
    scroll,
    setClipboardData,
    setNavigationBarTitle,
    startPullDownRefresh,
    stopPullDownRefresh,
    systemInfo,
    uploadFile,
    vibrateShort,
    navigateToMiniProgram,
    openSetting,
    getSetting,
    canvasToTempFilePath,
    isIphoneX,
    isIOS,
    previewMedia
};
