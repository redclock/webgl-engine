
var ResultPanel = function()
{
    base(this,LSprite,[]);
    var g = this.graphics;
    g.drawRoundRect(5, "#000", [0, 0, 500, 250, 10], true, "#EED");
    var label = new LTextField();
    label.font = "Arial";
    label.size = 40;
    label.weight = "Bold";

    label.y = 20;
    this.label = label;
    this.addChild(label);
    this.success = false;

    var title;
    var text = "再玩一局！";
    var w = 200;
    var h = 70;
    var upState = new LSprite();
    title = new LTextField();
    title.text = text;
    title.color = "#AA4400";
    title.size = 25;
    title.x = (w - title.getWidth())*0.5;
    title.y = (h - title.getHeight())*0.5;
    upState.graphics.drawRect(1, "#000", [0, 0, w, h], true, "#EEE");
    upState.addChild(title);

    var overState = new LSprite();
    title = new LTextField();
    title.text = text;
    title.color = "#AA4400";
    title.size = 25;
    title.x = (w - title.getWidth())*0.5;
    title.y = (h - title.getHeight())*0.5;
    overState.graphics.drawRect(1, "#000", [0, 0, w, h], true, "#AAA");
    overState.addChild(title);

    var downState = new LSprite();
    title = new LTextField();
    title.text = text;
    title.color = "#FFFFFF";
    title.size = 25;
    title.x = (w - title.getWidth())*0.5;
    title.y = (h - title.getHeight())*0.5;
    downState.graphics.drawRect(1, "#800", [0, 0, w, h], true, "#888");
    downState.addChild(title);
    var button01 = new LButton(upState,overState,downState);
    button01.x = 150;
    button01.y = 120;
    this.addChild(button01);

    var that = this;
    button01.addEventListener(LMouseEvent.MOUSE_DOWN, function(e){
        that.hide();
    });
};

ResultPanel.prototype.show = function()
{
    if (this.success)
    {
        this.label.text = "你抓住了小女孩！";
    }
    else
    {
        this.label.text = "小女孩逃走了！";
    }
    this.label.x = (500 - this.label.getWidth()) / 2;
    this.x = 70;
    this.y = 1000;

    LTweenLite.to(this,0.7,{x:70, y:400, ease:LEasing.Back.easeOut});
    backLayer.addChild(this);
};

ResultPanel.prototype.hide = function()
{
    var that = this;
    LTweenLite.to(this,0.7,{x:70, y:1000, ease:LEasing.Back.easeIn, onComplete:function(e){
        that.remove();
        that.die();

        mapLayer.start();
        gameState = STATE_GAME;
    } });
};

