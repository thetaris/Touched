function updateTypes(canvas) {
    canvas.find('.error').removeClass('error');
    applyCoersions(canvas);
    inferChildren(canvas);
}

function applyCoersions(obj, coersion) {
    var mytype= obj.attr('data-type');
    if (obj.is('.arg')) {
	var m= mytype.match(/\[([^>]*)>([^\]]*)\]/);
	if (m) {
	    coersion=[m[1],m[2]];
	}
    }
    obj.children().each(function(i,child) {
	applyCoersions($(child), coersion);
    });
    if (mytype) {
	mytype= mytype.replace(/\|:.*/,'');
	if (coersion && type_isSuper(mytype, coersion[1]))
	    mytype= mytype+'|:'+coersion[0];
	obj.attr('data-type', mytype);
    }
}

function inferChildren(obj, type) {
    obj.children().each(function(i, child) {
	if ($(child).is('.arg'))
	    inferChildren($(child), $(child).attr('data-type'));
	else {
	    var mytype= $(child).attr('data-type');
	    inferChildren($(child), type);
	    if (type && mytype && !type_isSuper(type, mytype)) {
		$(child).addClass('error');
	    }
	}
    });
}

// check if obj is an object of type
function type_isa(obj, type) {
    if (!obj.attr('data-type')) return false;
    return type_isSuper(obj.attr('data-type'), type);
}

// checks if sup is a generalization of sub
function type_isSuper(sup, sub) {
    // console.log (sup + ' <- ' + sub +'?');
    if (sup=='*') return true;
    var supl= sup.split('|');
    var subl= sub.split('|');
    if (supl.length>1) {
	for (var i=0;i<supl.length;i++)
	    if (type_isSuper(supl[i], sub)) return true;
	return false;
    } else if (subl.length>1) {
	for (var i=0;i<subl.length;i++)
	    if (type_isSuper(sup, subl[i])) return true;
	return false;
    } else {
	sup= sup.replace(/\[[^\]]*\]/,'');
	sup= sup.replace(/^:/,'');
	var supc= sup.split('.');
	var subc= sub.split('.');
	while (true) {
            if (supc.length==0) return true;
            if (subc.length==0) return false;
            if (subc.shift()!=supc.shift()) return false;
	}
    }
}

// unify two types
function type_unify(type1, type2) {
    var type='';
    var list1= type1.split('.');
    var list2= type2.split('.');
    while (true) {
	if (list1.length==0 || list1[0]!=list2[0])
	    return type;
	if (type.length>0) type= type+'.';
	type=type+list1[0];
	list1.shift();
	list2.shift();
    }
}
