/**
类名：网络拓扑图
描述：网络拓扑图主类
constructor:
{
	container: "container",
    width: 578,
    height: 200,
    backgroundImage:"../images/background.png",
    data:[
    	{title:'部分一',value:100},
    	{title:'部分二',value:100},
    	{title:'部分三',value:100},
    	{title:'部分四',value:100},
    	{title:'部分五',value:100},
    	{title:'部分六',value:100}
    ],
    onclick:showMessage
}
*/
Kinetic.Pie = Kinetic.Class.extend({
	config:null,
	stage:null,
	layer:null,
	shapes:null,
	currentShape:null,
	textBox:null,
	toolbar:null,
	init: function(config) {
		this.config=config; 
		$("#"+config.container).css({width:config.width});
		$("#"+config.container).append("<div id='"+config.container+"_pie'></div>"); 
		
		//$("#"+config.container+"_pie").css({width:config.width, height: config.height,border:"solid gray 1px"});
		this.stage = new Kinetic.Stage({
          container: config.container+"_pie",
          width: config.width,
          height: config.height
        });
       
        this.layer = new Kinetic.Layer();
        this.stage.add(this.layer);
		this.backGround=new Kinetic.Pie.Background({
        	topology:this,
		    backgroundImage:this.config.backgroundImage
        });
        this.textBox =new Kinetic.Text({
          text: "",
          textFill: "white",
          fontFamily: "Calibri",
          fontSize: 10,
          padding: 5,
          fill: "black",
          visible: false,
          opacity: 0.75
        });
        this.layer.add(this.textBox);
        this.layer.draw();
        
        this.shapes=new Array();
        this.draw();
        this.bindEvent();
        if(config.showLegend)
        {
	        $("#"+config.container).append("<div id='"+config.container+"_toolbar' style='width:"+(config.width+3)+"px;margin-top:2px;'></div>");
	        var instance=this;
	        this.toolbar=new Kinetic.Pie.Toolbar({
	        	toolbar:{
			     	container:config.container+'_toolbar',
			     	data:instance.config.data
			    }
	        });
        }
    },
    getStage:function(){
    	return this.stage;
    },
    getLayer:function(){
    	return this.layer;
    },
    setCurrentShape:function(shape){
    	this.currentShape=shape;
    },
    getCurrentShape:function(){
    	return this.currentShape;
    },
    draw:function(){
    	var stage=this.getStage();
    	var instance=this;
    	var data=this.config.data;
    	var total=0;
    	for(var i=0;i<data.length;i++)
    	{
    		total=total+data[i].value;
    	}
    	var startAngle=0;
    	for(var i=0;i<data.length;i++)
    	{
    		data[i].id=i;
    		data[i].percent=data[i].value/total;
    		var endAngle=startAngle+Math.PI*2*data[i].percent;
    		var color=instance.getRandomColor();
    		data[i].color=color;
    		var shape = new Kinetic.Shape({
	          drawFunc: function(context) {
	            var y = stage.getHeight()/2;
	            var x = stage.getWidth()/2;
	            context.beginPath();
	            context.arc(x, y, Math.min(x,y), this.attrs.startAngle, this.attrs.endAngle, false);  
	            context.lineTo(x, y);
	            context.closePath();
	            this.fill(context);
	            this.stroke(context);
	          },
	          fill: {
	            	start: {
		              x: stage.getWidth()/4,
		              y: stage.getHeight()/4,
		              radius: 0
		            },
		            end: {
		              x: stage.getWidth()/2,
		              y: stage.getHeight()/2,
		              radius: Math.min(stage.getWidth()/2,stage.getHeight()/2)
		            },
		            colorStops: [0, 'white',0.9,color,1, color]
	          },
	          draggable:false,
	          startAngle:startAngle,
	          endAngle:endAngle,
	          data:data[i]
	        });
	        startAngle=endAngle;
	        this.layer.add(shape);
	        this.shapes.push(shape);
    	}
    	this.layer.draw();
    },
    bindEvent:function(){
    	var instance=this;
    	for(var i=0;i<this.shapes.length;i++)
    	{
    		this.shapes[i].on("mouseover", function(evt) {
		          document.body.style.cursor = "pointer";
		          var shape = evt.shape;
		          instance.setCurrentShape(evt.shape);
			          shape.setShadow({
			            color: "black",
			            blur: 20,
			            offset: [10, 10],
			            alpha: 0.5
			      });
			      shape.moveToTop();
			      shape.getLayer().draw();
			       var shape = evt.shape;
              	  var mousePos = instance.getStage().getMousePosition();
		          var x = mousePos.x+5 ;
		          var y = mousePos.y+10;
		          if( instance.config.showLegend)
		          {
		          		instance.drawTooltip(instance.textBox, x, y, Math.round(shape.attrs.data.percent*10000)/100+"%");
		          }
		          else
		          {
		          		instance.drawTooltip(instance.textBox, x, y, shape.attrs.data.title+"\n"+ Math.round(shape.attrs.data.percent*10000)/100+"%");
		          }
		          $("#legend_"+shape.attrs.data.id).css("border","solid black 1px");
        	});
        	this.shapes[i].on("mousemove", function(evt) {
        		  var shape = evt.shape;
              	  var mousePos = instance.getStage().getMousePosition();
		          var x = mousePos.x+5 ;
		          var y = mousePos.y+10;
		          if( instance.config.showLegend)
		          {
		          		instance.drawTooltip(instance.textBox, x, y, Math.round(shape.attrs.data.percent*10000)/100+"%");
		          }
		          else
		          {
		          		instance.drawTooltip(instance.textBox, x, y, shape.attrs.data.title+"\n"+ Math.round(shape.attrs.data.percent*10000)/100+"%");
		          }
		          $("#legend_"+shape.attrs.data.id).css("border","solid black 1px");
            });
        	this.shapes[i].on("mouseout", function(evt) {
	           document.body.style.cursor = "default";
	           var shape = evt.shape;
		       shape.setShadow({
		           		color: "white",
			            blur: 0,
			            offset: [0, 0],
			            alpha: 1
			          });
			   shape.moveDown();
			   instance.textBox.hide();
			   shape.getLayer().draw();
			    $("#legend_"+shape.attrs.data.id).css("border","solid white 1px");
	        });
	        this.shapes[i].on("click", function(evt) {
	        	var shape = evt.shape;
	          	instance.config.onclick.call(this,shape.attrs.data);
	        });
    	}
    },
    getRandomColor:function(){
        var r = Math.floor(Math.random() * 255).toString(16);
        var g = Math.floor(Math.random() * 255).toString(16);
        var b = Math.floor(Math.random() * 255).toString(16);
        r = r.length == 1 ? "0" + r : r;
        g = g.length == 1 ? "0" + g : g;
        b = b.length == 1 ? "0" + b : b;
        return "#" + r + g + b;
	},
	drawTooltip:function(tooltip, x, y, text) {
	  tooltip.setText(text);
	  var maxRight = this.getStage().getWidth()/2;
	  if(x > maxRight) {
	    x = maxRight;
	  }
	  tooltip.setPosition(x, y);
	  tooltip.moveToTop();
	  tooltip.show();
	  tooltip.getLayer().draw();
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
Kinetic.Pie.Background = Kinetic.Class.extend({
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
类名：工具栏
描述：工具栏主类
constructor:
{
    toolbar:{
     	container:'container_toolbar',
     	data:[
	    	{title:'部分一',value:100,color:'#dfdfdf',percent:0.25},
	    	{title:'部分二',value:100},
	    	{title:'部分三',value:100},
	    	{title:'部分四',value:100},
	    	{title:'部分五',value:100},
	    	{title:'部分六',value:100}
	    ]
    }
}
*/
Kinetic.Pie.Toolbar = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
		$("#"+this.config.toolbar.container).html(this.getHtml());
		for(var i=0,n=this.config.toolbar.data.length;i<n;i++)
    	{
    		var data=this.config.toolbar.data[i];
    		var toolkit=new Kinetic.Pie.Toolbar.Toolkit({
    			container:this.config.toolbar.container+'_show',
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
    	var html= "<div id='"+this.config.toolbar.container+"_show' title='图例'>";
    	html+="</div>";
		return html;
    }
});
/**
类名：工具
描述：工具主类
constructor:
{
	container:'container_toolbar',
	{id:0,title:'部分一',value:100,color:'#dfdfdf',percent:0.25}
}
*/
Kinetic.Pie.Toolbar.Toolkit = Kinetic.Class.extend({
	config:null,
	init: function(config) {
		this.config=config;
		var container=$("#"+this.config.container);
    	container.append(this.getHtml());
    },
    getConfig:function(){
    	return this.config;
    },
    getHtml:function(){
    	var text=this.config.data.title;
    	if(text.length>10)
    	{
    		text=text.substring(0,10)+"...";
    	}
    	var html="<div style='margin:2px;'><div id='legend_"+this.config.data.id+"' style='float:left;width:14px;height:14px;border:solid white 1px;background-color:"+this.config.data.color+"' title='"+this.config.data.title+"'></div><span style='margin:2px;'>"+text+"</span></div>";
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
