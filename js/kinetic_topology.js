﻿/**
类名：网络拓扑图
描述：网络拓扑图主类
constructor:
{
	container: "container",
    width: 578,
    height: 200,
    backgroundImage:"../images/background.png",
    connectorImage:"../images/connector.png",
    toolbar:{
     	container:'toolbar',
     	data:[
	    	{id:'router',name:'路由器',image:'Router_Icon_128x128.png',width:32,height:32}
	    ]
    },
    popmenu:{
     	container:'mm',
     	data:[
	    	{id:'menu_1',name:'删除连接线',onclick:function(evt,instance){instance.deleteCurrentLine()},filter:"line"},
	    	{id:'menu_2',name:'删除设备',onclick:function(evt,instance){instance.deleteCurrentLine(),filter:"device"}},
	    	{id:'menu_1',name:'保存',onclick:function(evt,instance){alert("save")},filter:"all"}
	    ]
    }
}
*/
var debugMode=true;
Kinetic.Topology = Kinetic.Class.extend({
	config:null,
	stage:null,
	layer:null,
	messageLayer:null,
	debugMode:false,
	toolbar:null,
	backGround:null,
	connector:null,
	devices:null,//设备列表
	lines:null,//连接线列表,
	loading:null,
	popmenu:null,
	currentObject:null,
	init: function(config) {
		this.config=config;
		this.devices=new Array();
		this.lines=new Array();
		this.toolbar=new Kinetic.Topology.Toolbar({
			toolbar:this.config.toolbar
		});
		this.popmenu=new Kinetic.Topology.PopMenu({
			topology:this,
			popmenu:this.config.popmenu
		});
		
		this.stage = new Kinetic.Stage({
          container: config.container,
          width: config.width,
          height: config.height
        });
        this.layer = new Kinetic.Layer();
        this.stage.add(this.layer);
        this.messageLayer = new Kinetic.Layer();
        this.stage.add(this.messageLayer);
        this.backGround=new Kinetic.Topology.Background({
        	topology:this,
		    backgroundImage:this.config.backgroundImage
        });
        $('#'+config.container).get(0).topology=this;
        $('#'+config.container).droppable({//定义绘图区的事件
				onDragEnter:function(){
					$(this).addClass('over');
				},
				onDragLeave:function(){
					$(this).removeClass('over');
				},
				onDrop:function(e,source){
					var position = $("#"+$(source).attr("id")+"_proxy").position();
					$(this).removeClass('over');
					var img=$("img",$(source));
					var device=new Kinetic.Topology.Device({
						topology:this.topology,
						data:{id:img.attr("id")+"_"+sequence.nextVal(),name:img.attr("title"),src:img.attr("src"),
							//x:this.topology.getStage().getWidth()/2,y:this.topology.getStage().getHeight() / 2,width:'auto',height:'auto'}
							x:position.left-$("#"+this.topology.config.toolbar.container).width(),y:position.top,width:'auto',height:'auto'}
					});
					this.topology.addDevice(device);
				}
			});
		this.connector=new Kinetic.Topology.Device.Connector({
			topology:this,
			src:this.config.connectorImage
		}); 
		this.loading=false;
		this.layer.on("mouseup", function(e) {
	      
        });
    },
    containLine:function(srcDevice,dstDevice){
    	var line=this.stage.get("#"+srcDevice.getId()+"_"+dstDevice.getId());
    	if(line.length>0)
    	{
    		return true;
    	}
    	line=this.stage.get("#"+dstDevice.getId()+"_"+srcDevice.getId());
    	if(line.length>0)
    	{
    		return true;
    	}
    	return false;
    },
    deleteCurrentObject:function(){
    	this.currentObject.remove();
    },
    getCurrentObject:function(){
    	return this.currentObject;
    },
    setCurrentObject:function(obj){
    	this.currentObject=obj;
    },
    getDevices:function(){
    	return this.devices;
    },
    addDevice:function(device){
    	this.devices.push(device);
    },
    getLines:function(){
    	return this.lines;
    },
    addLine:function(line){
    	this.lines.push(line);
    },
    getStage:function(){
    	return this.stage;
    },
    getLayer:function(){
    	return this.layer;
    },
    getConfig:function(){
    	return this.config;
    },
    writeMessage:function(message) {
    	if(this.debugMode)
    	{
	        var context = this.messageLayer.getContext();
	        this.messageLayer.clear();
	        context.font = "18pt Calibri";
	        context.fillStyle = "black";
	        context.fillText(message, 10, 25);
        }
    },
    getFitDevice:function(x,y){
    	for(var i=0;i<this.devices.length;i++)
    	{
    		var fireRange={
    			x:this.devices[i].deviceImage.getX(),
    			y:this.devices[i].deviceImage.getY(),
    			width:this.devices[i].deviceImage.getWidth(),
    			height:this.devices[i].deviceImage.getHeight(),
    		};
    		if((x>=fireRange.x&&x<=fireRange.x+fireRange.width)
    		&&(y>=fireRange.y&&y<=fireRange.y+fireRange.height))
	    	{
	    		return this.devices[i];
	    	}
    	}
    	return null;
    },
    toJson:function(){
    	var jsonObj={
    		devices:[],
    		lines:[]
    	};
    	for(var i=0;i<this.devices.length;i++)
    	{
    		var device=this.devices[i];
    		var data=device.getConfig().data;
    		jsonObj.devices.push(data);
    	}
    	for(var i=0;i<this.lines.length;i++)
    	{
    		var line=this.lines[i];
    		var config=line.getConfig();
    		var srcDeviceId=config.srcDevice.getId();
    		var dstDeviceId=config.dstDevice.getId();
    		var stroke=config.stroke;
    		jsonObj.lines.push({
    			srcDeviceId:srcDeviceId,
    			dstDeviceId:dstDeviceId,
    			stroke:stroke,
    			strokeWidth:config.strokeWidth
    		});
    	}
    	return JSON.stringify(jsonObj);
    },
    clear:function(){
		for(var i=0;i<this.devices.length;i++)
    	{//删除所有设备
    		var device=this.devices[i];
    		this.layer.remove(device.deviceImage);
    	}
    	for(var i=0;i<this.lines.length;i++)
    	{//删除所有线
    		var line=this.lines[i];
    		this.layer.remove(line.lineObject);
    	}
		this.layer.draw();
		this.devices=[];
		this.lines=[];
    },
    load:function(jsonStr){
    	this.loading=true;
    	if(jsonStr!=null&&jsonStr.length>0)
    	{
    		this.clear();
    		var jsonObj=JSON.parse(jsonStr);
    		var deviceMap=[];
			for(var i=0;i<jsonObj.devices.length;i++)
	    	{
	    		var data=jsonObj.devices[i];
	    		var device=new Kinetic.Topology.Device({
						topology:this,
						data:data
					});
				this.addDevice(device);
				deviceMap[device.getId()]=device;
	    	}
	    	this.loadLineAsync(this,jsonObj);
    	}
    },
    loadLineAsync:function(instance,jsonObj){
    	var flag=true;
    	for(var i=0;i<instance.devices.length;i++)
    	{
    		if(instance.devices[i].getId()==null)
    		{
    			flag=false;
    			break;
    		}
    	}
    	instance.writeMessage(flag);
    	if(flag)
    	{//设备都已绘制完毕，可以绘线了
    		this.loading=false;
    		this.fitSizeAuto();
    		for(var i=0;i<jsonObj.lines.length;i++)
	    	{
	    		var line=jsonObj.lines[i];
	    		var srcDevice=instance.getDeviceById(line.srcDeviceId);
	    		var dstDevice=instance.getDeviceById(line.dstDeviceId);
	    		if(srcDevice!=null&&dstDevice!=null)
	    		{
	    			new Kinetic.Topology.Line({
		      			topology:instance,
						srcDevice:srcDevice,
						dstDevice:dstDevice,
						stroke:line.stroke,
						strokeWidth:line.strokeWidth
		      		});
	    		}
	    	}
	    	
    	}
    	else
    	{
    		setTimeout(function(){instance.loadLineAsync(instance,jsonObj);},300);
    	}
    	
    },
    getDeviceById:function(deviceId)
    {
    	for(var i=0;i<this.devices.length;i++)
    	{
    		var device=this.devices[i];
    		if(device.getId()==deviceId)
    		{
    			return device;
    		}
    	}
    	return null;
    },
    resize:function(width,height){
		this.stage.setSize(width, height);
        this.stage.draw();
        //每一次调整画布大小，都要重新记录一下LineImageData，不然mounseover事件无法正确激发
        for(var i=0;i<this.lines.length;i++)
        {
        	this.lines[i].lineObject.saveImageData();
        }
        this.getLayer().draw();
    },
    fitSizeAuto:function(){
    	if(this.loading)
    	{
    		return ;
    	}
    	var maxWdith=0;
    	var maxHeight=0;
    	var lastWidth=this.getStage().getWidth();
    	var lastHeight=this.getStage().getHeight();
    	var devices=this.devices;
    	for(var i=0;i<this.devices.length;i++)
    	{
    		if(devices[i].deviceImage.getX()+devices[i].deviceImage.getWidth()>maxWdith)
    		{
    			maxWdith=devices[i].deviceImage.getX()+devices[i].deviceImage.getWidth();
    		}
    		if(devices[i].deviceImage.getY()+devices[i].deviceImage.getHeight()>maxHeight)
    		{
    			maxHeight=devices[i].deviceImage.getY()+devices[i].deviceImage.getHeight();
    		}
    	}
    	if(maxWdith>lastWidth)
    	{//超出现有边界宽度
    		do
    		{	
    			lastWidth=2*lastWidth;
    		}
    		while(maxWdith>lastWidth);
    	}
    	if(maxHeight>lastHeight)
    	{//超出现有边界高度
    		do
    		{
    			lastHeight=2*lastHeight;
    		}
    		while(maxHeight>lastHeight);
    	}
    	if(maxWdith<(lastWidth/2))
    	{//小于现有边界宽度一半
    		do
    		{
    			lastWidth=2/lastWidth;
    			if(lastWidth<=this.config.width)
    			{
    				lastWidth=this.config.width;
    				break;
    			}
    		}
    		while(maxWdith<(lastWidth/2));
    	}
        if(maxHeight<(lastHeight/2))
    	{//小于现有边界高度一半
    		do
    		{
    			lastHeight=2/lastHeight;
    			if(lastHeight<=this.config.height)
    			{
    				lastHeight=this.config.height;
    				break;
    			}
    		}
    		while(maxHeight<(lastHeight/2));
    	}
    	if(lastWidth!=this.getStage().getWidth()||lastHeight!=this.getStage().getHeight())
    	{
    		this.resize(lastWidth,lastHeight);
    	}
    	
    }
});
/**
类名：工具栏
描述：工具栏主类
constructor:
{
	topology:topology,
    backgroundImage:"../images/background.png",
}
*/
Kinetic.Topology.Background = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
		this.draw();
    },
    getConfig:function(){
    	return this.config;
    },
    draw:function(){
    	var imageObj = new Image();
    	var instance=this;
        imageObj.onload = function() {
		    var node = new Kinetic.Shape({
		          drawFunc: function(context){
		          	var pattern = context.createPattern(imageObj, "repeat");
		            context.rect(0, 0, instance.config.topology.getStage().getWidth(), instance.config.topology.getStage().getHeight());
	          		context.fillStyle = pattern;
		            context.fill();
		          }
		        });
	         instance.config.topology.getLayer().add(node);
	         instance.config.topology.getLayer().draw();
	         node.moveToBottom();
	         instance.config.topology.getLayer().draw();
        };
        imageObj.src =instance.config.backgroundImage;
    }
});
/**
类名：设备
描述：设备主类
constructor:
{
	topology:topology,
    data:{
    	id:"router",name:"路由器",src:"../images/router.png",x:0,y:0,width:'auto',height:'auto'
    }
    callbackObj:..
}
*/
Kinetic.Topology.Device = Kinetic.Class.extend({
	config:null,
	lines:null,//与设置有关联的线
	deviceImage:null,
	fireRange:null,
	id:null,
	init: function(config) {
		this.config=config;
		this.draw();
		this.lines=new Array();
    },
    getConfig:function(){
    	return this.config;
    },
    getLines:function(){
    	return this.lines;
    },
    addLine:function(line){
    	this.lines.push(line);
    },
    getDeviceImage:function(){
    	return this.deviceImage;
    },
    getId:function(){
    	return this.id;
    },
    remove:function(){
    	if(this.deviceImage!=null)
    	{
    		if(this.lines!=null&&this.lines.length>0)
    		{
    			for(var i=0;i<this.lines.length;i++)
    			{
    				this.lines[i].remove();//删除与设备相关联的线
    			}
    		}
    		var devices=this.config.topology.getDevices();
    		if(devices!=null&&devices.length>0)
    		{//删除拓扑图中注册的设备信息
    			var another=[];
    			for(var i=0;i<devices.length;i++)
    			{
    				if(devices[i].getId()!=this.getId())
    				{
    					another.push(devices[i]);
    				}
    			}
    			this.config.topology.devices=another;
    		}
    		this.config.topology.getLayer().remove(this.deviceImage);//删除设备图片
    		this.config.topology.getLayer().draw();
    		this.config.topology.connector.hide();
    		this.lines=null;
    	}
    	
    },
    checkRange:function(x,y){
    	//this.config.topology.writeMessage("x: " + x + ", y: " + y);
    	var device=this.deviceImage;
    	this.fireRange={ 
	         		  x: device.getX()+device.getWidth()/4,
			          y: device.getY()+device.getHeight()/4,
			          width: device.getWidth()/2,
			          height: device.getHeight()/2};
    	if((x>=this.fireRange.x&&x<=this.fireRange.x+this.fireRange.width)
    		&&(y>=this.fireRange.y&&y<=this.fireRange.y+this.fireRange.height))
    	{
    		return true;
    	}
    	else
    	{
    		return false;
    	}
    	
    },
    syncConfig:function(){
    	this.config.data.id=this.deviceImage.getId();
    	this.config.data.x=this.deviceImage.getX();
    	this.config.data.y=this.deviceImage.getY();
    	this.config.data.width=this.deviceImage.getWidth();
    	this.config.data.height=this.deviceImage.getHeight();
    },
    draw:function(){
    	var imageObj = new Image();
    	var config=this.config;
    	var instance=this;
    	imageObj.onload = function() {
    		 var initData={
	            x: config.data.x,
	            y: config.data.y ,
	            image: imageObj,
	            id:config.data.id,
	            name:config.data.name,
	            draggable:true
	          };
	         
	         if(config.data.width!='auto')
	         {
	         	initData.width=config.data.width;
	         }
	         if(config.data.height!='auto')
	         {
	         	initData.height=config.data.height;
	         }
    		 var device = new Kinetic.Image(initData);
	         config.topology.getLayer().add(device);
	         config.topology.getLayer().draw();
	         instance.id=initData.id;
	         instance.deviceImage=device;
	         instance.syncConfig();
	         instance.bindEvent();
	         config.topology.fitSizeAuto();
	         if(instance.config.callbackObj)
	         {
	         	instance.config.callbackObj.callback(instance);
	         }
    	};
    	imageObj.src=config.data.src;
    },
    bindEvent:function(){
    	var config=this.config;
		var instance=this;
    	this.deviceImage.on("mouseover", function(evt) {
	          document.body.style.cursor = "pointer";
	          var shape = evt.shape;
	          shape.setStroke("gray");
	          shape.setStrokeWidth(0.7);
	          shape.getLayer().draw();
	          instance.config.topology.setCurrentObject(instance);
        });
        this.deviceImage.on("mouseout", function(evt) {
           document.body.style.cursor = "default";
           var shape = evt.shape;
           shape.setStroke("white");
           shape.setStrokeWidth(0.1);
	       shape.getLayer().draw();
        });
        this.deviceImage.on("mouseup", function(evt) {
           var shape = evt.shape;
           if(evt.button==2)
	        {//右键击发菜单 
	        	instance.config.topology.popmenu.show("device",evt);
	        }
        });
        this.deviceImage.on("dragstart", function(evt) {
        	  config.topology.connector.hide();
	          var shape = evt.shape;
	          shape.setShadow({
		            color: "black",
		            blur: 10,
		            offset: [10, 10],
		            alpha: 0.5
		      });
		      shape.getLayer().draw();
		      //与其相关的线隐藏
		      instance.config.topology.writeMessage(instance.getLines().length);
		      for(var i=0;i<instance.getLines().length;i++)
		      {
		      		instance.getLines()[i].hide();
		      }
		 });
		 this.deviceImage.on("dragend", function(evt) {
	          var shape = evt.shape;
	          shape.setShadow({
		           		color: "white",
			            blur: 0,
			            offset: [0, 0],
			            alpha: 1
			          });
			  shape.getLayer().draw();
			  //与其相关的线重绘后显示
			  for(var i=0;i<instance.getLines().length;i++)
		      {
		      		instance.getLines()[i].redraw();
		      		instance.getLines()[i].show();
		      }
		      instance.syncConfig();
		      instance.config.topology.fitSizeAuto();
		 });
		 this.deviceImage.on("mousemove", function(evt) {
		 	  var shape = evt.shape;
	          var mousePos = config.topology.getStage().getMousePosition();
	          var x = mousePos.x ;
	          var y = mousePos.y;
	          if(instance.checkRange(x,y))
	          {//显示连接器
	          		config.topology.connector.move(instance);
	          		config.topology.connector.show();
	          }
	          else
	          {//隐藏连接器
	          		config.topology.connector.hide();
	          }
	          //config.topology.writeMessage( "x: " + (x) + ", y: " + (y)+"|left:"+shape.getX()+"top:"+shape.getY());
	          
        });
    }
});
/**
类名：设备连接器
描述：设备连接器主类
constructor:
{
	topology:topology,
	src:connectorImage
}
*/
Kinetic.Topology.Device.Connector = Kinetic.Class.extend({
	config:null,
	device:null,
	connectorImage:null,
	isHide:false,
	onDrag:false,
	joinLine:null,
	init: function(config) {
		this.config=config;
		this.draw();
    },
    getConfig:function(){
    	return this.config;
    },
    getDevice:function(){
    	return this.device;
    },
    setDevice:function(device){
    	this.device=device;
    },
    getConnectorImage:function(){
    	return this.connectorImage;
    },
    move:function(device){
    	if(!this.onDrag)
    	{
    		this.device=device;
	    	var shape=device.getDeviceImage();
	    	var x=shape.getX()+shape.getWidth()/2-5;
	    	var y=shape.getY()+shape.getHeight()/2-5;
	    	this.connectorImage.setX(x);
	    	this.connectorImage.setY(y);
	    	this.connectorImage.moveToTop();
	    	this.config.topology.getLayer().draw();
    	}
    },
    show:function(){
    	if(this.isHide&&!this.onDrag)
    	{
    		this.isHide=false;
	    	this.connectorImage.show();
	    	this.connectorImage.setDraggable(true);
	    	this.config.topology.getLayer().draw();
    	}
    },
    hide:function(){
    	if(!this.isHide&&!this.onDrag)
    	{
    		this.isHide=true;
	    	this.connectorImage.hide();
	    	this.connectorImage.setDraggable(false);
	    	this.config.topology.getLayer().draw();
    	}
    },
    clear:function(){
    	this.connectorImage.clear();
    	this.config.topology.getLayer().draw();
    },
    restore:function(){
    	this.draw();
    },
    draw:function(){
    	var imageObj = new Image();
    	var config=this.config;
    	var instance=this;
    	imageObj.onload = function() {
    		var initData={
	            x: 5,
	            y: 5 ,
	            image: imageObj,
	            id:"connector",
	            name:"连接器",
	            draggable:false
	          };
    		 var connector = new Kinetic.Image(initData);
    		 
	         config.topology.getLayer().add(connector);
	         config.topology.getLayer().draw();
	         instance.connectorImage=connector;
	         instance.hide();
	         instance.bindEvent();
    	};
    	imageObj.src=config.src;
    },
    bindEvent:function(){
    	var instance=this;
    	var config=instance.config;
    	this.connectorImage.on("mouseover", function(evt) {
    		document.body.style.cursor = "pointer";
	        var shape = evt.shape;
	        shape.getLayer().draw();
    		instance.show();
        });
        this.connectorImage.on("mouseout", function(evt) {
        	document.body.style.cursor = "default";
            var shape = evt.shape;
	        shape.getLayer().draw();
        	instance.hide();
        });
        this.connectorImage.on("dragstart", function(evt) {
	          
	          instance.onDrag=true;
	          var device=instance.getDevice();
	          var shape=device.getDeviceImage();
	    	  var x=shape.getX()+shape.getWidth()/2;
	    	  var y=shape.getY()+shape.getHeight()/2;
	    	  
	    	  var connector = evt.shape;
	          instance.joinLine=new Kinetic.Line({
		          points: [x, y, connector.getX(), connector.getY()],
		          stroke: "green",
		          strokeWidth: 1,
		          lineJoin: "round",
		          dashArray: [33, 10]
		        });
		      connector.getLayer().add(instance.joinLine);
		      connector.getLayer().draw();
		 });
		 this.connectorImage.on("dragend", function(evt) {
	          var shape = evt.shape;
	          var dstDevice=instance.config.topology.getFitDevice(shape.getX(),shape.getY());
	          //如果连接器的终点是空白区域，就在终点位置建立一个与源设备一样的结点，并把它设置为终结点
	          instance.onDrag=false;
	          var connector_x=shape.getX();
	          var connector_y=shape.getY();
	          instance.move(instance.getDevice());
	          instance.hide();
	          shape.getLayer().remove(instance.joinLine);
		      shape.getLayer().draw();
		      instance.joinLine=null;
	          if(dstDevice==null)
	          {
	          		var originalDevice=instance.getDevice();//源结点
	          		var config=originalDevice.getConfig().data;
	          		var dstDeviceId=config.id.substring(0,config.id.lastIndexOf("_"))+"_"+sequence.nextVal();
	          		dstDevice=new Kinetic.Topology.Device({
						topology:instance.config.topology,
						data:{id:dstDeviceId,name:config.name,src:config.src,
							x: connector_x,y:connector_y,width:'auto',height:'auto'},
						callbackObj:{instance:instance,
							callback:function(dstDevice){
								new Kinetic.Topology.Line({
					      			topology:this.instance.config.topology,
									srcDevice:this.instance.getDevice(),
									dstDevice:dstDevice,
									stroke:'black',
									strokeWidth:1
					      		});
							}
						}
					});
					instance.config.topology.addDevice(dstDevice);
	          }
	          else
	          {
	          		  if(dstDevice!=null&&dstDevice.getId()!=instance.getDevice().getId()&&!instance.config.topology.loading)
				      {//连线
				      		if(!instance.config.topology.containLine(instance.getDevice(),dstDevice))
				      		{
					      		var line=new Kinetic.Topology.Line({
					      			topology:instance.config.topology,
									srcDevice:instance.getDevice(),
									dstDevice:dstDevice,
									stroke:'black',
									strokeWidth:1
					      		});
				      		}
				      }
	          }
		      
		 });
		 this.connectorImage.on("dragmove", function(evt) {
		 	  var connector = evt.shape;
	          var device=instance.getDevice();
	          var shape=device.getDeviceImage();
	    	  var x=shape.getX()+shape.getWidth()/2;
	    	  var y=shape.getY()+shape.getHeight()/2;
	    	  //config.topology.writeMessage(x+","+y+","+connector.getX()+","+connector.getY()+","+instance.onDrag);
	          if(instance.joinLine!=null)
	          {
	          		instance.joinLine.setPoints([x,y,connector.getX(),connector.getY()]);
	          		connector.getLayer().draw();
	          }
         });
    }
});
/**
类名：连接线
描述：连接线主类
constructor:
{
	topology:topology,
	srcDevice:device,
	dstDevice:device,
	stroke:'blue',
	strokeWidth:1
}
*/
Kinetic.Topology.Line = Kinetic.Class.extend({
	config:null,
	lineObject:null,
	init: function(config) {
		this.config=config;
		this.draw();
		this.bindEvent();
    },
    getConfig:function(){
    	return this.config;
    },
    getSrcDevice:function(){
    	return this.config.srcDevice;
    },
    getDstDevice:function(){
    	return this.config.dstDevice;
    },
    hide:function(){
    	this.lineObject.hide();
    	this.config.topology.getLayer().draw();
    },
    show:function(){
    	this.lineObject.show();
    	this.config.topology.getLayer().draw();
    },
    redraw:function(){
    	var srcElement=this.config.srcDevice.getDeviceImage();
    	var x1=srcElement.getX()+srcElement.getWidth()/2;
    	var y1=srcElement.getY()+srcElement.getHeight()/2;
    	var dstElement=this.config.dstDevice.getDeviceImage();
    	var x2=dstElement.getX()+dstElement.getWidth()/2;
    	var y2=dstElement.getY()+dstElement.getHeight()/2;
    	this.lineObject.setPoints([x1, y1, x2, y2]);
    	this.config.topology.getLayer().draw();
    	this.lineObject.saveImageData();
    },
    remove:function(){
    	if(this.lineObject!=null)
    	{
    		var lines=this.config.topology.getLines();
    		if(lines!=null&&lines.length>0)
    		{//删除拓扑图中注册的线信息
    			var another=[];
    			for(var i=0;i<lines.length;i++)
    			{
    				if(lines[i].lineObject.getId()!=this.lineObject.getId())
    				{
    					another.push(lines[i]);
    				}
    			}
    			this.config.topology.lines=another;
    		}
    		this.config.topology.getLayer().remove(this.lineObject);
    		this.lineObject.clearImageData();
    		this.config.topology.getLayer().draw();
    	}
    },
    draw:function(){
    	var srcElement=this.config.srcDevice.getDeviceImage();
    	var x1=srcElement.getX()+srcElement.getWidth()/2;
    	var y1=srcElement.getY()+srcElement.getHeight()/2;
    	var dstElement=this.config.dstDevice.getDeviceImage();
    	var x2=dstElement.getX()+dstElement.getWidth()/2;
    	var y2=dstElement.getY()+dstElement.getHeight()/2;
    	this.lineObject = new Kinetic.Line({
		          points: [x1, y1, x2, y2],
		          stroke: this.config.stroke,
		          strokeWidth: this.config.strokeWidth,
		          lineCap: "round",
		          lineJoin: "round",
		          draggable: false,
		          detectionType: "pixel",
		          id:this.config.srcDevice.getId()+"_"+this.config.dstDevice.getId()
		        });
		this.config.topology.getLayer().add(this.lineObject);
		this.lineObject.moveToBottom();
		this.lineObject.moveUp();
		this.config.topology.getLayer().draw();
		this.lineObject.saveImageData();
		this.config.srcDevice.addLine(this);
		this.config.dstDevice.addLine(this);
		this.config.topology.addLine(this);
    },
    bindEvent:function(){
    	var instance=this;
    	this.lineObject.on("mouseup", function(evt) {
            var shape = evt.shape;
	        instance.config.topology.writeMessage(evt.button);
	        if(evt.button==2)
	        {//右键击发菜单 
	        	instance.config.topology.popmenu.show("line",evt);
	        }
        });
        this.lineObject.on("mouseover", function(evt) {
            var shape = evt.shape;
            shape.setStrokeWidth(shape.getStrokeWidth()+2);
            instance.config.topology.getLayer().draw();
            instance.lineObject.saveImageData();
	        instance.config.topology.setCurrentObject(instance);
        });
        this.lineObject.on("mouseout", function(evt) {
            var shape = evt.shape;
            shape.setStrokeWidth(shape.getStrokeWidth()-2);
            instance.config.topology.getLayer().draw();
            instance.lineObject.saveImageData();
	        instance.config.topology.writeMessage("mouseover");
        });
    }
});
/**
类名：工具栏
描述：工具栏主类
constructor:
{
    toolbar:{
     	container:'toolbar',
     	data:[
	    	{id:'router',name:'路由器',image:'Router_Icon_128x128.png',width:32,height:32}
	    ]
    }
}
*/
Kinetic.Topology.Toolbar = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
		$("#"+this.config.toolbar.container).html(this.getHtml());
		for(var i=0,n=this.config.toolbar.data.length;i<n;i++)
    	{
    		var data=this.config.toolbar.data[i];
    		var toolkit=new Kinetic.Topology.Toolbar.Toolkit({
    			container:this.config.toolbar.container+'_topology',
				data:data
    		});
    	}
    	$("#"+this.config.toolbar.container).accordion({  
		});  
    },
    getConfig:function(){
    	return this.config;
    },
    getHtml:function(){
    	var html= "<div id='"+this.config.toolbar.container+"_topology' title='网络拓扑'>";
    	html+="</div>";
		return html;
    }
});
/**
类名：工具
描述：工具主类
constructor:
{
	container:'toolbar_topology',
	data:{id:'router',name:'路由器',image:'Router_Icon_128x128.png',width:32,height:32}
}
*/
Kinetic.Topology.Toolbar.Toolkit = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
		var container=$("#"+this.config.container);
    	container.append(this.getHtml());
    	this.bindEvent();
    },
    getConfig:function(){
    	return this.config;
    },
    getHtml:function(){
    	var html="<div id='"+this.config.data.id+"_div' style='float:left'><img id='"+this.config.data.id+"' src='"+this.config.data.image+"' width='"+this.config.data.width+"px' height='"+this.config.data.height+"px' style='padding:2px;position:relative;z-index:100;border:solid white 1px' title='"+this.config.data.name+" '/></div>";
    	return html;
    },
    bindEvent:function(){
    	$("#"+this.config.data.id+"_div").draggable({//可托动
				revert:true,
				proxy: function(source){
					var cloneObj=$(source).clone().attr("id",$(source).attr("id")+"_proxy");
					var p=cloneObj.insertAfter(source);
					return p;
				}
			});
    	//定义工具栏图片的鼠标事件
	   $("#"+this.config.data.id).mouseover(function(){
	   		$(this).css("border","solid black 1px");
	   });
	   $("#"+this.config.data.id).mouseout(function(){
	   		$(this).css("border","solid white 1px");
	   });
    }
});
/**
	constructor:
{
	topology:topology
    popmenu:{
     	container:'mm',
     	data:[
	    	{id:'menu_1',name:'删除',onclick:function(evt,instance){...},filter:"line"}
	    ]
    }
}
*/
Kinetic.Topology.PopMenu = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
		//$("#"+this.config.popmenu.container).html(this.getHtml());
		$("#"+this.config.popmenu.container).menu({  
		}); 
		this.bindEvent();
		$(document).bind('contextmenu',function(e){
				return false;
			});
    },
    getConfig:function(){
    	return this.config;
    },
    redraw:function(filter){
    	for(var i=0;i<this.config.popmenu.data.length;i++)
    	{//删除已有
    		var itemEl = $("#"+this.config.popmenu.data[i].id).get(0);
    		if(itemEl)
    		{
    			$('#mm').menu('removeItem', itemEl);
    		}
    	}
    	//重新添加
    	for(var i=0;i<this.config.popmenu.data.length;i++)
    	{
    		if(this.config.popmenu.data[i].filter=="all"||this.config.popmenu.data[i].filter==filter)
    		{
				$('#mm').menu('appendItem', {
					id:this.config.popmenu.data[i].id,
					text: this.config.popmenu.data[i].name,
					iconCls: this.config.popmenu.data[i].iconCls,
					onclick: this.config.popmenu.data[i].onclick
				});
    		}
    	}
    },
    getHtml:function(){
    	var html="";
    	for(var i=0;i<this.config.popmenu.data.length;i++)
    	{
    		html+="<div id='"+this.config.popmenu.data[i].id+"'>"+this.config.popmenu.data[i].name+"</div>";
    	}
    	return html;
    },
    bindEvent:function(){
    	for(var i=0;i<this.config.popmenu.data.length;i++)
    	{
    		if(this.config.popmenu.data[i].onclick)
    		{
    			var topology=this.config.topology;
    			$("#"+this.config.popmenu.data[i].id).click(this.config.popmenu.data[i].onclick); 
    		}
    	}
    },
    show:function(filter,e){
    	var id=this.config.popmenu.container;
    	var mousePos = this.config.topology.getStage().getMousePosition();
        var x = mousePos.x;
        var y = mousePos.y;
        this.redraw(filter);
    	$('#'+id).menu('show', {
					left:  e.pageX,
					top:  e.pageY
				});
    },
    hide:function(){
    	var id=this.config.popmenu.container;
    	$('#'+id).menu('hide');
    }
});

/**
类名：菜单
描述：菜单主类
constructor:
*/
Kinetic.Topology.Menu = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
    },
    getConfig:function(){
    	return this.config;
    },
    getHtml:function(){
    }
});
/**
类名：菜单项
描述：菜单项主类
constructor:
*/
Kinetic.Topology.Menu.Item = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
    },
    getConfig:function(){
    	return this.config;
    },
    getHtml:function(){
    }
});

/**
类名：序列
描述：序列主类
constructor:
*/
Kinetic.Topology.Sequence = Kinetic.Class.extend({
	seq:0,
	init: function() {
    },
    nextVal:function(){
    	return Math.uuid();
    }
});
var sequence=new Kinetic.Topology.Sequence({});