(function (global, undefined) {
    var MAP_X = 30;
    var MAP_Y = 250;
    var MAP_WIDTH = 500;
    var MAP_HEIGHT = 500;
    var stepCount = 0;

    var isInRect = function(x, y, rect)
    {
        return x > rect[0] && y > rect[1] && x < rect[0] + rect[2] && y < rect[1] + rect[3];
    };

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }


    var LineColors = [
        "#F00", "#0F0","#00F",
        "#0FF","#F0F", "#FF0"
    ];

    var AreaColors = [
        "#800", "#080","#008",
        "#088","#808", "#880"
    ];

    var Cell = function(col, row)
    {
        this.col = col;
        this.row = row;
        this.neighbor = [];
        this.prev = null;
        this.next = null;
        this.lineType = -1;
        this.pointType = -1;
        this.setPoint = function(t)
        {
            this.pointType = t;
            this.isPoint = true;
        };
        this.isPoint = false;
    };

    var makeNeighbor = function(cell1, cell2)
    {
        cell1.neighbor.push(cell2);
        cell2.neighbor.push(cell1);
    };

    var getCellCenter = function(map, col, row)
    {
        return [map.cellSize * (col + 0.5), map.cellSize * (row + 0.5)];
    };

    var CellMap = function(){
        base(this,LSprite,[]);
        this.cells = [];
        this.g = this.graphics;
        this.x = MAP_X;
        this.y = MAP_Y;
        this.scaleX = 1;
        var index = 0;

        this.rows = 1;
        this.cols = 1;
        this.cellSize = MAP_HEIGHT / this.rows;
        this.curCell = null;
    };

    CellMap.prototype.createMap = function(rows, cols)
    {
        this.rows = rows;
        this.cols = cols;
        var cellSize = this.cellSize = MAP_HEIGHT / rows;
        var cells = this.cells = [];
        var index = 0;
        this.curCell = null;

        for (var row = 0; row < rows; row++)
        {
            var rowCells = [];
            cells.push(rowCells);
            for (var col = 0; col < cols; col++)
            {
                var cell = new Cell(col, row);
                rowCells.push(cell);
                var pos = getCellCenter(this, col, row);
                cell.x = pos[0];
                cell.y = pos[1];
                cell.rect = [pos[0] - cellSize / 2, pos[1] - cellSize / 2, cellSize, cellSize];
                cell.index = index;

                if (row > 0)
                    makeNeighbor(cells[row - 1][col], cell);
                if (col > 0)
                    makeNeighbor(rowCells[col - 1], cell);
                index++;
            }
        }

    };

    CellMap.prototype.eachCell = function(callback)
    {
        var cells = this.cells;
        for (var row = 0; row < this.rows; row++)
        {
            var rowCells = this.cells[row];
            for (var col = 0; col < this.cols; col++)
            {
                callback(rowCells[col]);
            }
        }
    };


    CellMap.prototype.drawMap = function()
    {
        this.removeAllChild();
        var g = this.g;
        g.clear();
        var cellSize = this.cellSize;
        this.eachCell(function(cell) {
            var backColor = "black";
            var foreColor = "white";

            g.drawRect(1, foreColor, cell.rect, true, backColor);
        });



        this.eachCell(function(cell) {
            var lineType = cell.lineType;
            var color;
            if (cell.isPoint)
            {
                color = LineColors[cell.pointType];
                g.drawArc(0, color, [cell.x, cell.y, cellSize / 2.5, 0, 2 * Math.PI], true, color);
            }

            if (lineType >= 0)
            {
                color = LineColors[lineType];
                var lineSize = cellSize * 0.4;
                if (cell.prev)
                {
                    g.drawArc(0, color, [cell.x, cell.y, lineSize / 2, 0, 2 * Math.PI], true, color);
                    g.drawLine(lineSize, color, [cell.prev.x, cell.prev.y, cell.x, cell.y]);
                }
            }
        });
    };

    CellMap.prototype.start = function()
    {
        var that = this;

        this.addEventListener(LMouseEvent.MOUSE_DOWN, function(event) {
            that.onMouseDown(event.selfX, event.selfY);
        });

        this.addEventListener(LMouseEvent.MOUSE_UP, function(event) {
            that.onMouseUp(event.selfX, event.selfY);
        });

        this.addEventListener(LMouseEvent.MOUSE_MOVE, function(event) {
            that.onMouseMove(event.selfX, event.selfY);
        });

        this.drawMap();
    };

    CellMap.prototype.stop = function()
    {
        this.die();
    };

    CellMap.prototype.onMouseDown = function(x, y)
    {
        var curCell = null;

        this.eachCell(function(cell) {
            if (isInRect(x, y, cell.rect))
            {
                curCell = cell;
            }
        });

        if (curCell)
        {
            var nextCell = curCell.next;
            curCell.next = null;
            while (nextCell)
            {
                var c = nextCell.next;
                nextCell.next = null;
                nextCell.prev = null;
                nextCell.lineType = -1;
                nextCell = c;
            }
            if (curCell.isPoint)
            {
                this.eachCell(function(cell){
                    if (cell.lineType === curCell.pointType)
                    {
                        cell.next = null;
                        cell.prev = null;
                        cell.lineType = -1;
                    }
                });
                curCell.lineType = curCell.pointType;
            }
            if (curCell.lineType >= 0)
            {
                this.curCell = curCell;
            }
        }
        else
        {
            this.curCell = null;
        }

        this.drawMap();
    };

    CellMap.prototype.onMouseUp = function(x, y)
    {
        this.curCell = null;
        this.drawMap();
    };

    CellMap.prototype.onMouseMove = function(x, y)
    {
        if (!this.curCell)
            return;

        var curCell = null;
        var lastCell = this.curCell;
        this.eachCell(function(cell) {
            if (isInRect(x, y, cell.rect))
            {
                curCell = cell;
            }
        });

        if (!curCell || curCell == lastCell || lastCell.neighbor.indexOf(curCell) === -1)
        {
            return;
        }

        if (curCell.isPoint && curCell.pointType !== lastCell.lineType)
        {
            return;
        }

        if (curCell == lastCell.prev)
        {
            lastCell.prev = null;
            curCell.next = null;
            lastCell.lineType = -1;
        }
        else if (curCell.lineType >= 0 || (lastCell.isPoint && lastCell.prev))
        {
            return;
        }
        else
        {
            curCell.prev = lastCell;
            lastCell.next = curCell;
            curCell.lineType = lastCell.lineType;
        }
        this.curCell = curCell;
        this.drawMap();
    };

    global.CellMap = CellMap;

}(window));


