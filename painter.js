/**
 * Created by pierreportejoie on 16/06/16.
 */

onmessage = function(e) {
    e = e.data;
    var canvasData = e.data;
    var w = e.width;
    var h = e.height;

    /*console.log(canvasData);
    console.log(w);
    console.log(h);*/

    splitImage(canvasData,w,h)
};

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


function splitImage(canvasData,w,h,level){

    var result = [];
    if (level === undefined) level = '1';

    //drawGrid(canvas,level);
    postMessage(level);

    var lengthLimit = Math.random() * (100 - 1) + 1;
    var thresholdLimit = Math.random() * (500 - 50) + 50;

    if (level.length > lengthLimit) {
        return level;
    }
    var threshold = thresholdLimit;

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

    var v1 = (getVariance(r1,1)+getVariance(g1,1)+getVariance(b1,1));
    if (v1 > threshold) result.push(splitImage(canvasData.filter(function(a,b){return ((b%(w*4))<(w*4/2) & b<w*4*h/2)}),w/2,h/2,level+'-1'));

    var v2 = (getVariance(r2,1)+getVariance(g2,1)+getVariance(b2,1));
    if (v2 > threshold) result.push(splitImage(canvasData.filter(function(a,b){return ((b%(w*4))>=(w*4/2) & b<w*4*h/2)}),w/2,h/2,level+'-2'));

    var v3 = (getVariance(r3,1)+getVariance(g3,1)+getVariance(b3,1));
    if (v3 > threshold) result.push(splitImage(canvasData.filter(function(a,b){return ((b%(w*4))<(w*4/2) & b>=w*4*h/2)}),w/2,h/2,level+'-3'));

    var v4 = (getVariance(r4,1)+getVariance(g4,1)+getVariance(b4,1));
    if (v4 > threshold) result.push(splitImage(canvasData.filter(function(a,b){return ((b%(w*4))>=(w*4/2) & b>=w*4*h/2)}),w/2,h/2,level+'-4'));

    return result;
}

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

