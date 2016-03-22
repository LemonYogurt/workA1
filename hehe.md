### ADX系统UI
---------------------

运行 `node index.js`

---------------------

### global 全局参数

```
DB:global.main

{
	bidPCT: 0~1， //出价加价百分比
	secondPCT: 0~1， //第二高价加价百分比
	sspPCT: 0~1 //ssp报价百分比
}

```

### 账户权限
```
admin:1
business:2 //运营
user:5
```

### 推广位类型
---------
```
pc
101:固定
102:双边对联
103:悬停
104:单边对联
105:浮窗
106:折叠
107:视频浮层
108:视频贴片
109:视频暂停
移动
201:固定(移动网页)
202:浮窗(移动网页)
app
301:无线视频贴片
302:无线视频暂停
```

----------------
1、初始化数据字典(尺寸、推广位类型、网站类型、推广位屏数)

```
cd script/dictionary
run index.js
```

2、运行  `node index.js`

#### 数据结构
dspSetting
```
	dspId	: "",
	sizes 	: [],
	types	: [],
	screens	: [],
	urls	: [],
	sitetypes:[],
	areas	: []
```
#### 监控统计数据
monitorStats
````
	dspId 	: "",
	slotId	: "",
	mediaId	: "",
	sspId	: "",
	timeout	: 0, //超时
	unzeroPv: 0, //有效报价pv，响应成功且报价>0 的pv
	pv		: 0,
	click	: 0,
	sendPv	: 0, //可发送pv
	bidOkPv	: 0, //竞价成功pv
	netExceptionPv : 0, //网络异常pv
	date	: date
````
#### 统计数据
reportStats
```
	dspId 	: "",
	slotId	: "",
	mediaId	: "",
	sspId	: "",
	pv		: 0,
	click	: 0,
	url		: "", //网站
	size	: "100*100" //尺寸
	date	: date
```

1：阻止掉状态的点击事件以及隐藏修改按钮
2：让商务与用户之间可以切换成功

adxUI