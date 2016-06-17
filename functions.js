/** MAIN SETUP */

jQuery(window).load(function(){
    loading = 0;
    //setup
    jQuery('img.tile:first').attr("id","main-img");

    var mainCanvas = setupCanvas();

    //canvas for color picking
    colorCanvas = setupCanvas();

    //tiles for pattern picking
    tiles = setupTiles();

    //randomize actual tiles
    var it = 0;
    tiles.forEach(function(tile){
        var maxW = mainCanvas.width;
        var maxH = mainCanvas.height;
        var cW = Math.floor(Math.random()*(Math.min(maxW,tile.width)-1)+1);
        var cH = Math.floor(Math.random()*(Math.min(maxW,tile.height)-1)+1);
        var cX = Math.floor(Math.random()*(tile.width - cW));
        var cY = Math.floor(Math.random()*(tile.height - cH));
        var canvas = document.createElement('canvas');
        canvas.width = cW;
        canvas.height = cH;

        canvas.getContext('2d').drawImage(tile, cX, cY, cW, cH, 0, 0, cW, cH);
        if (it!==0) tiles[it] = canvas;
        it++;
        //console.log("tile "+it+", x : "+cX+",y : "+cY+",w : "+cW+",h : "+cH)

        jQuery(".tiles").append(canvas);
    });

    jQuery('.main-img').append(mainCanvas);

    var canvasData = mainCanvas.getContext('2d').getImageData(0,0,mainCanvas.width,mainCanvas.height);
    mainCanvas.getContext('2d').fillStyle = '#FFFFFF';
    mainCanvas.getContext('2d').fillRect(0,0,mainCanvas.width,mainCanvas.height);
    mainCanvas.getContext('2d').stroke();

    if (window.Worker){
        var myWorker = new Worker("painter.js");
        myWorker.postMessage(canvasData);

        myWorker.onmessage = function(e) {
            drawGrid(mainCanvas, e.data)
        }
    }
});

/** END MAIN SETUP */

/** UTILITY FUNCTIONS */

function get_percent_loaded(level){
    var p = 0;
    var i = -1;
    level.split('-').splice(1).forEach(function(e){
        i++;
        var a = Math.pow(4, i);
        switch (e){
            case '1':
                p+=(0/a);
                break;
            case '2':
                p+=(25/a);
                break;
            case '3':
                p+=(50/a);
                break;
            case '4':
                p+=(75/a);
                break;
        }
    });
    return p;
}

function setupTiles(){
    var tiles = [];
    jQuery('img.tile').each(function(){
        tiles.push(setupCanvas(this));
    });
    //tiles.shift();
    return tiles;
}

function setupCanvas(img,x,y,w,h){
    if (img === undefined) img = document.getElementById('main-img');
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    if (x,y,w,h === undefined) canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    else canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
    return canvas
}

function drawGrid(canvas, level){

    var newLoad = Math.floor(get_percent_loaded(level));
    if (loading<newLoad) {
        loading=newLoad;
        /*console.clear();
        console.log(loading+'%');*/
        jQuery(".progression").css("width",loading+"%");
    }

    var l =level.split('-');
    var w = canvas.width/(Math.pow(2, l.length-1));
    var h = canvas.height/(Math.pow(2, l.length-1));
    var x= 0, y=0;
    var i = 1;

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

//    var j = Math.floor(Math.random()*1.2+1);
    ctx.fillStyle=setPattern(2,x,y,w,h,ctx);

    ctx.fillRect(x,y,w,h);
    ctx.stroke();
}

/** returns brush pattern
 * CASES :
 * 0 : random color
 * 1 : color of first pixel in chosen zone
 * 2 : tile pattern from color of first pixel
 * 2.1, 2.2, 2.3 same as 2 comparing only R, G, B
 * 3 : tile pattern from mean color
 * 4 : tile pattern from first color (tile = random part of img)
 * 5 : tile pattern from first color (tile = random part of img) (more precise (TODO))*/
