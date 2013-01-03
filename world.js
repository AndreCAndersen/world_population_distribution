var scaleFactor = 120;

SetImageScale(scaleFactor)
SetWorldPopOutputTablePosition();

window.onresize = function(event) {
	SetWorldPopOutputTablePosition();
}

var worldImage = document.getElementById("worldImage");
worldImage.onmousemove = OnMouseMoveOverImage;

var horLine = document.getElementById("horLine");
horLine.onmousemove = OnMouseMoveOverImage;

var verLine = document.getElementById("verLine");
verLine.onmousemove = OnMouseMoveOverImage;

var yMax =  720;
var xMax = 1440;

var worldRawData
$.ajax("world.txt", {
    dataType: "text",
    success: function (data) {
        worldRawData = data;
    },
	async: false
});

var worldRawDataLines = worldRawData.split(";");

var pointPopDataIndex = 0;
var pointPopData = []; //720 rows of 1440 elements stacked side by side

var latPopDataIndex = 0;
var latPopData = [];

var longPopDataIndex = 0;
var longPopData = [];

var latDataIndex = 0;
var latData = [];

var longDataIndex = 0;
var longData = [];


for (var i = 0; i < worldRawDataLines.length-1; i++) {
	var worldRawDataLineElements = worldRawDataLines[i].split(",");
	for (var j = 0; j < worldRawDataLineElements.length; j++) {
	
		if(j == xMax+1 && i > 0 && i < yMax+1)
		{
			latPopData[latPopDataIndex++] = worldRawDataLineElements[j]
		}
		
		if(i == yMax+1 && j > 0 && j < xMax+1)
		{
			longPopData[longPopDataIndex++] = worldRawDataLineElements[j]
		}
	
		if(j == 0 && i > 0 && i < yMax+1)
		{
			latData[latDataIndex++] = worldRawDataLineElements[j]
		}
		
		if(i == 0 && j > 0 && j < xMax+1)
		{
			longData[longDataIndex++] = worldRawDataLineElements[j]
		}
		
		if(i > 0 && i < yMax+1 && j > 0 && j < xMax+1)
		{
			pointPopData[pointPopDataIndex++] = worldRawDataLineElements[j] 
		}
	}
}



var citiesRawData
$.ajax("cities.txt", {
    dataType: "text",
    success: function (data) {
        citiesRawData = data;
    },
	async: false
});

var citiesRawDataLines = citiesRawData.split(";")

var cityNameData = [];
for (var i = 0; i < citiesRawDataLines.length; i++) {
	var citiesRawDataLineElements = citiesRawDataLines[i].split(",");
	if(citiesRawDataLineElements.length==4)
	{
		var longitude = citiesRawDataLineElements[3];
		var latitude = citiesRawDataLineElements[2];
		var hash = Hash(longitude, latitude);
		cityNameData[hash] = citiesRawDataLineElements[0];
	}
}


function Hash(longitude, latitude)
{
	return ((parseInt(longitude)/2)|0)+","+((parseInt(latitude)/2)|0);
}

function OnPlussButtonClick()
{
	if(scaleFactor < 175)
	{
		scaleFactor += 15;
		SetImageScale(scaleFactor);
	}
}

function OnMinusButtonClick()
{
	if(scaleFactor > 65)
	{
		scaleFactor -= 15;
		SetImageScale(scaleFactor);
	}
}

function SetWorldPopOutputTablePosition()
{
	var worldPopOutputTable = document.getElementById("worldPopOutputTable");
	var browserSize = GetBrowserSize();
	worldPopOutputTable.style.top = (browserSize.Y - worldPopOutputTable.clientHeight - 15) + "px"
	
}

function GetBrowserSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
	//Non-IE
	myWidth = window.innerWidth;
	myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
	//IE 6+ in 'standards compliant mode'
	myWidth = document.documentElement.clientWidth;
	myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
	//IE 4 compatible
	myWidth = document.body.clientWidth;
	myHeight = document.body.clientHeight;
  }
  return new Point(myWidth, myHeight);
}

function SetImageScale(scaleFactor)
{
	var worldImage = document.getElementById("worldImage");
	worldImage.height = scaleFactor * (4+1);
	worldImage.width = scaleFactor * (8+1);
	
	var horLine = document.getElementById("horLine");
	horLine.style.width = (scaleFactor * (8+1)) + "px";
	
	var verLine = document.getElementById("verLine");
	verLine.style.height = (scaleFactor * (4+1)) + "px";
}

function DrawLine(point)
{
	var horLine = document.getElementById("horLine");
	horLine.style.top = (point.Y+10) + "px";
	
	var verLine = document.getElementById("verLine");
	verLine.style.left = (point.X+10) + "px";
}

function OnMouseMoveOverImage(e)
{
	
	var p = GetCoordinates(e);
	
	DrawLine(p);
	
	p.X = 180*p.X/scaleFactor | 0;
	p.Y = 180*p.Y/scaleFactor | 0;
	
	if(p.X > xMax)
	{
		p.X = xMax-1;
	}
	if(p.Y > yMax)
	{
		p.Y = yMax-1;
	}
	
	var rawLat = latData[p.Y];
	if(rawLat > 0)
	{
		document.getElementById("lat").innerHTML = rawLat + " S";
	} 
	else 
	{
		document.getElementById("lat").innerHTML = -rawLat + " N";
	}
	
	var rawLong = longData[p.X];
	if(rawLong > 0)
	{
		document.getElementById("long").innerHTML = rawLong + " E";
	} 
	else 
	{
		document.getElementById("long").innerHTML = -rawLong + " W";
	}
	
	document.getElementById("pointPop").innerHTML = pointPopData[p.Y * xMax + p.X];
	document.getElementById("latPop").innerHTML = latPopData[p.Y];
	document.getElementById("longPop").innerHTML = longPopData[p.X];
	
	var city = cityNameData[Hash(longData[p.X], latData[p.Y])];
	if(city == null)
	{
		document.getElementById("city").innerHTML = "";
	}
	else
	{
		document.getElementById("city").innerHTML = city;
	}
}

function GetCoordinates(e)
{
  var PosX = 0;
  var PosY = 0;
  var ImgPos;
  ImgPos = FindPosition(worldImage);
  if (!e) var e = window.event;
  if (e.pageX || e.pageY)
  {
	PosX = e.pageX;
	PosY = e.pageY;
  }
  else if (e.clientX || e.clientY)
	{
	  PosX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	  PosY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
  PosX = PosX - ImgPos[0];
  PosY = PosY - ImgPos[1];
  return new Point(PosX, PosY);
}

function Point(x, y)
{
	this.X = x;
	this.Y = y;
}

function FindPosition(oElement)
{
  if(typeof( oElement.offsetParent ) != "undefined")
  {
	for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
	{
	  posX += oElement.offsetLeft;
	  posY += oElement.offsetTop;
	}
	  return [ posX, posY ];
	}
	else
	{
	  return [ oElement.x, oElement.y ];
	}
}