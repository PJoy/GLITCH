/**
 * Created by pierreportejoie on 01/06/16.
 */


var getNumWithSetDec = function( num, numOfDec ){
        var pow10s = Math.pow( 10, numOfDec || 0 );
        return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
    },
    getAverageFromNumArr = function( numArr, numOfDec ){
        var i = numArr.length,
            sum = 0;
        while( i-- ){
            sum += numArr[ i ];
        }
        return getNumWithSetDec( (sum / numArr.length ), numOfDec );
    },
    getVariance = function( numArr, numOfDec ){
        var avg = getAverageFromNumArr( numArr, numOfDec ),
            i = numArr.length,
            v = 0;

        while( i-- ){
            v += Math.pow( (numArr[ i ] - avg), 2 );
        }
        v /= numArr.length;
        return getNumWithSetDec( v, numOfDec );
    },
    getStandardDeviation = function( numArr, numOfDec ){
        var stdDev = Math.sqrt( getVariance( numArr, numOfDec ) );
        return getNumWithSetDec( stdDev, numOfDec );
    };


function setupCanvas(img,x,y,w,h){
    if (img === undefined) img = document.getElementById('main-img');
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    document.body.appendChild(canvas);
    if (x,y,w,h === undefined) canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    else canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
    return canvas
}

function setupTiles(){
    var tiles = [];
    jQuery('img:not(:first)').each(function(){
        tiles.push(setupCanvas(this));
    });
    return tiles;
}

