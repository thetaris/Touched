// DnD frame work
// hand is a reference to the object currently beeing dragged.
var hand= null;

// The screen coordinates of the last drag update.
var startPos;
var startOffset;
var hasMoved= false;
var unselect= false;
var typetext ='';

$(init);
function init() {
    var canvas= $('#canvas');
    $('body').mousemove(msMove);
    $('body').mouseup(msUp);
    $('body').mousedown(function(evt) { 
        if (evt.target.nodeName!="INPUT")
            evt.preventDefault(); 
        });
    canvas.attr('ontouchmove','msMove(event)');
    canvas.attr('ontouchend','msUp(event)');
    canvas.attr('onmousedown','msDown(event)');
    canvas.attr('ontouchstart','msDown(event)');
    $('html').keydown(keyPress);
    canvas.append(dropArea('d3.script|xml.doc|exp.list','start'));
    select(canvas.find('.arg'));
    initMenu();
    updateAll();
}

function updateAll() {
    updateTypes();
    updateMenu();
    typetext ='';
}

function elementArea(type) {
    var elt= $('<div class="box element"/>');
    elt.attr('data-type', type);
    return elt;
}

function textArea(text) {
    var tmp=$('<div class="box-text">');
    tmp.text(text);
    return tmp;
}

function dropArea(type, name) {
    var tmp= $('<div class="box arg"/>');
    tmp.attr('data-name', name);
    tmp.attr('data-type', type);
    tmp.text(name);
    return tmp;
}

function releaseBox(box) {
    var parent= box.parent();
    if (parent.hasClass('arg')) {
        parent.addClass('box');
        parent.text(parent.attr('data-name'));
    }
    box.remove();
}

function insertBox(arg, item) {
    arg.removeClass('box');
    item.removeClass('float');
    arg.contents().replaceWith(item);
}

function select(obj) {
    unselectAll();
    obj.addClass('selected');
}

function unselectAll() {
    $('.selected').removeClass('selected');
}

// Move the selection along one of the following axes:
// 0: up
// 1: down
// 2: left
// 3: right
// 4: select the next selectable value
// 5: select the previous selectable value
function selectNext(obj, axis) {
    //console.log(axis);
    var reverse = axis == 0 || axis ==2 || axis== 5;
    var leftright =axis == 2 || axis == 3 ;
    var updown = axis ==0 || axis==1;
    var selectnext = axis ==4 || axis==5;
    var isup = false;
    var isactive=false;
    
    if(obj.size()>0){
        var topoffset = obj.offset().top;
        var height = obj.height();
    }
    else {
        // no current selection
        isactive=true;
        obj = $('.box:first');
        height =0;
        topoffset = reverse ? 100000000 : 0;
    }
    while (obj.attr('id') != 'canvas') {
        // check if current element should be selected
        if (isactive && obj.hasClass('box')) {
            if (selectnext) {
                if (!isup) {
                    select(obj);
                    return;
                }
            }
            if (updown && !isup) {
                // DOWN
                var isNewLine= obj.find('.box-body').length ==0;
                if (!reverse  && isNewLine && obj.offset().top > topoffset +height) {
                    select(obj);
                    return;
                }
                // UP
                if (reverse  && isNewLine && obj.offset().top < topoffset) {
                    select(obj);
                    return;
                }
            }
            if (leftright && !isup && obj.find('.box').length==0) {
                select(obj);
                return;          
                //find the parent class of obj   
                if (obj.parent().hasClass('box') && $('.selected').get(0) != obj.parent().get(0)) {
                    select(obj.parent());
                    return;
                }
            }
        }
        isactive= true;
        // proceed to next element
        var childs = reverse ? obj.children(':last') : obj.children(':first');  
        if (!isup && !obj.hasClass('float') && childs.length > 0) 
            obj = childs;
        else { 
            var next = reverse ? obj.prev() : obj.next();   
            if (next.length > 0) {
                isup = false;
                obj = next;
            }
            else {
                isup = true;
                obj = obj.parent();
            }
        }
    }
    unselectAll();
}

