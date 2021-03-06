// implement the viz grammar
commands.viz = {
	script : function(code, output) {
		output.selectAll('*').remove();
		code.args('command').forEach(function(cmd) {
			var root = output.append('div');
			cmd.call(root, function(data) {
				data.toDOM(root);
			});
		});
	},
	valueof : {
		col : function(code, data, callback) {
			var col = parseInt(code.arg("column").text);
			if(col) {
				if(!isNaN(data.row[col - 1]))
					callback(parseFloat(data.row[col - 1]));
				else
					callback(data.row[col - 1]);
			} else
				callback();
		},
		previous : function(code, data, callback) {
			var initval = parseInt(code.arg("start").text);
			var value = data.oldvalue();
			if(value)
				callback(value);
			else
				callback(initval);
		},
		index : function(code, data, callback) {
			//console.log(data.index);
			callback(data.index);
		},
		element : function(code, data, callback) {
			getNum(code.arg('row'), data, function(result) {
				var col = parseInt(code.arg('col').text);
				if(data.all[result - 1])
					callback(data.all[result-1][col - 1]);
				else
					callback();
			});
		}
	},

	cmd : {
		data : function(code, output, callback) {
			var url = code.arg('src').text;
			if(url) {
				if(url.match(/^http:/))
					url = "/redirect/" + encodeURI(url);
				d3.text(url, function(data) {
					if(!data)
						code.arg('src').error("Could not read file");
					else {
						data = VizData.text(data);
						code.fold('filter', data, callback);
					}
				});
			}
		},
		Yahoodata : function(code, output, callback) {
			$(document).ready(function() {
				var src = code.arg('stock').text;
				var numdays = code.arg('numdays').text;
				if(src && numdays) {
					var date = new Date();
					var endd = date.getDate();
					var endm = date.getMonth() + 1;
					var endy = date.getFullYear();
					date.setDate(date.getDate() - numdays);
					var strd = date.getDate();
					var strm = date.getMonth() + 1;
					var stry = date.getFullYear();
					var yurl = "/redirect/http://ichart.finance.yahoo.com/table.csv?s=" + src + "&d=" + (endm - 1) + "&e=" + endd + "&f=" + endy + "&g=d&a=" + (strm - 1) + "&b=" + strd + "&c=" + stry + "&ignore=.csv"
					d3.text(yurl, function(data) {
						if(data == null)
							code.arg('stock').error("stock name is not correct");
						else {
							data = VizData.text(data);
							code.fold('filter', data, callback);
						}
					})
				}
			});
		}
	},
	filter : {
		text : {
			replace : function(code, data, callback) {
				var regex = code.arg('regex').text;
				var value = code.arg('to').text || '?';
				if(regex) {
					var reg = new RegExp(regex, "g");
					data.text = data.text.split('\n').map(function(x) {
						return x.replace(reg, value);
					}).join('\n');
					//data.text = data.text.replace(new RegExp(regex, "g"), value);
				}
				callback(data);
			},
			csv : function(code, data, callback) {
				var csv = d3.csv.parseRows(data.text);
				data = VizData.matrix(csv);
				code.fold('filter', data, callback);
			},
			json : function(code, data, callback) {
				var parsedjson = eval('(' + data.text + ')');
				data = VizData.json(parsedjson);
				code.fold('filter', data, callback);
			},
			match : function(code, data, callback) {
				var lines = getRange(code.arg('lines'));
				if(lines) {
					var lineArray = data.text.split('\n');
					data.text = lineArray.filter(function(d, i) {
						if(lines.contains(i + 1)) {
							var subData = new VizData.text(lineArray[i]);
							code.fold('filter', subData, function(d) {
								lineArray[i] = d.text;
							});
						}
					});
					data.text = lineArray.join('\n');
					callback(data);
				}
			}
		},
		matrix : {
			transpose : function(code, data, callback) {
				data.matrix = transpose(data.matrix);
				callback(data)
			},
			sort : function(code, data, callback) {
				var column = code.arg('column').text;
				if(column) {
					column = parseInt(column);
					data.matrix.sort(function(a, b) {
						return a[column - 1] - b[column - 1];
					});
				}
				callback(data);
			},
			rmcols : function(code, data, callback) {
				var range = getRange(code.arg('cols'));
				if(range) {
					data.matrix = data.matrix.map(function(row, i) {
						return row.filter(function(ele, i) {
							return !range.contains(i + 1);
						});
					});
				}
				callback(data);
			},
			selcols : function(code, data, callback) {
				var range = getRange(code.arg('cols'));
				if(range) {
					data.matrix = data.matrix.map(function(row, i) {
						return row.filter(function(ele, i) {
							return range.contains(i + 1);
						});
					});
				}
				callback(data);
			},
			rmrows : function(code, data, callback) {
				var range = getRange(code.arg('rows'));
				if(range) {
					data.matrix = data.matrix.filter(function(ele, i) {
						return !range.contains(i + 1);
					});
				}
				callback(data);
			},
			selrows : function(code, data, callback) {
				var range = getRange(code.arg('rows'));
				if(range) {
					data.matrix = data.matrix.filter(function(ele, i) {
						return range.contains(i + 1);
					});
				}
				callback(data);
			},
			selectcolumnbyvalue : function(code, data, callback) {
				var rownumber = parseFloat(code.arg('rownumber').text);
				var range = getRange(code.arg('value'));
				if(range && rownumber) {
					data.matrix = transpose(data.matrix);
					data.matrix = data.matrix.filter(function(ele, index) {
						return range.contains(ele[rownumber - 1]);
					});
					data.matrix = transpose(data.matrix);
				}
				callback(data);
			},
			removecolumnbyvalue : function(code, data, callback) {
				var rownumber = parseFloat(code.arg('rownumber').text);
				var range = getRange(code.arg('value'));
				if(range && rownumber) {
					data.matrix = transpose(data.matrix);
					data.matrix = data.matrix.filter(function(ele, index) {
						return !range.contains(ele[rownumber - 1]);
					});
					data.matrix = transpose(data.matrix);
				}
				callback(data);
			},
			lineplot : function(code, data, callback) {
				data = VizData.lineplot(data.matrix);
				code.fold('option', data, callback);
			},
			histogram : function(code, data, callback) {
				data = VizData.histogram(data.matrix);
				code.fold('option', data, callback);
			},
			insert : function(code, data, callback) {
				if(code.arg('math').isValid) {
					var column = parseInt(code.arg('col').text) || 1;
					var count = data.matrix.length;
					var i = 0;
					/*
					 for(var i = 0; i < data.matrix.length; i++) {(function(row) {
					 getNum(code.arg('math'), data.matrix[row], function(result) {
					 //console.log(result);
					 data.matrix[row].splice(column - 1, 0, result);
					 if(!--count)
					 callback(data);
					 });
					 })(i);
					 }*/
					function seq() {
						getNum(code.arg('math'), {
							row : data.matrix[i],
							oldvalue : function() {
								if(i == 0)
									return undefined;
								else {
									if(!isNaN(data.matrix[i-1][column - 1]))
										return parseFloat(data.matrix[i-1][column - 1]);
									else
										return 0;
								}
							},
							index : i + 1,
							all : data.matrix,
						}, function(result) {
							//console.log(result);
							data.matrix[i].splice(column - 1, 0, result);
							increaseTimeStep();
						});
					}

					function increaseTimeStep() {
						i++;
						//console.log(i);
						if(i < data.matrix.length)
							if((i % 100) == 0)
								setTimeout(seq, 0);
							else
								seq();
						else
							callback(data);
					}

					seq();
				} else
					callback(data);
			}
		},
		json : {
			subfield : function(code, data, callback) {
				var fieldname = code.arg('fieldname').text;
				if(fieldname)
					data.json = data.json[fieldname];
				callback(data);
			},
			elt : function(code, data, callback) {
				var index = code.arg('index').text;
				if(index)
					data.json = data.json[index];
				callback(data);
			},
			tomatrix : function(code, data, callback) {
				data = VizData.matrix(data.json);
				code.fold('filter', data, callback);
			}
		}
	},
	plotoption : {
		general : {
			size : function(code, data, callback) {
				var width = parseFloat(code.arg('width').text);
				if(width)
					data.options.size[0] = width;
				var height = parseFloat(code.arg('height').text);
				if(height)
					data.options.size[1] = height;
				callback(data);
			}
		},
		lineplot : {
			xaxis : function(code, data, callback) {
				var colnum = code.arg('column').text;
				if(colnum) {
					data.options.xaxis = data.matrix[colnum - 1];
					data.matrix.splice(colnum - 1, 1);
				}
				callback(data);
			},
			timexaxis : function(code, data, callback) {
				if(!data.options.xaxis) {
					code.error('no xaxis defined')
				} else {
					var format = code.arg('format').text;
					if(format) {
						data.options.timexaxis = format;
					}
				}
				callback(data);
			},
			circle : function(code, data, callback) {
				var circlesize = code.arg('circlesize').text;
				if(circlesize)
					data.options.circlesize = circlesize;
				callback(data);
			},
			linewidth : function(code, data, callback) {
				var linewidth = code.arg('linewidth').text;
				if(linewidth)
					data.options.linewidth = linewidth;
				callback(data);
			}
		},
		histogram : {
			bandwidth : function(code, data, callback) {
				var bandwidth = code.arg('bandwidth').text;
				if(bandwidth)
					data.options.bandwidth = bandwidth;
				callback(data);
			},
			bins : function(code, data, callback) {
				var bins = code.arg('bins').text;
				if(bins)
					data.options.bins = parseFloat(bins);
				callback(data);
			}
		}
	}
};

