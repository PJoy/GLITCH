/**
 * Created by pierreportejoie on 01/06/16.
 */


function log(text, lvl){
    switch(lvl) {
        case 0:
            console.log('%c '+text+' ', 'background: #222; color: #bada55');
            break;
        case 1:
            console.log('%c '+text+' ', 'background: #222; color: white');
            break;
        case 2:
            console.log('%c '+text+' ', 'background: #222; color: red');
            break;
        default:
            console.log(text)
    }
}

function setupCanvas(img){
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    //document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canvas
}

function setupCanvas2(img,x,y,w,h){
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    //document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
    return canvas
}


function setupTiles(){
    var tiles = [];
    jQuery('img:not(:first)').each(function(){
        tiles.push(setupCanvas(this));
    });
    return tiles;
}

function partCanvas(img,x,y){
    var canvas = document.createElement('canvas');
    canvas.width = x2;
    canvas.height = y2;
    //document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(img,x*x2,y*y2,x2,y2,0,0,x2,y2);
    return canvas
}

function drawPart(img,x,y) {
    var canvas = document.createElement('canvas');
    canvas.width = x2/2;
    canvas.height = y2/2;
    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(img,0,0,x2/2,y2/2);
}

function getMin(objs){
    var res = {};
    for (var obj in objs){
        var total = 0;
        for (var val in objs[obj]){
            total += objs[obj][val];
        }
        res[obj]=total
    }
    var final = 0;
    for (var tot in res){
        if (res[tot] < res[final]) final=tot
    }
    return final;
}

function compare(canvas1, x, y, canvas2){
    var res;
    var totalR = 0, totalG = 0, totalB = 0;
    for (var i = x; i < x+canvas2.width; i++){
        for (var j = y; j < y+canvas2.height; j++){
            res = subtractPix(canvas1.getContext('2d').getImageData(i,j, 1, 1).data,canvas2.getContext('2d').getImageData(i-x,j-y, 1, 1).data);
        }
    }
    return {"R": totalR,"G": totalG,"B": totalB}
}

function subtractPix(a,b){
    return [Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]), Math.abs(a[2]-b[2])];
}

function compareCanvases(c1,c2,x){
    var ctx1 = c1.getContext('2d');
    var ctx2 = c2.getContext('2d');
    var diffRed = 0, diffGreen = 0, diffBlue = 0;
//var i=0;
    for (var i = 0; i < c2.width; i+=5){
        for (var j = 0; j < c2.height; j+=5){
            var data1 = ctx1.getImageData(i,j,1,1).data;
            var data2 = ctx2.getImageData(i,j,1,1).data;
            //todo insert cache here
            diffRed += data1[0]-data2[0];
            diffGreen += data1[1]-data2[1];
            diffBlue += data1[2]-data2[2];
        }
    }

    switch (x){
        case 'R':
            return [diffRed, 0, 0];
        case 'G':
            return [0, diffGreen, 0];
        case 'B':
            return [0, 0, diffBlue];
        default :
            return [diffRed, diffGreen, diffBlue]

    }
}

function getClosest(array){
    var result;
    var resultIndex;
    var i = 0;
    array.forEach(function(e){
        var value = Math.abs(e[0])+Math.abs(e[1])+Math.abs(e[2]);
        if (i == 0 | value < result) {
            result = value;
            resultIndex = i;
        }
        i++;
    });
    return resultIndex;
}

function breakl(){
    var linebreak = document.createElement("br");
    document.body.appendChild(linebreak);
}

function drawTile(tile,ratio){
    var canvas = document.createElement('canvas');
    canvas.width = tile.width*ratio;
    canvas.height = tile.height*ratio;
    canvas.getContext('2d').drawImage(tile,0,0,tile.width*ratio,tile.height*ratio);
    document.body.appendChild(canvas);
}

function cacheImageData(){

}

$(window).load(function(){
    var img = document.getElementById('main-img');
    var tiles = setupTiles();
    //var canvas = setupCanvas(img);

    ['R','G','B',''].forEach(function(x){
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        document.body.appendChild(canvas);

        for (var i = 0; i<img.height; i+=5){
            for (var j = 0; j<img.width; j+=5) {
                var subCanvas = setupCanvas2(img,j,i,5,5);
                var comparisons = [];
                tiles.forEach(function(tile){
                    comparisons.push(compareCanvases(subCanvas,tile,x))
                });
                canvas.getContext('2d').drawImage(tiles[getClosest(comparisons)],j,i,5,5)
            }
        }
        //breakl();
    });
});
