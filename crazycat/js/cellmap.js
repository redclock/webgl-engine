var playerBitmapData;
var playerCryBitmapData;
var cellSize = 50;
var MAP_ROWS = 9;
var MAP_COLS = 9;

var MAP_X = 60;
var MAP_Y = 250;
var stepCount = 0;

function createCell(x, y)
{
    var cell = {};
    cell.x = x;
    cell.y = y;
    cell.isHit = function(x, y) {
        return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < cellSize * cellSize / 4;
    };
    cell.neighbor = [];
    cell.rect = [x - cellSize / 2, y - cellSize / 2, cellSize, cellSize];

    return cell;
}

var CellMap = function(){
    base(this,LSprite,[]);
    this.cells = [];
    this.g = this.graphics;
    this.x = MAP_X;
    this.y = MAP_Y;
    this.scaleX = 1;
    var index = 0;

    var makeNeighbor = function(cell1, cell2)
    {
        cell1.neighbor.push(cell2);
        cell2.neighbor.push(cell1);
    };
    for (var row = 0; row < MAP_ROWS; row++)
    {
        var isodd = row % 2 == 0;
        var offsetx = isodd ? cellSize / 2 : 0;
        for (var col = 0; col < MAP_COLS; col++)
        {
            var cell = createCell(cellSize / 2 + col * cellSize * 1.1 + offsetx, cellSize / 2 + row * cellSize);
            cell.index = index;
            cell.isBorder = row == 0 || col == 0 || row == MAP_ROWS - 1 || col == MAP_COLS - 1;
            if (row > 0)
            {
                makeNeighbor(cell, this.cells[index - MAP_COLS]);
                if (isodd && col < MAP_COLS - 1)
                {
                    makeNeighbor(cell, this.cells[index - MAP_COLS + 1]);
                }
                if (!isodd && col > 0)
                {
                    makeNeighbor(cell, this.cells[index - MAP_COLS - 1]);
                }

            }
            if (col > 0)
            {
                makeNeighbor(cell, this.cells[index - 1]);
            }
            this.cells.push(cell);
            index++;
        }
    }
};

CellMap.prototype.drawMap = function()
{
    this.removeAllChild();
    this.g.clear();
    for (var i = 0; i < this.cells.length; i++)
    {
        var cell = this.cells[i];
        this.g.drawEllipse(1, "black", cell.rect, true, cell.block ? "red" : "white");
    }
    this.addChild(this.player);
    var isBlocked = this.cells[this.playerIndex].step < 0;
    this.player.bitmapData = isBlocked ? playerCryBitmapData : playerBitmapData;
    stepText.text = "步数：" + stepCount;
};

CellMap.prototype.reset = function()
{
    for (var i = 0; i < this.cells.length; i++)
    {
        var cell = this.cells[i];
        cell.block = Math.random() > 0.85;
        cell.step = 0;
    }
    stepCount = 0;
    var playerIndex = Math.floor(MAP_ROWS / 2) * MAP_COLS +  Math.floor(MAP_COLS / 2);
    this.playerIndex = playerIndex;
    this.moveToCell(this.player, playerIndex);
    this.cells[playerIndex].block = false;
    this.drawMap();
};

CellMap.prototype.shakePlayer = function()
{
    if (this.playerTween)
        LTweenLite.remove(this.playerTween);

    var that = this;
    var player = this.player;
    this.playerTween = LTweenLite.to(player,1,{rotate:10,ease:LEasing.Strong.easeInOut})
        .to(player,1,{rotate:-10, ease:LEasing.Strong.easeInOut, onComplete:function(e){
            that.needShakePlayer = true;
        }});
};

CellMap.prototype.moveToCell = function(sprite, index)
{
    var cx = this.cells[index].x;
    var cy = this.cells[index].y;
    sprite.x = cx - sprite.width / 2 * sprite.scaleX;
    sprite.y = cy - sprite.height / 2 * sprite.scaleY;
};


CellMap.prototype.start = function()
{
    if (this.player)
    {
        this.player.die();
    }
    var player = new LBitmap(playerBitmapData);
    player.scaleX = 0.5;
    player.scaleY = 0.4;
    this.player = player;
    this.reset();
    this.addEventListener(LMouseEvent.MOUSE_DOWN, onmouse);
    var that = this;
    this.addEventListener(LEvent.ENTER_FRAME, function(){
        if (that.needShakePlayer)
        {
            that.shakePlayer();
            that.needShakePlayer = false;
        }
    });
    this.shakePlayer();
};

CellMap.prototype.stop = function()
{
    this.die();
};

CellMap.prototype.visitCells = function()
{
    var listOpen = [];
    var i, cell;
    for (i = 0; i < this.cells.length; i++)
    {
        cell = this.cells[i];
        if (cell.isBorder)
        {
            cell.step = 0;
            if (!cell.block)
                listOpen.push(cell);
        }
        else
        {
            cell.step = -1;
        }
    }

    while (listOpen.length > 0)
    {
        var head = listOpen.shift();
        var step = head.step;
        for (i = 0; i < head.neighbor.length; i++)
        {
            var cellNeighbor = head.neighbor[i]
            if (!cellNeighbor.block && cellNeighbor.step < 0)
            {
                cellNeighbor.step = step + 1;
                listOpen.push(cellNeighbor);
            }
        }
    }
};

CellMap.prototype.findNextCell = function()
{
    var playerCell = this.cells[this.playerIndex];
    var i, cell;
    this.visitCells();
    var minStep = 10000;
    var minCell = null;
    for (i = 0; i < playerCell.neighbor.length; i++)
    {
        var cellNeighbor = playerCell.neighbor[i];
        if (!cellNeighbor.block && minStep > cellNeighbor.step)
        {
            minCell = cellNeighbor;
            minStep = cellNeighbor.step;
        }
    }
    return minCell;
};

CellMap.prototype.isPlayCatched = function()
{
    var playerCell = this.cells[this.playerIndex];
    var i;
    for (i = 0; i < playerCell.neighbor.length; i++)
    {
        var cellNeighbor = playerCell.neighbor[i];
        if (!cellNeighbor.block)
        {
            return false;
        }
    }
    return true;
};

CellMap.prototype.onMouseDown = function(x, y)
{
    var playerCell = this.cells[this.playerIndex];
    for (var i = 0; i < this.cells.length; i++)
    {
        var cell = this.cells[i];
        if (!cell.block && cell.isHit(x, y))
        {
            cell.block = true;
            var cellNeighbor = this.findNextCell();
            if (cellNeighbor)
            {
                this.playerIndex = cellNeighbor.index;
                this.moveToCell(this.player, this.playerIndex);
            }
            stepCount++;
            this.drawMap();
            var resultLayer;
            if (this.cells[this.playerIndex].isBorder)
            {
                gameState = STATE_RESULT;
                resultLayer = new ResultPanel();
                resultLayer.success = false;
                resultLayer.show();
            }
            else if (this.isPlayCatched())
            {
                gameState = STATE_RESULT;
                resultLayer = new ResultPanel();
                resultLayer.success = true;
                resultLayer.show();
            }
            return;
        }
    }
};