var VizData = {
	text : function(text) {
		return {
			text : text,
			toDOM : function(output) {
				output.append('pre').text(this.text);
			}
		}
	},
	matrix : function(matrix) {
		return {
			matrix : matrix,
			toDOM : function(output) {
				output.append("table").selectAll("tr").data(this.matrix).enter().append("tr").selectAll("td").data(function(row) {
					return row;
				}).enter().append("td").text(function(d) {
					return d;
				})
			}
		}
	},
	json : function(data) {
		return {
			json : data,
			toDOM : function(output) {
				plotJSON(output.append('ul'), this.json);
			}
		}
	},
	lineplot : function(matrix) {
		return {
			matrix : matrix,
			options : {
				size : [0, 0],
				xaxis : undefined,
				timexaxis : undefined,
				circlesize : 3.5,
				linewidth : 2
			},
			toDOM : function(output) {
				if(this.options.size[0] == 0 || this.options.size[1] == 0) {
					var tmp = d3.select('#dataview')[0][0];
					this.options.size[0] = tmp.offsetWidth;
					this.options.size[1] = (tmp.offsetWidth * 2) / 3;
				}
				plot(output, getData(this.matrix, this.options.xaxis, this.options.timexaxis), this.options.size, this.options.timexaxis, this.options.circlesize, this.options.linewidth);
			}
		}
	},
	histogram : function(matrix) {
		return {
			matrix : matrix,
			options : {
				size : [0, 0],
				bins : 100,
				bandwidth : 5
			},
			toDOM : function(output) {
				if(this.options.size[0] == 0 || this.options.size[1] == 0) {
					var tmp = d3.select('#dataview')[0][0];
					this.options.size[0] = tmp.offsetWidth;
					this.options.size[1] = (tmp.offsetWidth * 2) / 3;
				}
				draw_histogram(output, getHistogramData(this.matrix), this.options.size, this.options.bins, this.options.bandwidth);
			}
		}

	}
}

function plotJSON(output, data) {
	output.selectAll("li").data(getKeys(data)).enter().append('li').append('span').text(function(d) {
		if(data[d] instanceof Object)
			return d;
		else
			return d + " : " + data[d].toString();
	}).on("click", function(d) {
		var parent = d3.select(this.parentNode)
		if(parent.select("ul").empty()) {
			plotJSON(parent.append("ul"), data[d]);
		} else
			parent.select("ul").remove();
	});
}

function getKeys(obj) {
	var keys = [];
	if( obj instanceof Object)
		for(var key in obj) {
			keys.push(key);
		}
	return keys;
};

function loadXMLDoc(dname) {
	var xmlhttp;
	if(window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else if(window.ActiveXObject) {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("GET", dname, false);
	//xmlhttp.setRequestHeader('Content-Type', 'text/xml');
	xmlhttp.send();
	//console.log(xmlhttp.responseText);
	return xmlhttp.responseText;
}