export default defineAppConfig({
    pages: [
        'pages/index/index',
        'pages/book/index',
        'pages/mine/index',
        'pages/plan/index',
        'pages/location/index',
        'pages/calendar/index',
        'pages/eventsCalendar/index',
        'pages/events/index',
        'pages/events/addEvents/index',
    ],
    window: {
        backgroundTextStyle: 'dark',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '菠萝旅行笔记本',
        navigationBarTextStyle: 'black',
        navigationStyle: "custom"
    },
    tabBar: {
        custom: true,
        list: [
            {
                pagePath: "pages/index/index",
                text: "首页"
            },
            {
                pagePath: "pages/book/index",
                text: "图书"
            },
            {
                pagePath: "pages/mine/index",
                text: "我的"
            },
        ]
    },
    subPackages: [
    
    ],
    permission: {
        'scope.userFuzzyLocation': {
            desc: '请点击“允许“，方便为您更好的服务'
        },
        'scope.userLocation': {
            desc: '请点击“允许“，方便为您更好的服务'
        }
    },
    lazyCodeLoading: 'requiredComponents',
    requiredPrivateInfos: [
       "chooseLocation", "getFuzzyLocation"
    ]
});