//keyboard control
function keyPress(evt) {
    //console.log(evt.which);
    if (!submitMenu) {
        if (evt.ctrlKey) {
            if (evt.which == 67)
                //run code for CTRL+C 
                menu_copy();      
            if (evt.which == 86) 
                //run code for CTRL+V
                menu_paste();        
            if (evt.which == 88)    
              //run code for CTRL+X
                menu_delete();
        }
        else if (evt.keyCode > 64 && evt.keyCode < 91) {
            var type = String.fromCharCode(evt.keyCode);
            var menu = $($('#menu').find('li:not(.disabled)'));
            if(menu.find('li').length !=0) menu = menu.find('li');
            typetext = typetext + type;
            var chosen= [];
            for (var i = 0; i < menu.length; i++) {
                var item= $(menu[i]);
                if (typetext == item.text().substring(0, typetext.length).toUpperCase()) {
                    item.html('<span class="menuSelect">' + item.text().substring(0,  typetext.length) + '</span>' + item.text().substring( typetext.length, item.text().length));
                    chosen.push(item);
                }
                else {
                    item.text(menu[i].textContent);
                    item.addClass('disabled');
                }
            }
            if (chosen.length == 0) {
                updateAll();
            }
            else if(chosen.length == 1) {
                evt.preventDefault();
                chosen[0].click();
                typetext = '';
            }
        }
        if(evt.keyCode ==8){
            updateAll();
        }
        if(evt.keyCode == 46)
           menu_delete();
    }
    if (evt.which==9 || evt.which==13)
        // TAB or RETURN
        if (submitMenu) submitMenu();
    if (evt.which==40) {
        //KEY_DOWN
        typetext = '';
        evt.preventDefault();
        var selection= $('.selected');
        selectNext(selection,1);
        updateAll();
    }
    else if(evt.which==9 || evt.which ==13){
        // TAB, Enter
        typetext = '';
        evt.preventDefault();
        var selection= $('.selected');
        selectNext(selection, evt.shiftKey ? 5 : 4);
        updateAll();
    }
    else if (evt.which==38) {
        // KEY_UP
        evt.preventDefault();
        var selection= $('.selected');
        selectNext(selection, 0);
        updateAll();
    }
    else if(evt.which==37){        
        //KEY_LEFT
        evt.preventDefault();
        var selection= $('.selected');
        if (selection.size()>0)
            selectNext(selection, 2);
        updateAll();
    }
    else if(evt.which ==39){
        //KEY_RIGHT
        evt.preventDefault();
        var selection= $('.selected');
        if (selection.size()>0)
            selectNext(selection, 3);
        updateAll();
    }
    else if (evt.which==27) {
        // ESCAPE
        updateAll();
    }
}

// msDown is called whenever the mouse button is pressed anywhere on the root document.
function msDown (event) {
    var evt= translateTouch(event);
    if (hand==null && evt.target!=null) {
        event.preventDefault();
        // find signaling object
        var grabbed= $(evt.target);
        while (!grabbed.hasClass('box')) {
            if (grabbed.attr('id')=='canvas') return;
                grabbed= grabbed.parent();
            }
            hand= grabbed;
        unselect= hand.hasClass('selected');
        if (!unselect) {
            select(hand);
            updateMenu();
        }
        
        // store mouse position. Will be updated when mouse moves.
        startPos= [evt.clientX, evt.clientY];

        hasMoved= false;
        return false;
    }
}

function msMove(event) {
    var evt= translateTouch(event);
    if (hand) {
        event.preventDefault();
        var dx= evt.clientX - startPos[0];
        var dy= evt.clientY - startPos[1];
        if (hasMoved || Math.abs(dx)+Math.abs(dy)>20) {
            if (!hasMoved) {
                while (!hand.hasClass('element')) {
                    if (hand.attr('id')=='canvas') return;
                    hand = hand.parent();
                }
                startOffset= hand.offset();
                if (!hand.hasClass('float')) {
                    if (hand.attr('data-type') == 'ident') {
                        var clone = hand.clone();
                        clone.removeClass('selected');
                        hand.before(clone);
                    }
                    else {
                        releaseBox(hand);
                    }
                    hand.addClass('float');
                    $('#canvas').append(hand);
                    updateAll();
                }
                hand.addClass('dragged');
                hasMoved= true;
            }

            if (hasMoved) {
                var arg= $(evt.target);
                if (arg.hasClass('box') && arg.hasClass('arg') && !arg.parents().is(hand)) {
                    insertBox(arg, hand);
                    updateAll();
                    startPos= [evt.clientX, evt.clientY];
                    hasMoved= false;
                    unselect= false;
                }
            }
            if (hasMoved) {
                hand.offset({
                    top: startOffset.top + dy, 
                    left: startOffset.left + dx
                });
            }
        }
    }
}

function msUp (evt) {
    evt.preventDefault();
    if (hand) {
        hand.removeClass('dragged');
        if (unselect && !hasMoved) {
            hand.removeClass('selected');
            updateMenu();
        }
        hand= null;
    }
    return false;
}

// Translate events that come from touch devices
function translateTouch(evt) {
    if (evt.touches!=undefined) {
        var evt2= {};
        evt2.clientX= evt.touches[0].clientX;
        evt2.clientY= evt.touches[0].clientY;
        evt2.target= document.elementFromPoint(evt2.clientX, evt2.clientY);
        evt2.isTouch= true;
        return evt2;
    }
    evt.preventDefault();
    return evt;
}