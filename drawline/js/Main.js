if(LGlobal.canTouch)
{
	LGlobal.stageScale = LStageScaleMode.SHOW_ALL;
	LSystem.screen(LStage.FULL_SCREEN);
}

function doScroll() {

}
window.onload = function() {
    init(50, "legend", 640, 960 ,main,LEvent.INIT);
    LSystem.screen(LStage.FULL_SCREEN);
};
window.onorientationchange = function() {
    LSystem.screen(LStage.FULL_SCREEN);
};
window.onresize = function() {
    LSystem.screen(LStage.FULL_SCREEN);
};


/**层变量*/
//显示进度条所用层
var loadingLayer;
//游戏底层
var backLayer;

//地图层
var mapLayer;

var stepText;
var titleText;
var gameState;
var STATE_TITLE = 0;
var STATE_GAME = 1;
var STATE_RESULT = 2;

/**数组变量*/
var imgData = [
    {name:"player",path:"./images/smile.png"},
    {name:"playerCry",path:"./images/cry.png"}
];
//读取完的图片数组
var imglist = {};
var imageArray;
var startTime;



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


    gameMainScene();
}
function gameMainScene(){
    gameState = STATE_GAME;
    mapLayer = new CellMap();

    mapLayer.createMap(5, 5);
    mapLayer.cells[0][0].setPoint(0);
    mapLayer.cells[3][2].setPoint(0);

    mapLayer.cells[1][2].setPoint(1);
    mapLayer.cells[1][4].setPoint(1);

    mapLayer.cells[1][0].setPoint(2);
    mapLayer.cells[4][0].setPoint(2);

    mapLayer.cells[1][3].setPoint(3);
    mapLayer.cells[4][4].setPoint(3);

    mapLayer.cells[3][1].setPoint(4);
    mapLayer.cells[3][3].setPoint(4);

    mapLayer.start();
	backLayer.addChild(mapLayer);
}

function menuShow(event){
	backLayer.removeAllChild();
	backLayer.die();
	backLayer.addChild(layer);
}