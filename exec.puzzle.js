commands.puzzle = {
	game : function(code, output) {
		output.selectAll('*').remove();
		var goal = code.arg('goal').text;
		output.append('div').text("<touchop>");
		if(goal) {
			output.append('div').text("<test domain=" + "\"" + "algebra" + "\"" + " win=" + "\"" + goal + "\"" + "/>");
		}
		code.args('command').forEach(function(cmd, index) {
			var root = output.append('div');
			cmd.call(root, function(data) {
				data.toDOM(root);
			});
		});
		output.append('div').text("</touchop>");
		output.append('script').attr('src', '../puzzle/touchop.js').attr('type', 'text/javascript');
		output.append('script').attr('src', '../puzzle/def.js').attr('type', 'text/javascript');
		output.append('script').attr('src', '../puzzle/algebra.js').attr('type', 'text/javascript');

		//return;
		var xmltext = output[0][0].innerText;
		var parser = new DOMParser();
		var xml = parser.parseFromString(xmltext, 'text/xml');
		var xsltext = loadXMLDoc("../puzzle/touchop.xsl");
		var xsl = parser.parseFromString(xsltext, 'text/xml');
		if( typeof (XSLTProcessor) != "undefined") {
			xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(xsl);
			var resultDocument = xsltProcessor.transformToFragment(xml, document);
			resultDocument = Addtouchedid(resultDocument);
			output[0][0].innerText = "";
			//if there is no menubar, it means open the puzzle in a new tab, so dont need to add the button
			if($('#menubar')[0])
				output[0][0].innerHTML = '<input type="button" id="openindataview" value ="Open in new tab" onclick="openInnewtab()"/>';
			output.node().appendChild(resultDocument);
		} else if( typeof (xml.transformNode) != "undefined") {
			return xml.transformNode(xsl);
		} else {
			try {
				// IE9
				output.append('script').attr('src', '../puzzle/style.css').attr('type', 'text/css');
				output.append('img').attr('src', '../puzzle/frowny.svg').attr('type', 'img');
				output.append('img').attr('src', '../puzzle/smiley.svg').attr('type', 'img');
				if(window.ActiveXObject) {
					var xslt = new ActiveXObject("Msxml2.XSLTemplate.3.0");
					var xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
					xslDoc.async = false;
					xslDoc.load("../puzzle/touchop.xsl");
					xslt.stylesheet = xslDoc;
					var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.3.0");
					xmlDoc.async = false;
					xmlDoc.load(xml);
					var xslProc = xslt.createProcessor();
					xslProc.input = xmlDoc;
					xslProc.transform();
					var res = xslProc.output;
					res = res.replace('<?xml version="1.0" encoding="UTF-16"?>', '<?xml version="1.0"  standalone="no"?>' + '<!DOCTYPE svg PUBLIC ' + '"-//W3C//DTD SVG 1.1//EN"' + " " + '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
					res = res.replace('xmlns:svg="http://www.w3.org/2000/svg"', 'xmlns="http://www.w3.org/2000/svg"')
					var svgDoc = parser.parseFromString(res, 'text/xml');
					output[0][0].innerText = "";
					//var svg = document.importNode(svgDoc.documentElement, true);
					var svg = cloneToDoc(svgDoc.documentElement);
					output.node().appendChild(svg);
				}
			} catch (e) {
				// 4
				alert("The type [XSLTProcessor] and the function [XmlDocument.transformNode] are not supported by this browser, can't transform XML document to HTML string!");
				return null;
			}
		}
		setTimeout(function() {
			initialization()
		}, 300);
	},
	puzzlecmd : {
		op : {
			plus : function(code, output, callback) {
				var x = code.arg('x position').text;
				if(!x)
					x = 10;
				var y = code.arg('y position').text;
				if(!y)
					y = 100;
				data = VizData.text("<op name=" + "\"" + "plus" + "\"" + " xy=" + "\"" + x + "," + y + "\"" + " id=" + "\"" + code.id + "\"" + "/>")
				callback(data);
			},
			minus : function(code, output, callback) {
				var x = code.arg('x position').text;
				if(!x)
					x = 10;
				var y = code.arg('y position').text;
				if(!y)
					y = 100;
				data = VizData.text("<op name=" + "\"" + "minus" + "\"" + " xy=" + "\"" + x + "," + y + "\"" + " id=" + "\"" + code.id + "\"" + "/>")
				callback(data);
			},
			multiply : function(code, output, callback) {
				var x = code.arg('x position').text;
				if(!x)
					x = 10;
				var y = code.arg('y position').text;
				if(!y)
					y = 100;
				data = VizData.text("<op name=" + "\"" + "times" + "\"" + " xy=" + "\"" + x + "," + y + "\"" + " id=" + "\"" + code.id + "\"" + "/>")
				callback(data);
			},
			divide : function(code, output, callback) {
				var x = code.arg('x position').text;
				if(!x)
					x = 10;
				var y = code.arg('y position').text;
				if(!y)
					y = 100;
				data = VizData.text("<op name=" + "\"" + "divide" + "\"" + " xy=" + "\"" + x + "," + y + "\"" + " id=" + "\"" + code.id + "\"" + "/>")
				callback(data);
			},
			power : function(code, output, callback) {
				var x = code.arg('x position').text;
				if(!x)
					x = 10;
				var y = code.arg('y position').text;
				if(!y)
					y = 100;
				data = VizData.text("<op name=" + "\"" + "power" + "\"" + " xy=" + "\"" + x + "," + y + "\"" + " id=" + "\"" + code.id + "\"" + "/>")
				callback(data);
			},
		},
		value : function(code, output, callback) {
			var value = code.arg('value').text;
			var x = code.arg('x position').text;
			if(!x)
				x = 10;
			var y = code.arg('y position').text;
			if(!y)
				y = 100;
			if(value) {
				data = VizData.text("<atom value=" + "\"" + value + "\"" + " xy=" + "\"" + x + "," + y + "\"" + " id=" + "\"" + code.id + "\"" + "/>")
				callback(data);
			}
		}
	},
}

function cloneToDoc(node, doc) {
	if(!doc)
		doc = document;
	var clone = doc.createElementNS(node.namespaceURI, node.nodeName);
	for(var i = 0, len = node.attributes.length; i < len; ++i) {
		var a = node.attributes[i];
		if(/^xmlns\b/.test(a.nodeName))
			continue;
		// IE can't create these
		clone.setAttributeNS(a.namespaceURI, a.nodeName, a.nodeValue);
	}
	for(var i = 0, len = node.childNodes.length; i < len; ++i) {
		var c = node.childNodes[i];
		clone.insertBefore(c.nodeType == 1 ? cloneToDoc(c, doc) : doc.createTextNode(c.nodeValue), null);
	}
	return clone;
}

function Addtouchedid(svgDoc) {
	var children = svgDoc.childNodes[0].childNodes;
	for(var i = 0; i < children.length; i++) {
		if(children[i].nodeName == "g" && children[i].hasAttribute("data-touched-id")) {
			var id = children[i].getAttribute("data-touched-id");
			children[i].childNodes[1].setAttribute("data-touched-id", id);
		}
	}
	return svgDoc;
}