function compareCanvases(c1,c2,x){
    var ctx1 = c1.getContext('2d');
    var ctx2 = c2.getContext('2d');
    var diffRed = 0, diffGreen = 0, diffBlue = 0;

    for (var i = 0; i < c2.width; i+=4){
        for (var j = 0; j < c2.height; j+=4){
            var data1 = ctx1.getImageData(i,j,1,1).data;
            var data2 = ctx2.getImageData(i,j,1,1).data;
            //todo insert cache her
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
            return [diffRed, diffGreen, diffBlue];
    }

}

function compareCanvasesV2(c1,c2,x){
    var diffRed = 0, diffGreen = 0, diffBlue = 0;

    for (var i = 0; i < c2.width; i+=1){
        for (var j = 0; j < c2.height; j+=1){
            var data1 = [c1.data[j*c2.width*4+i*4],c1.data[j*c2.width*4+i*4+1],c1.data[j*c2.width*4+i*4+2]];
            var data2 = [c2.data[j*c2.width*4+i*4],c2.data[j*c2.width*4+i*4+1],c2.data[j*c2.width*4+i*4+2]];
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
            return [diffRed, diffGreen, diffBlue];
    }

}

function getClosest(array){
    var result;
    var resultIndex = 0;
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

/**
 * ARGUMENTS **/

/**
 * END ARGUMENTS **/


function V1(){
    var s = 10;
    var img = document.getElementById('main-img');
    var tiles = setupTiles();
    //var canvas = setupCanvas(img);

    ['R','G','B',''].forEach(function(x) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        document.body.appendChild(canvas);

        for (var i = 0; i < img.height; i += s) {
            for (var j = 0; j < img.width; j += s) {
                var subCanvas = setupCanvas(img, j, i, s, s);
                var comparisons = [];
                tiles.forEach(function (tile) {
                    comparisons.push(compareCanvasesV2(subCanvas.getContext('2d').getImageData(0,0,s,s), tile.getContext('2d').getImageData(0,0,s,s),x))
                });
                canvas.getContext('2d').drawImage(tiles[getClosest(comparisons)], j, i, s, s)
            }
        }
    });
}

function drawGrid(canvas, level){
    var l =level.split('-');
    var w = canvas.width/(Math.pow(2, l.length-1));
    var h = canvas.height/(Math.pow(2, l.length-1));
    var x= 0, y=0;
    var i = 1;
//console.log(l.splice(1));

    l.splice(1).forEach(function(e){
        switch (e){
            case '1':
                break;
            case '2':
                x += canvas.width/(Math.pow(2,i));
                break;
            case '3':
                y += canvas.height/(Math.pow(2,i));
                break;
            case '4':
                x += canvas.width/(Math.pow(2,i));
                y += canvas.width/(Math.pow(2,i));
                break;
        }
        i++;
    });

    var ctx = canvas.getContext('2d');
    var ctx2 = canvas2.getContext('2d');


    //var a=Math.floor(Math.random()*255),b12=Math.floor(Math.random()*255),c=Math.floor(Math.random()*255);
    //ctx.fillStyle="rgba("+a+", "+b12+", "+c+", 1)";

    var b = ctx2.getImageData(Math.floor(x),Math.floor(y),1,1);
    var min;
    var j = 0;
    var chosen = 0;

    tiles.forEach(function(e){
        var ctx3 = e.getContext('2d');
        var t = 0, u= 0, v=0;
        for(var i =0; i<1; i++){
            var tmp = ctx3.getImageData(Math.floor(Math.random()*50),Math.floor(Math.random()*50),1,1).data;
            t += tmp[0];
            u += tmp[1];
            v += tmp[2];
        }

        if (((Math.abs(t/1- b.data[0])+Math.abs(u/1- b.data[1])+Math.abs(v/1- b.data[2])) < min) || j==0) {
            chosen = j;
            min = Math.abs(t/1- b.data[0])+Math.abs(u/1- b.data[1])+Math.abs(v/1- b.data[2]);
        }
        j++;
        //console.log(min);
    });

    //console.log(tiles[chosen]);
    var pat = ctx.createPattern(tiles[chosen],'repeat');

    //ctx.rect(x,y,w,h);
    ctx.fillStyle=pat;
    //ctx.fill();

    ctx.fillRect(x,y,w,h);
    ctx.stroke();


//    ctx.rect(x,y,w,h);
  //  ctx.stroke();
}

function log(text,css){
    if (1) return;
    if (css === undefined)
        console.log(text);
    else
        console.log(text,css);
}

function splitImage(canvas, canvasData,w,h,level){
    var result = [];
    log(canvasData);
    if (level === undefined) level = '1';
    var space = '';
    for (var i=0; i<level.length; i++) space += '  ';

    log( '%c '+space +'starting level '+level+' ', 'background: #222; color: #bada55');

    drawGrid(canvas,level);




    if (level.length > 15) {
        log(    '%c '+space +'level '+level+ ' done'+' ', 'background: #222; color: #bada55');
        return level;
    }
    var threshold = 200;

    var rData = canvasData.filter(function(a,b){return !((b)%4)});
    var gData = canvasData.filter(function(a,b){return !((b+3)%4)});
    var bData = canvasData.filter(function(a,b){return !((b+2)%4)});

    var r1 = rData.filter(function(a,b){return ((b%w)<w/2 & b<w*h/2)});
    var g1 = gData.filter(function(a,b){return ((b%w)<w/2 & b<w*h/2)});
    var b1 = bData.filter(function(a,b){return ((b%w)<w/2 & b<w*h/2)});

    var r2 = rData.filter(function(a,b){return ((b%w)>=w/2 & b<w*h/2)});
    var g2 = gData.filter(function(a,b){return ((b%w)>=w/2 & b<w*h/2)});
    var b2 = bData.filter(function(a,b){return ((b%w)>=w/2 & b<w*h/2)});

    var r3 = rData.filter(function(a,b){return ((b%w)<w/2 & b>=w*h/2)});
    var g3 = gData.filter(function(a,b){return ((b%w)<w/2 & b>=w*h/2)});
    var b3 = bData.filter(function(a,b){return ((b%w)<w/2 & b>=w*h/2)});

    var r4 = rData.filter(function(a,b){return ((b%w)>=w/2 & b>=w*h/2)});
    var g4 = gData.filter(function(a,b){return ((b%w)>=w/2 & b>=w*h/2)});
    var b4 = bData.filter(function(a,b){return ((b%w)>=w/2 & b>=w*h/2)});

    /*    console.log(space+' tot '+ canvasData.length+' w '+w+' h '+h+' rdata '+rData.length+' r1 '+r1.length);
     console.log(r1);

     if (level === '1-3-3') console.log(r2);
     if (level === '1-3-3') console.log(g2);
     if (level === '1-3-3') console.log(b2);*/

    var v1 = (getVariance(r1,1)+getVariance(g1,1)+getVariance(b1,1));
    log(space+level+'-1 : ' +v1);
    if (v1 > threshold) result.push(splitImage(canvas, canvasData.filter(function(a,b){return ((b%(w*4))<(w*4/2) & b<w*4*h/2)}),w/2,h/2,level+'-1'));

    var v2 = (getVariance(r2,1)+getVariance(g2,1)+getVariance(b2,1));
    log(space+level+'-2 : ' +v2);
    if (v2 > threshold) result.push(splitImage(canvas, canvasData.filter(function(a,b){return ((b%(w*4))>=(w*4/2) & b<w*4*h/2)}),w/2,h/2,level+'-2'));

    var v3 = (getVariance(r3,1)+getVariance(g3,1)+getVariance(b3,1));
    log(space+level+'-3 : ' +v3);
    if (v3 > threshold) result.push(splitImage(canvas, canvasData.filter(function(a,b){return ((b%(w*4))<(w*4/2) & b>=w*4*h/2)}),w/2,h/2,level+'-3'));

    var v4 = (getVariance(r4,1)+getVariance(g4,1)+getVariance(b4,1));
    log(space+level+'-4 : ' +v4);
    if (v4 > threshold) result.push(splitImage(canvas, canvasData.filter(function(a,b){return ((b%(w*4))>=(w*4/2) & b>=w*4*h/2)}),w/2,h/2,level+'-4'));


    log(    '%c '+space +'level '+level+ ' done'+' ', 'background: #222; color: #bada55');
    return result;
}

function levelToCoords(level,w,h){
    console.log(level);
    var x = 0;
    var y = 0;
    var i = 0;
    level.split('-').splice(1).forEach(function(e){
        w = w/2;
        h = h/2;

        if (e == 2 || e == 4) x += w;
        if (e == 3 || e == 4) y += h;

        //i++;
    });
    return [x,y,w,h];
}

function fillImage2(array, canvas,w,h,level){
    var ctx = canvas.getContext('2d');
    var a=Math.floor(Math.random()*255),b=Math.floor(Math.random()*255),c=Math.floor(Math.random()*255);
    ctx.fillStyle="rgba("+a+", "+b+", "+c+", 1)";

    var coords = levelToCoords(level,w,h);
    var x = coords[0];
    var y = coords[1];
    var w2 = coords[2];
    var h2 = coords[3];

    console.log(array);
    console.log(' x '+x+' y '+y+' w '+w2+' h2 '+h2);
    ctx.fillRect(x,y,w2,h2);
    ctx.stroke();

    if (typeof array[0] !== "object"){
        //array.forEach(function(e){
        /*var coords2 = levelToCoords(e,w,h);
         var xx = coords2[0];
         var yy = coords2[1];
         ctx.fillRect(xx,yy,w,h);
         ctx.stroke();*/
        //})
    }
    else {
        var i = 1;
        array.forEach(function(e){
            fillImage(e,canvas,w,h,level+'-'+i);
            i++;
        });
    }


    //coords = levelToCoords()

    //array

    /*if (array.length !== (0|4)){
     //ctx.fillRect(x,y)
     }

     ctx.fillRect(0,0,10,10);
     ctx.stroke();*/
}

function fillImage3(array, canvas, w, h, level){
    //canvas stuff
    var ctx = canvas.getContext('2d');

    if (array.length !== 4){
        var coords = levelToCoords(level,w,h);
        var x = coords[0];
        var y = coords[1];
        var w2 = coords[2];
        var h2 = coords[3];
        var a=Math.floor(Math.random()*255),b=Math.floor(Math.random()*255),c=Math.floor(Math.random()*255);
        ctx.fillStyle="rgba("+a+", "+b+", "+c+", 1)";

        ctx.fillRect(x,y,w2,h2);
        ctx.stroke();
        console.log('colored '+x+' '+y+' '+w2+' '+h2);
    }
    if (typeof(array[0])==="object"){
        var i = 1;
        array.forEach(function(e){
            fillImage(e,canvas,w,h,level+'-'+i);
            i++;
        })
    } else {
        array.forEach(function(e){
            var coords = levelToCoords(e,w,h);
            var x = coords[0];
            var y = coords[1];
            var w2 = coords[2];
            var h2 = coords[3];
            var a=Math.floor(Math.random()*255),b=Math.floor(Math.random()*255),c=Math.floor(Math.random()*255);
            ctx.fillStyle="rgba("+a+", "+b+", "+c+", 1)";

            ctx.fillRect(x,y,w2,h2);
            ctx.stroke();
            console.log('colored '+x+' '+y+' '+w2+' '+h2);
        });
    }
}

$(window).load(function(){
    tiles = setupTiles();
    jQuery('img').hide();
    canvas2 = setupCanvas();
    var data = canvas2.getContext('2d').getImageData(0,0,canvas2.width,canvas2.height);

    jQuery('canvas').hide();

    var canvasse = document.createElement('canvas');
    canvasse.width = 800;
    canvasse.height = 800;
    document.body.appendChild(canvasse);


    var gruyère = splitImage(canvasse, data.data,data.width,data.height);
/*
    var canvasse = document.createElement('canvas');
    canvasse.width = 400;
    canvasse.height = 400;
    document.body.appendChild(canvasse);

    console.log(gruyère);

    fillImage(gruyère, canvasse, 400,400,'1');*/
});