function setPattern(pattern,x,y,w,h,ctx){
    var tr = 1;//Math.random();
    switch (pattern){
        case 0 :
            var a=Math.floor(Math.random()*255),b=Math.floor(Math.random()*255),c=Math.floor(Math.random()*255);
            return "rgba("+a+", "+b+", "+c+", "+tr+")";
        case 1 :
            var ctx2 = colorCanvas.getContext('2d');
            var color = ctx2.getImageData(Math.floor(x),Math.floor(y),1,1);
            return "rgba("+color.data[0]+", "+color.data[1]+", "+color.data[2]+", "+tr+")";
        case 2 :
            var ctx2 = colorCanvas.getContext('2d');
            var b = ctx2.getImageData(Math.floor(x),Math.floor(y),1,1);
            var min;
            var j = 0;
            var chosen = 0;
            var threshold = 2;

            tiles.forEach(function(e){
                var ctx3 = e.getContext('2d');
                var t = 0, u= 0, v=0;
                for(var i =0; i<threshold; i++){
                    var tmp = ctx3.getImageData(Math.floor(Math.random()* e.width),Math.floor(Math.random()* e.height),1,1).data;
                    t += tmp[0];
                    u += tmp[1];
                    v += tmp[2];
                }


                if (((Math.abs(t/threshold- b.data[0])+Math.abs(u/threshold- b.data[1])+Math.abs(v/threshold- b.data[2])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b.data[0])+Math.abs(u/threshold- b.data[1])+Math.abs(v/threshold- b.data[2]);
                }
                j++;
            });
            return ctx.createPattern(tiles[chosen],'repeat');
        case 2.1 :
            var ctx2 = colorCanvas.getContext('2d');
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

                var threshold =1;

                if (((Math.abs(t/threshold- b.data[0])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b.data[0]);
                }
                j++;
            });
            return ctx.createPattern(tiles[chosen],'repeat');
        case 2.2 :
            var ctx2 = colorCanvas.getContext('2d');
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

                var threshold =1;

                if (((Math.abs(t/threshold- b.data[1])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b.data[1]);
                }
                j++;
            });
            return ctx.createPattern(tiles[chosen],'repeat');
        case 2.3 :
            var ctx2 = colorCanvas.getContext('2d');
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

                var threshold =1;

                if (((Math.abs(t/threshold- b.data[2])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b.data[2]);
                }
                j++;
            });
            return ctx.createPattern(tiles[chosen],'repeat');
        case 3 :
            var ctx2 = colorCanvas.getContext('2d');
            var c = ctx2.getImageData(Math.floor(x),Math.floor(y),w,h);
            b = computeColorMeans(c.data);
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

                var threshold = 1;

                if (((Math.abs(t/threshold- b[0])+Math.abs(u/threshold- b[1])+Math.abs(v/threshold- b[2])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b[0])+Math.abs(u/threshold- b[1])+Math.abs(v/threshold- b[2]);
                }
                j++;
            });
            return ctx.createPattern(tiles[chosen],'repeat');
        case 4 :
            var ctx2 = colorCanvas.getContext('2d');
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

                var threshold =1;

                if (((Math.abs(t/threshold- b.data[0])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b.data[0]);
                }
                j++;
            });
            var cW = Math.floor(Math.random()*(tiles[chosen].width));
            var cH = Math.floor(Math.random()*(tiles[chosen].height));
            var cX = Math.floor(Math.random()*(tiles[chosen].width - cW));
            var cY = Math.floor(Math.random()*(tiles[chosen].height - cH));

            var canvas = document.createElement('canvas');
            var tile = canvas.getContext('2d').drawImage(tiles[chosen], cX, cY, cW, cH, 0, 0, cW, cH);

            return ctx.createPattern(canvas,'repeat');
        case 5 :
            var ctx2 = colorCanvas.getContext('2d');
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

                var threshold =1;

                if (((Math.abs(t/threshold- b.data[0])) < min) || j==0) {
                    chosen = j;
                    min = Math.abs(t/threshold- b.data[0]);
                }
                j++;
            });
            var cW = Math.floor(Math.random()*(tiles[chosen].width));
            var cH = Math.floor(Math.random()*(tiles[chosen].height));
            var cX = Math.floor(Math.random()*(tiles[chosen].width - cW));
            var cY = Math.floor(Math.random()*(tiles[chosen].height - cH));

            var canvas = document.createElement('canvas');
            var tile = canvas.getContext('2d').drawImage(tiles[chosen], cX, cY, cW, cH, 0, 0, cW, cH);

            return ctx.createPattern(canvas,'repeat');
    }
}

function computeColorMeans(array){
    var rData = array.filter(function(a,b){return !((b)%4)});
    var gData = array.filter(function(a,b){return !((b+3)%4)});
    var bData = array.filter(function(a,b){return !((b+2)%4)});
    var sumR = rData.reduce(function(a, b) { return a + b; })/rData.length;
    var sumG = gData.reduce(function(a, b) { return a + b; })/gData.length;
    var sumB = bData.reduce(function(a, b) { return a + b; })/bData.length;
    return [sumR,sumG,sumB];
}


/** END UTILITY FUNCTIONS */
