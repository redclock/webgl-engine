/**
 * Main类
 * @author lufy
 * @blog http://blog.csdn.net/lufy_Legend
 * @email lufy.legend@gmail.com
 **/
//if(LGlobal.canTouch)
{
	LGlobal.stageScale = LStageScaleMode.SHOW_ALL;
	LSystem.screen(LStage.FULL_SCREEN);
}

function doScroll() {
	if(window.pageYOffset === 0) {
		window.scrollTo(0, 1);
	}
}
window.onload = function() {
	setTimeout(doScroll, 100);
	init(50, "legend", 640,960,main,LEvent.INIT);
};
window.onorientationchange = function() {
	setTimeout(doScroll, 100);
};
window.onresize = function() {
	setTimeout(doScroll, 100);
};


/**层变量*/
//显示进度条所用层
var loadingLayer;
//游戏底层
var backLayer;

//地图层
var mapLayer;
var resultLayer;
var stepText;
var titleText;
var gameState;
var STATE_TITLE = 0;
var STATE_GAME = 1;
var STATE_RESULT = 2;

/**数组变量*/
var imgData = [
    {path:"./js/cellmap.js",type:"js"},
    {path:"./js/resultPanel.js",type:"js"},
    {name:"player",path:"./images/lan.png"},
    {name:"playerCry",path:"./images/lan2.png"}
];
//读取完的图片数组
var imglist = {};
var bitmapDataList = [];
var imageArray;
var labelText,nameText,btn_update,rankingLayer;
var stageIndex = 0;
var startTime,stages = 0,steps = 0,times = 0;
var btnReplayStage,btnReturn;



function main(){
	LMouseEventContainer.set(LMouseEvent.MOUSE_DOWN,true);
	LMouseEventContainer.set(LMouseEvent.MOUSE_UP,true);
	LMouseEventContainer.set(LMouseEvent.MOUSE_MOVE,true);
	
	loadingLayer = new LoadingSample5();
	addChild(loadingLayer);	
	LLoadManage.load(
		imgData,
		function(progress){
			loadingLayer.setProgress(progress);
		},
		gameInit
	);
}
function gameInit(result){
	LGlobal.setDebug(true);
	imglist = result;
	removeChild(loadingLayer);
	loadingLayer = null;

	//游戏底层添加
	backLayer = new LSprite();
	backLayer.graphics.drawRect(1,"#000",[0,0, LGlobal.width,LGlobal.height], true, "#DDD");
	addChild(backLayer);

    stepText = new LTextField();
    stepText.text = "步数：0";
    stepText.x = 100;
    stepText.y = 170;
    stepText.size = 30;
    stepText.weight = "Normal";
    stepText.font = "Arial";
    backLayer.addChild(stepText);

    titleText = new LTextField();
    titleText.text = "抓住小女孩 ⊙﹏⊙";
    titleText.x = 100;
    titleText.y = 20;
    titleText.size = 40;
    titleText.weight = "Bold";
    titleText.font = "Arial";
    backLayer.addChild(titleText);

    playerBitmapData = new LBitmapData(imglist["player"]);
    playerCryBitmapData = new LBitmapData(imglist["playerCry"]);

    gameMainScene();
}
function gameMainScene(){
    gameState = STATE_GAME;
    mapLayer = new CellMap();
    mapLayer.start();
	backLayer.addChild(mapLayer);
}

function menuShow(event){
	backLayer.removeAllChild();
	backLayer.die();
	backLayer.addChild(layer);
}
function onframe(){
	player.onframe();
	var str = (new Date().getTime() - startTime) + "";
}

function onmouse(event){
    if (gameState == STATE_GAME)
        mapLayer.onMouseDown(event.selfX, event.selfY);
}

