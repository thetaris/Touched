<?xml version="1.0"?>
<!-- Touchop - Touchable operators -->
<!-- -->
<!-- Copyright(C) 2011, Stefan Dirnstorfer -->
<!-- This software may be copied, distributed and modified under the terms -->
<!-- of the GPL (http://www.gnu.org/licenses/gpl.html) -->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:svg="http://www.w3.org/2000/svg"
		        xmlns:html="http://www.w3.org/1999/xhtml"
		        xmlns:xlink="http://www.w3.org/1999/xlink"
		        xmlns:top="http://www.dadim.de/touchop"
                version="1.0">

<!-- generate the svg main file structure -->
<xsl:template match="touchop">
<svg onmousemove="msMove(evt)"
	 ontouchmove="msMove(evt)"
	 onmouseup="msUp(evt)"
	 ontouchend="msUp(evt)"
	 onmousedown="msBlur(evt)"
	 ontouchstart="msBlur(evt)"
	 width="100%" height="100%"
	 viewBox="0 0 600 400">
  <title>Touchop</title>

  <!-- import the style sheet -->
  <style type="text/css">@import url('../puzzle/style.css');</style>

  <!-- Drag and drop interface -->
  <script type="text/javascript" xlink:href="../puzzle/touchop.js" />
  <script type="text/javascript" xlink:href="../puzzle/def.js" />

  <!-- mobile device settings -->
  <html:meta name="viewport" content="width=device-width, initial-scale=1"/>
  <html:meta name="apple-mobile-web-app-capable" content="yes" />

  <!-- iterate over all xml elements in the source file -->
  <xsl:comment>List of operators</xsl:comment>
  <xsl:for-each select="*">
    <!-- apply operator translation accoring to the xy attribute -->
    <xsl:element name="g">
      <xsl:if test="@xy">
	     <xsl:attribute name="transform">
	        <xsl:copy-of select="concat('translate(',@xy,')')"/>
	     </xsl:attribute>
      </xsl:if>
      <xsl:if test="@id">
	     <xsl:attribute name="data-touched-id">
	        <xsl:copy-of select="concat('',@id,'')"/>
	     </xsl:attribute>
      </xsl:if>
      <!-- find the corresponding definition of that operator -->
      <xsl:apply-templates select="."/>
    </xsl:element>
  </xsl:for-each>

  <!-- The emoticon indicates the winning status and links -->
  <!-- back to the index page -->
  <xsl:comment>Emoticon</xsl:comment>
  <xsl:if test="not(test[@smiley='false'])">
    <g onmousedown="window.history.back()"
	   ontouchstart="window.history.back()"
	   transform="translate(500,20)" >
      <a xlink:href="index.html">
	<g id="top:notwin">
	  <image xlink:href="../puzzle/frowny.svg" 
		     width="81" height="81"/>
	</g>
	<g id="top:win" opacity="0.0">
	  <image xlink:href="../puzzle/smiley.svg" 
		     width="81" height="81"/>
	</g>
      </a>
    </g>
  </xsl:if>
</svg>

</xsl:template>

<!-- Generic drop area for operator arguments -->
<xsl:template name="operand">
  <xsl:comment>Drop area for operands</xsl:comment>
  <g top:layout="snap(obj)" class="operand">
    <rect height="50" width="50" rx="5" ry="5" class="background"/>
    <xsl:apply-templates/>
  </g>
</xsl:template>

<!-- A literal placed on the screen -->
<xsl:template name="literal">
  <xsl:param name="name" select="@value"/>
  <xsl:comment>Literal</xsl:comment>
  <xsl:variable name="len" select="string-length(translate($name,' ',''))"/>
  <xsl:element name="rect">
    <xsl:attribute name="class">background</xsl:attribute>
    <xsl:attribute name="height">60</xsl:attribute>
    <xsl:attribute name="width"><xsl:value-of select="30+30*$len"/></xsl:attribute>
    <xsl:attribute name="x"><xsl:value-of select="-15*$len"/></xsl:attribute>
    <xsl:attribute name="rx">5</xsl:attribute>
    <xsl:attribute name="ry">5</xsl:attribute>
  </xsl:element>
  <xsl:element name="text">
    <xsl:attribute name="transform">translate(15,45)</xsl:attribute>
    <xsl:attribute name="class">atom</xsl:attribute>
    <xsl:value-of select="$name"/>
  </xsl:element>
</xsl:template>

<!-- TouchOp VARIABLE DEFINITION -->
<!-- Operators used for variable definition and use -->
<xsl:template match="def">
  <xsl:comment>Variable definition</xsl:comment>
  <!-- variable definition is identified by def-@name -->
  <xsl:element name="g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="id">def-<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:attribute name="transform">scale(0.91)</xsl:attribute>
    <xsl:attribute name="top:def"><xsl:value-of select="@name"/></xsl:attribute>
    <xsl:attribute name="top:drop">none</xsl:attribute>
    <xsl:attribute name="top:layout">horizontalLayout(obj); validateDef(obj)</xsl:attribute>

    <!-- assignment operation -->
    <rect class="background" rx="5" ry="5"/>
    <text><xsl:value-of select="@name"/>=</text>
    <xsl:call-template name="operand"/>
  </xsl:element>
</xsl:template>

<!-- variable usage -->
<xsl:template match="use">
    <xsl:element name="g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="top:use"><xsl:value-of select="@name"/></xsl:attribute>
    
    <!-- insert background and text -->
    <xsl:call-template name="literal">
      <xsl:with-param name="name" select="@name"/>
    </xsl:call-template>
  </xsl:element>
</xsl:template>

<!-- TouchOp ALGEBRA DOMAIN -->
<!-- Special operators for the algebra domain -->

<!-- construct the text element for the winning task -->
<xsl:template match="test[@domain='algebra']">
  <xsl:comment>Winning test for the algebra domain</xsl:comment>
  <script type="text/javascript" xlink:href="../puzzle/algebra.js"/>
  <g transform="translate(50,60)">
    <xsl:element name="text">
      <xsl:attribute name="id">test</xsl:attribute>
      <xsl:copy-of select="@win"/>
      <!-- if no text is provided set default -->
      <xsl:if test="not(text())">
	<xsl:value-of select="concat(@win,' = ?')"/>
      </xsl:if>
      <!-- set the provided test text -->
      <xsl:if test="text()">
	<xsl:value-of select="text()"/>
      </xsl:if>
    </xsl:element>
  </g>
</xsl:template>

<!-- power operator -->
<xsl:template match="op[@name='power']">
  <xsl:comment>Power operator</xsl:comment>
  <g onmousedown="msDown(evt)"
	   top:value="Math.pow(#1, #2)"
	   top:priority="91"
	   top:layout="horizontalLayout(obj)">
      
    <rect class="background" rx="5" ry="5"/>
    <xsl:call-template name="operand"/>
    <g top:priority="80">
      <rect y="50" width="1" height="1" style="opacity:0.0"/>
      <g transform="scale(0.6), translate(0,-50)">
	<xsl:call-template name="operand"/>
      </g>
    </g>
  </g>
</xsl:template>

<!-- Multiplication operator -->
<xsl:template match="op[@name='times']">
  <xsl:comment>Multiplication operator</xsl:comment>
  <g onmousedown="msDown(evt)"
	 top:value="#1 * #2"
	 top:priority="100"
	 top:layout="horizontalLayout(obj)">

    <rect class="background" rx="5" ry="5"/>
    <xsl:call-template name="operand"/>
    <text>&#215;</text>
    <xsl:call-template name="operand"/>
  </g>
</xsl:template>

<!-- Division operator -->
<xsl:template match="op[@name='divide']">
  <xsl:comment>Division operator</xsl:comment>
  <g onmousedown="msDown(evt)"
     top:value="#1 / #2"
     top:priority="99"
     top:layout="verticalLayout(obj)">

    <rect class="background" rx="5" ry="5"/>
    <g transform="scale(0.8)" top:priority="100">
      <xsl:call-template name="operand"/>
    </g>
    <rect width="80" height="3" top:layoutOpt="stretch"/>
    <g transform="scale(0.8)" top:priority="100">
      <xsl:call-template name="operand"/>
    </g>
  </g>
</xsl:template>

<xsl:template match="op[@name='plus']">
  <xsl:comment>Addition operator</xsl:comment>
  <g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="120"
     top:value="#1 + #2">

    <rect class="background" rx="5" ry="5"/>
    <xsl:call-template name="operand"/>
    <text>+</text>
    <xsl:call-template name="operand"/>
  </g>
</xsl:template>

<!-- substraction operator -->
<xsl:template match="op[@name='minus']">
  <xsl:comment>Substraction operator</xsl:comment>
  <g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="111"
     top:value="#1 - #2">

    <rect class="background" rx="5" ry="5"/>
    <g top:priority="110">
      <xsl:call-template name="operand"/>
    </g>
    <text>&#8211;</text>
    <xsl:call-template name="operand"/>
  </g>
</xsl:template>

<!-- substraction operator -->
<xsl:template match="func">
  <xsl:comment>Substraction operator</xsl:comment>
  <g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="0">

    <rect class="background" rx="5" ry="5"/>
    <text transform="scale(0.71,1)"><xsl:value-of select="@name"/></text>
    <xsl:element name="g">
      <xsl:attribute name="top:priority">10</xsl:attribute>
      <xsl:attribute name="top:value">
	<xsl:value-of select="concat('Math.',@name,'(#1)')"/>
      </xsl:attribute>
      <xsl:call-template name="operand"/>
    </xsl:element>
  </g>
</xsl:template>

<xsl:template match="atom">
  <xsl:comment>Atomic element</xsl:comment>
  <xsl:element name="g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="top:value"><xsl:value-of select="@value"/></xsl:attribute>
    <xsl:attribute name="top:priority"><xsl:value-of select="@priority"/></xsl:attribute>
    <xsl:attribute name="top:play">500</xsl:attribute>
    <xsl:call-template name="literal"/>
  </xsl:element>
</xsl:template>

<!-- TouchOp FUNCTION PLOTTING -->
<!-- Special operators for the function plotting domain -->

<!-- Import the verify function for the plotting domain -->
<xsl:template match="test[@domain='plot']">
  <xsl:comment>Create formulas according to a reference plot</xsl:comment>
  <script type="text/javascript" xlink:href="../puzzle/plot.js"/>
</xsl:template>

<!-- Create a canvas for the plotted graph -->
<xsl:template match="canvas">
  <xsl:comment>Plotting canvas</xsl:comment>
  <clipPath id="canvasClip"><use xlink:href="#canvasFrame"/></clipPath>
  <xsl:element name="rect">
    <xsl:attribute name="id">canvasFrame</xsl:attribute>
    <xsl:attribute name="class">canvas</xsl:attribute>
    <xsl:attribute name="height"><xsl:value-of select="@size"/></xsl:attribute>
    <xsl:attribute name="width"><xsl:value-of select="@size"/></xsl:attribute>
  </xsl:element>
  <xsl:element name="g">
    <xsl:attribute name="id">canvas</xsl:attribute>
    <xsl:attribute name="clip-path">url(#canvasClip)</xsl:attribute>
    <xsl:attribute name="top:plot"><xsl:value-of select="@plot"/></xsl:attribute>
    <xsl:attribute name="top:size"><xsl:value-of select="@size"/></xsl:attribute>
    <xsl:attribute name="top:xmin"><xsl:value-of select="@xmin"/></xsl:attribute>
    <xsl:attribute name="top:ymin"><xsl:value-of select="@ymin"/></xsl:attribute>
    <xsl:attribute name="top:xmax"><xsl:value-of select="@xmax"/></xsl:attribute>
    <xsl:attribute name="top:ymax"><xsl:value-of select="@ymax"/></xsl:attribute>
    <xsl:variable name="xscale" select="@size div (@xmax - @xmin)"/>
    <xsl:variable name="yscale" select="@size div (@ymax - @ymin)"/>
    <xsl:for-each select="point">
      <xsl:element name="circle">
	<xsl:attribute name="class">graph</xsl:attribute>
	<xsl:attribute name="r">4</xsl:attribute>
	<xsl:attribute name="cx">
	  <xsl:value-of select="(@x - ../@xmin)*$xscale"/>
	</xsl:attribute>
	<xsl:attribute name="cy">
	  <xsl:value-of select="(../@ymax - @y)*$yscale"/>
	</xsl:attribute>
	<xsl:attribute name="top:x"><xsl:value-of select="@x"/></xsl:attribute>
	<xsl:attribute name="top:y"><xsl:value-of select="@y"/></xsl:attribute>
      </xsl:element>
    </xsl:for-each>
    <xsl:if test="turtle">
      <xsl:element name="g">
	<xsl:attribute name="transform">
	  <xsl:text>translate(</xsl:text>
	  <xsl:value-of select="(0 - @xmin) div (@xmax - @xmin) * @size"/>
	  <xsl:text>,</xsl:text>
	  <xsl:value-of select="(@ymax - 0) div (@ymax - @ymin) * @size"/>
	  <xsl:text>)</xsl:text>
	  <xsl:text> rotate(-90)</xsl:text>
	</xsl:attribute>
	<path id="turtle" d="M 0,-5 l 12,5, -12,5 Z"/>
      </xsl:element>
    </xsl:if>
    <path id="plotpath"/>
  </xsl:element>

  <!-- compute grid resolution -->
  <xsl:variable name="yres">
    <xsl:call-template name="resolution">
      <xsl:with-param name="span" select="@ymax - @ymin"/>
    </xsl:call-template>
  </xsl:variable>
  <!-- call grid creation -->
  <xsl:call-template name="ygrid">
    <xsl:with-param name="pos" select="ceiling(@ymin div $yres) * $yres"/>
    <xsl:with-param name="res" select="$yres"/>
  </xsl:call-template>

  <!-- compute grid resolution -->
  <xsl:variable name="xres">
    <xsl:call-template name="resolution">
      <xsl:with-param name="span" select="@xmax - @xmin"/>
    </xsl:call-template>
  </xsl:variable>
  <!-- call grid creation -->
  <xsl:call-template name="xgrid">
    <xsl:with-param name="pos" select="ceiling(@xmin div $xres) * $xres"/>
    <xsl:with-param name="res" select="$xres"/>
  </xsl:call-template>
</xsl:template>

<!-- find resolution for the canvas grid -->
<xsl:template name="resolution">
  <xsl:param name="span"/>
  <xsl:choose>
    <xsl:when test="$span &lt; 2.1">0.5</xsl:when>
    <xsl:when test="$span &lt; 11">1</xsl:when>
    <xsl:when test="$span &lt; 41">5</xsl:when>
    <xsl:otherwise>10</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- render horizontal grid lines -->
<xsl:template name="ygrid">
  <xsl:param name="pos"/>
  <xsl:param name="res"/>
  <xsl:if test="$pos &lt;= @ymax">
    <xsl:variable name="y" select="(@ymax - $pos) * @size div (@ymax - @ymin)"/>
    <xsl:element name="path">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="d">
	<xsl:value-of select="concat('M ',@size,',',$y,' L -10,',$y)"/>
      </xsl:attribute>
    </xsl:element>
    <xsl:element name="text">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="$y + 5"/></xsl:attribute>
      <xsl:attribute name="x">-20</xsl:attribute>
      <xsl:value-of select="$pos"/>
    </xsl:element>
    <xsl:call-template name="ygrid">
      <xsl:with-param name="pos" select="$pos+$res"/>
      <xsl:with-param name="res" select="$res"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<!-- render vertical grid lines -->
<xsl:template name="xgrid">
  <xsl:param name="pos"/>
  <xsl:param name="res"/>
  <xsl:if test="$pos &lt;= @xmax">
    <xsl:variable name="x" select="($pos - @xmin) * @size div (@xmax - @xmin)"/>
    <xsl:element name="path">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="d">
	<xsl:value-of select="concat('M ',$x,',0 L ',$x,',',@size+10)"/>
      </xsl:attribute>
    </xsl:element>
    <xsl:element name="text">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="@size + 25"/></xsl:attribute>
      <xsl:attribute name="x"><xsl:value-of select="$x"/></xsl:attribute>
      <xsl:value-of select="$pos"/>
    </xsl:element>
    <xsl:call-template name="xgrid">
      <xsl:with-param name="pos" select="$pos+$res"/>
      <xsl:with-param name="res" select="$res"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<!-- TouchOp TURTLE GRAPHICS -->
<!-- Special operators for turtle graphics -->

<!-- Import the verify function for the plotting domain -->
<xsl:template match="test[@domain='turtle']">
  <xsl:comment>Move a turtle to specified goal</xsl:comment>
  <script type="text/javascript" xlink:href="../puzzle/turtle.js"/>
  <defs>
    <path id="half-right" class="move"
	      d="m 47,32 -7,-7 c 0,0 -5,2 -6,6 -1,4 0,15 0,15 0,3 -4,6 -8,6 l -4,0 C 16,52 14,49 14,46 13,37 12,27 20,21 l 7,-5 -7,-7 c 1,0 28,0 28,0 L 47,32 z"/>
    <path id="turn-left" class="move"
	      d="M 55,25 l -15,15 0,-8 c 0,0 0,0 -2,0 l -8,0 0,14 c 0,3 -3,6 -6,6 l -3,0 c -4,0 -6,-3 -6,-6 l 0,-23 c 0,-3 2,-6 6,-6 l 3,0 c 0,0 1,0 1,0 l 14,0 c 1,0 1,0 1,0 l 0,-7 15,15 z"/>
    <g id="turn-right"> 
      <use xlink:href="#turn-left" transform="matrix(-1,0,0,1,60,0)"/>
    </g>
    <g id="move-shrink"> 
      <use xlink:href="#move-forward" opacity="0.6"/>
      <use xlink:href="#move-forward" transform="matrix(0.5,0,0,0.5,15,20)"/>
    </g>
    <path id="move-forward" class="move"
	      d="m 30,11 -15,15 8,0 c 0,0 0,0 0,2 0,0 -5,9 -6,14 0,1 0,3 0,3 0,4 3,6 6,6 l 15,0 c 3,0 6,-2 6,-6 0,0 0,-2 0,-3 -1,-5 -6,-15 -6,-15 0,-1 0,-1 0,-1 l 7,0 z"/>
    <path id="flag" class="move"
	      d="M 1,30 L 7,0 L 8,0 L 8,2 C 8,2 11,0 16,4 C 21,6 20,9 22,15 C 25,21 28,20 28,20 C 28,20 25,25 19,23 C 14,21 12,14 5,18 L 3,31 L 1,30 z"/>
    <path id="arrow" class="move"
	      d="M 0,0 L 18,0 M 18,0 L 14,-4 M 14,4 L 18,0"/>
  </defs>  
</xsl:template>

<xsl:template match="program">
  <xsl:element name="g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="class">program</xsl:attribute>
    <xsl:attribute name="top:name"><xsl:value-of select="@name"/></xsl:attribute>
    <xsl:attribute name="top:repeat"><xsl:value-of select="@repeat"/></xsl:attribute>
    <xsl:if test="not(@def)">
      <xsl:attribute name="top:layout">horizontalLayout(obj)</xsl:attribute>
    </xsl:if>
    <xsl:if test="@def">
      <xsl:attribute name="id">def-<xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="transform">scale(0.91)</xsl:attribute>
      <xsl:attribute name="top:def"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="top:drop">none</xsl:attribute>
      <xsl:attribute name="top:layout">verticalLayout(obj)</xsl:attribute>
    </xsl:if>

    <rect class="background" rx="5" ry="5"/>
    <xsl:if test="@name">
      <text>
	<xsl:value-of select="@name"/>
	<xsl:if test="@def">=</xsl:if>
      </text>
    </xsl:if>
    <xsl:if test="push">
      <g top:value="push()">
	<use xlink:href="#flag" class="background"/>
	<use xlink:href="#arrow" class="background" transform="translate(8,30)"/>
      </g>
    </xsl:if>
    <g top:layout="verticalLayout(obj)">
      <rect class="background" display="none"/>
      <xsl:for-each select="step">
	<xsl:call-template name="operand"/>
      </xsl:for-each>
    </g>
    <xsl:if test="pop">
      <g top:value="pop()">
	<use xlink:href="#flag" class="background"/>
	<use xlink:href="#arrow" class="background" 
		 transform="scale(-1,1) translate(-26,30)"/>
      </g>
    </xsl:if>
  </xsl:element>
</xsl:template>

<xsl:template match="move">
  <xsl:element name="g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="top:value">m=m.<xsl:value-of select="@value"/></xsl:attribute>
    <rect class="background" rx="5" ry="5" height="60" width="60"/>
    <xsl:element name="use">
      <xsl:attribute name="xlink:href"><xsl:value-of select="@img"/></xsl:attribute>
    </xsl:element>
  </xsl:element>
</xsl:template>

<!-- TOUCHOP - IMAGE PROCESSING DOMAIN -->
<!-- Special operators for image processing and image synthesis -->
<xsl:template match="test[@domain='image']">
  <xsl:comment>Image processing</xsl:comment>
  <script type="text/javascript" xlink:href="../puzzle/image.js"/>
  <g transform="translate(10,10)">
    <xsl:element name="image">
      <xsl:attribute name="id">test</xsl:attribute>
      <xsl:attribute name="top:test"><xsl:value-of select="@exp"/></xsl:attribute>
      <xsl:attribute name="width">70</xsl:attribute>
      <xsl:attribute name="height">70</xsl:attribute>
      <xsl:attribute name="xlink:href">
	<xsl:value-of select="@win"/>
      </xsl:attribute>
    </xsl:element>
    <rect width="70" height="70" fill="none" stroke="black" stroke-width="1"/>
    <text y="50" x="85">= ?</text>
  </g>
</xsl:template>

<!-- SVG filter object -->
<xsl:template match="image">
  <g onmousedown="msDown(evt)"
	 class="image"
	 top:padding="7"
	 top:layout="updateFilter(obj);horizontalLayout(obj)">

    <!-- background image -->
    <rect class="background" rx="5" ry="5"/>

    <!-- filter area -->
    <xsl:element name="filter">
      <xsl:attribute name="x">0</xsl:attribute>
      <xsl:attribute name="y">0</xsl:attribute>
      <xsl:attribute name="width">100%</xsl:attribute>
      <xsl:attribute name="height">100%</xsl:attribute>
      <xsl:attribute name="id">
	<xsl:value-of select="generate-id()"/>
      </xsl:attribute>
      <!-- short cut for the feImage filter -->
      <xsl:if test="@src">
	<xsl:element name="feImage">
	  <xsl:attribute name="xlink:href">
	    <xsl:value-of select="@src"/>
	  </xsl:attribute>
	</xsl:element>
      </xsl:if>
      <!-- copy filter elements to the svg name space -->
      <xsl:call-template name="toSVG"/>
    </xsl:element>

    <!-- argument number -->
    <xsl:variable name="args" select="*//@*[starts-with(.,'arg')]"/>

    <!-- filter name -->
    <xsl:if test="@name">
      <g>
	<text transform="rotate(-90)"><xsl:value-of select="@name"/></text>
      </g>
    </xsl:if>

    <!-- create drop areas for arguments -->
    <xsl:if test="$args">
      <g top:layout="verticalLayout(obj)">
	<rect class="background" display="none"/>
	<xsl:for-each select="$args">
	  <g top:layout="layerLayout(obj)">
	    <xsl:call-template name="operand"/>
	  </g>
	</xsl:for-each>
      </g>
    </xsl:if>

    <!-- apply the result filter to an empty region -->
    <xsl:element name="rect">
      <xsl:if test="$args">
	<xsl:attribute name="display">none</xsl:attribute>
      </xsl:if>
      <xsl:attribute name="transform">scale(0.5)</xsl:attribute>
      <xsl:attribute name="filter">
	<xsl:value-of select="concat('url(#',generate-id(),')')"/>
      </xsl:attribute>
      <xsl:attribute name="width">140</xsl:attribute>
      <xsl:attribute name="height">140</xsl:attribute>
    </xsl:element>

  </g>
</xsl:template>

<xsl:template name="toSVG">
  <xsl:for-each select="*">
    <xsl:element name="{concat('',name())}">
      <xsl:copy-of select="@*"/>
      <xsl:call-template name="toSVG"/>
    </xsl:element>
  </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
