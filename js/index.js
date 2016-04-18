var ref = _('ref');
var res = _('res');

var ctx0 = ref.getContext('2d');
var ctx1 = res.getContext('2d');
var width = ref.width;
var height = ref.height;

var threshold = 128;
var refdata = new Uint8ClampedArray(width*height*4);
var refImageData;
var lenaImageData;
var lenadata = [];

var lena = new Image();
lena.src = './images/lena.jpg';
lena.onload = function(){
    ctx0.drawImage(lena,0,0);
    setTimeout(function(){
        console.log("stored lenadata");
        lenaImageData = ctx0.getImageData(0,0,width,height);
        lenadata = lenaImageData.data;
    },500);
}

/* Calculation of histogram  */
var Rhist = [];
var Ghist = [];
var Bhist = [];

function initialzeHist(){
  for(var i=0;i<255;i++){
    Rhist.push(0);
    Ghist.push(0);
    Bhist.push(0);
  }   
}

var Rcanvas = _('redHist');
var Gcanvas = _('greenHist');
var Bcanvas = _('blueHist');
var width  = Rcanvas.width;
var height = Rcanvas.height;
var binWidth = Math.floor(width/256);
    
var Rctx = Rcanvas.getContext('2d');
var Gctx = Gcanvas.getContext('2d');
var Bctx = Bcanvas.getContext('2d');

function calcHist(){
    Rctx.fillStyle = 'white';
    Rctx.fillRect(0,0,width,height);
    Rctx.fillStyle = 'red';
    var rmax = Rhist[0];
    for(var i=0;i<255;i++) (rmax<Rhist[i])?rmax = Rhist[i]:1; 
    for(var i=0;i<255;i++) Rctx.fillRect(Math.floor((i/255)*width),height,binWidth,-Math.floor((Rhist[i]/rmax)*height));
    
    Gctx.fillStyle = 'white';
    Gctx.fillRect(0,0,width,height);
    Gctx.fillStyle = 'green';
    var gmax = Ghist[0];
    for(var i=0;i<255;i++) (gmax<Ghist[i])?gmax = Ghist[i]:1; 
    for(var i=0;i<255;i++) Gctx.fillRect(Math.floor((i/255)*width),height,binWidth,-Math.floor((Ghist[i]/gmax)*height));
    
    Bctx.fillStyle = 'white';
    Bctx.fillRect(0,0,width,height);
    Bctx.fillStyle = 'blue';
    var bmax = Bhist[0];
    for(var i=0;i<255;i++) (bmax<Bhist[i])?bmax = Bhist[i]:1; 
    for(var i=0;i<255;i++) Bctx.fillRect(Math.floor((i/255)*width),height,binWidth,-Math.floor((Bhist[i]/bmax)*height));
}

/* 
   Javascript imageData object has the following structure
   { data ( UInt8ClampedArray ), width (int), height(int)}
   
   the data array has all the pixel info and one pixel has 4 values : R,G,B,alpha . Alpha is opacity 255 for opaque, 0 for transparent.
   
*/

function thresholding(){
    refImageData = new ImageData(width,height);
    refdata = refImageData.data;
    initialzeHist();
    // looping one pixel at a time by jumping over 4 values in 1 step
    for(var i=0;i<lenadata.length;i+=4){
        flat_linear_reverse(i);     
        refdata[i+3] = lenadata[i+3];
        
        Rhist[refdata[i]]++;
        Ghist[refdata[i+1]]++;
        Bhist[refdata[i+2]]++;
    }
    console.log(Rhist);
    console.log(Ghist);
    console.log(Bhist);
    calcHist();
    ctx1.putImageData(refImageData,0,0);
    // debug statements
    // console.log(lenaImageData);
    // console.log(refImageData);    
}

function sum(){
    var Rsum = 0;
    var Gsum = 0;
    var Bsum = 0;
    
    for(var j=0;j<255;j++) Rsum+= Rhist[j];
    for(var k=0;k<255;k++) Gsum+= Ghist[k];
    for(var l=0;l<255;l++) Bsum+= Bhist[j];
    
    console.log("red sum: "+Rsum);
    console.log("green sum: "+Gsum);
    console.log("blue sum: "+Bsum);
    
}
/*
    
*/

// extracts blue plane from the image
function extractPlanes(i){
    refdata[i]   = 0*lenadata[i];
    refdata[i+1] = 0*lenadata[i+1];
    refdata[i+2] = lenadata[i+2];
}

/*
 the thresholding function is like this :
                    
                   /
                  /
                 /  
  ______________/
                T= threshold val
*/

function flat_linear(i){
    (lenadata[i]>threshold)?(refdata[i]=lenadata[i]):(refdata[i]=0);
    (lenadata[i+1]>threshold)?(refdata[i+1]=lenadata[i+1]):(refdata[i+1]=0);
    (lenadata[i+2]>threshold)?(refdata[i+2]=lenadata[i+1]):(refdata[i+2]=0);
}

function flat_linear_reverse(i){
    (lenadata[i]>threshold)?(refdata[i]=0):(refdata[i]=lenadata[i]);
    (lenadata[i+1]>threshold)?(refdata[i+1]=0):(refdata[i+1]=lenadata[i+1]);
    (lenadata[i+2]>threshold)?(refdata[i+2]=0):(refdata[i+2]=lenadata[i+2]);
}

/* 
  the thresholding function is like this :
                ______________________
                |
                |  
  ______________|
                T= threshold val
                
*/

function binary(i){
    (lenadata[i]>threshold)?(refdata[i]=255):(refdata[i]=0);
    (lenadata[i+1]>threshold)?(refdata[i+1]=255):(refdata[i+1]=0);
    (lenadata[i+2]>threshold)?(refdata[i+2]=255):(refdata[i+2]=0);
}

function binary_reverse(i){
    (lenadata[i]>threshold)?(refdata[i]=0):(refdata[i]=255);
    (lenadata[i+1]>threshold)?(refdata[i+1]=0):(refdata[i+1]=255);
    (lenadata[i+2]>threshold)?(refdata[i+2]=0):(refdata[i+2]=255);
}

/* produces a vintage effect by using a binary for red and a flat_linear for blue and green pixel intensities*/

function vintage(i){
        (lenadata[i]>threshold)?(refdata[i]=0):(refdata[i]=180);
        (lenadata[i+1]>threshold)?(refdata[i+1]=lenadata[i+1]):(refdata[i+1]=0);
        (lenadata[i+2]>threshold)?(refdata[i+2]=lenadata[i+2]):(refdata[i+2]=0);
}

$(document).ready(function(){
    console.log("app ready for use!!");
    ctx0.fillStyle = 'yellow';
    ctx0.fillRect(0,0,width,height);
    ctx1.fillStyle = 'yellow';
    ctx1.fillRect(0,0,width,height);
    setTimeout(function(){
        thresholding();
        $('#overlay').fadeOut();
    },2000);
});

var counter = 0;

$(document).keypress(function(evt){
    console.log(evt.which);
    if(evt.which==97){
     if(counter==0){
        $('#thresholding_container').fadeOut();
        $('#threshold').hide();
        $('#histogram_container').fadeIn();
        calcHist(); 
        counter++;
     }else{
        $('#thresholding_container').fadeIn();
        $('#threshold').show(); 
        counter = 0 ; 
         $('#histogram_container').fadeOut();
     }
    }
});

$('#threshold').change(function(){
    threshold = Math.floor(((_('threshold').value)*255)/100);
    console.log(threshold);
    thresholding();
});

function _(id){
    return document.getElementById(id);
}