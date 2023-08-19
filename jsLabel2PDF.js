/*
 * html5marketplace
 *
 * Copyright (c) 2011 html5marketplace.com (http://html5marketplace.com/GPL-LICENSE.txt)
 * Licensed under the GPL (GPL-LICENSE.txt) licenses.
 *
 * http://www.html5marketplace.com
 *
 */

  ;(function($) {
        /*
    $.fn.DrawPDF = function(options) {
      var opts = $.extend({}, $.fn.DrawPDF.defaults, options);
      return this.each(function() {
        $(this).text(DrawPDFLabel(opts.units,
                  opts.paperWidth,
                  opts.paperHeight,
                  opts.marginLeft,
                  opts.marginTop,
                  opts.labelWidth,
                  opts.labelHeight,
                  opts.numRows,
                  opts.numColumns,
                     opts.horizontalSpace,
                  opts.verticalSpace));	
      });
    };
    */
    var pdfoutput = '';
    var streamoutput = '';
    var objCounter = 0; 
    var byteArry = new Array(); 
    var rect = new Array();
    var rectCounter = 0;
    var pageCounter = 0;
    var pageNumbersArry = new Array();
    var fontCounter = 0;
    var fontNumbersArry = new Array();
    var pagesNumber = 0;
    var numberOfFonts = 1;  
    var numberOfPages=1;
    var outlinesNumber = 0;
    var resourcesNumber = 0;
    var catalogNumber = 0;
    var xobjectNumber = 0; //deprecated
    var xobjectNumbersArry = new Array();
        var xobjectRows = 0;
        var xobjectColumns = 0;

    var _units="inches";
        var _paperWidth=8.268;
        var _paperHeight=11.693;
        var _marginLeft=0.3815;
        var _marginTop=0.5965;
        var _labelWidth=2.5;
        var _labelHeight=1.5;
        var _numRows=7;
        var _numColumns=3;
        var _horizontalSpace=0.0;
        var _verticalSpace=0.0;
    
        //A4
        //var pageWidth = 210;
        //var pageHeight = 297;
        //Letter
        //var pageWidth = 612;
        //var pageHeight = 792;

        var _paperWidthPt = 0;
        var _paperHeightPt = 0;
        var _marginLeftPt = 0;
        var _marginTopPt = 0;
        var _labelWidthPt = 0;
        var _labelHeightPt = 0;
        var _horizontalSpacePt=0.0;
        var _verticalSpacePt=0.0;
        var _rectArry = new Array();
        var _rectXArry = new Array();
        var _rectYArry = new Array();
        var _rectWArry = new Array();
        var _rectHArry = new Array();
        var _textArry = new Array();
        var _textXArry = new Array();
        var _textYArry = new Array();
        var _fontSizeArry = new Array();
        var _textCounter = 0;
    var _rectCounter = 0;
    var _svgCounter = 0;


    $.CreateTemplate = function(units, paperWidth, paperHeight, marginLeft, marginTop, labelWidth, labelHeight, numRows, numColumns, horizontalSpace, verticalSpace){
      _units =units;
      _paperWidth = paperWidth;
      _paperHeight = paperHeight;
      _marginLeft = marginLeft;
      _marginTop = marginTop;
      _labelWidth = labelWidth;
      _labelHeight = labelHeight;
      _numRows = numRows;
      _numColumns = numColumns;
      _horizontalSpace = horizontalSpace;
      _verticalSpace = verticalSpace;
            
      if (units="inches") {
        _paperWidthPt = paperWidth * (72);
        _paperHeightPt = paperHeight * (72);
        _marginLeftPt = marginLeft * (72);
        _marginTopPt = marginTop * (72);
        _labelWidthPt = labelWidth * (72);
        _labelHeightPt = labelHeight * (72);
                _horizontalSpacePt=horizontalSpace * (72);
                _verticalSpacePt= verticalSpace*(72);
      } else if (units="mm") {
        _paperWidthPt = paperWidth * (72/25.4);
        _paperHeightPt = paperHeight * (72/25.4);
        _marginLeftPt = marginLeft * (72/25.4);
        _marginTopPt = marginTop * (72/25.4);
        _labelWidthPt = labelWidth * (72/25.4);
        _labelHeightPt = labelHeight * (72/25.4);
        _horizontalSpacePt=horizontalSpace * (72/25.4);
        _verticalSpacePt= verticalSpace*(72/25.4);
      }
    }
        
    $.CreateLabel = function(){
            
    }
    
    $.AddRect = function(x, y, w, h){
      if (units="inches") {				
        _rectXArry[_rectCounter]=x*72;
        _rectYArry[_rectCounter]=y*72;
        _rectWArry[_rectCounter]=w*72;
        _rectHArry[_rectCounter]=h*72;
 
      } else if (units="mm") {
        _rectXArry[_rectCounter]=x*(72/25.4);
        _rectYArry[_rectCounter]=y*(72/25.4);
        _rectWArry[_rectCounter]=w*(72/25.4);
        _rectHArry[_rectCounter]=h*(72/25.4);
      }
      _rectCounter = _rectCounter + 1;
    }

    $.AddText = function(x,y,str,fontSize) {
  if (units="inches")
  {
            _textXArry[_textCounter]=x*72;
            _textYArry[_textCounter]=y*72;

  }
  else if (units="mm")
  {
            _textXArry[_textCounter]=x*(72/25.4);
            _textYArry[_textCounter]=y*(72/25.4);
  }
        _textArry[_textCounter]='';
        _textArry[_textCounter] = _textArry[_textCounter]+str;
        _fontSizeArry[_textCounter] = fontSize;
        _textCounter = _textCounter + 1;
    }
    
    $.DrawPDF = function(frame) {
      let url = ''
      // $(`iframe[name="${frame}"]`).hide()
      // window.close(url, frame);

      // pdfoutput = ''


      setupVersion();
      setupFonts();
      setupXObject();
      setupResources();
            //execute the xobjects do
      setupPage();
      setupPages();
      setupOutlines();
      setupCatalog();
      setupTrailer();

      //console.log(pdfoutput);
      url = 'data:application/pdf;base64,' + Base64.encode(pdfoutput);
      //document.location.href = 'data:application/pdf;base64,' + Base64.encode(pdfoutput);
      //window.open(a,'_blank');
      //exist = window.location.href.indexOf(url);
      //console.log(exist);
      //if(exist < 0) {
      //var win = 
      window.open(url, frame);
      // $(`iframe[name="${frame}"]`).attr( 'src', function ( i, val ) { return val; });
      // document.getElementsByName(frame).contentWindow.reload()
      $(`iframe[name="${frame}"]`).attr("src", $(`iframe[name="${frame}"]`).attr("src"));
      $(`iframe[name="${frame}"]`).show()
      //window.frames["dinda"].focus(); //if (win) { win.frames["dinda"].print(); }
      //window.frames["dinda"].print(); //if (win) { win.frames["dinda"].print(); }
        //window.open(url,'_blank');
        //console.log(window.location.href.indexOf(url));
      //}
        
    };

    function setupVersion() {
      pdfoutput = pdfoutput+'%PDF-1.4' + '\n';
      return "";
    }

    function setupCatalog() {
      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      catalogNumber = objCounter;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
      pdfoutput = pdfoutput+'<< /Type /Catalog' + '\n';
      pdfoutput = pdfoutput+'/Outlines '+outlinesNumber+' 0 R' + '\n';
      pdfoutput = pdfoutput+'/Pages ' + pagesNumber + ' 0 R' + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'endobj' + '\n';
      return "";
    }

    function setupOutlines() {
      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      outlinesNumber = objCounter;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
      pdfoutput = pdfoutput+'<< /Type Outlines' + '\n';
      pdfoutput = pdfoutput+'/Count 0' + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'endobj' + '\n';
      return "";
    }

    function setupPages() {
      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      pagesNumber=objCounter;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
      pdfoutput = pdfoutput+'<< /Type /Pages' + '\n';
      pdfoutput = pdfoutput+'/Kids ['+'\n';
      for (var x=1;x<=numberOfPages;x++) {
         pdfoutput = pdfoutput + pageNumbersArry[x] + ' 0 R' + '\n';
      }
      pdfoutput = pdfoutput + ']' + '\n';
      pdfoutput = pdfoutput+'/Count ' + numberOfPages + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'endobj' + '\n';
      return "";
    }

    function setupPage() {

      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      pageCounter=pageCounter+1;
      pageNumbersArry[pageCounter]=objCounter;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
      pdfoutput = pdfoutput+'<< /Type /Page' + '\n';
      pdfoutput = pdfoutput+'/Parent '+ (objCounter+2*numberOfPages) +' 0 R' + '\n';
      pdfoutput = pdfoutput+'/MediaBox [0 0 ' + _paperWidthPt + ' ' + _paperHeightPt + ']' + '\n';
      pdfoutput = pdfoutput+'/Contents '+(objCounter+1)+' 0 R' + '\n';
      pdfoutput = pdfoutput+'/Resources ' + resourcesNumber + ' 0 R' + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'endobj' + '\n';
      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
      streamoutput='';
      for (var y=0;y<_numRows;y++) {		
        for (var x=0;x<_numColumns;x++) {		
          streamoutput = streamoutput+'/lm' + y + x + ' Do' + '\n';
        }
      }	
      pdfoutput = pdfoutput+'<< /Length ' + streamoutput.length + ' >>' + '\n';
      pdfoutput = pdfoutput+'stream'  + '\n';
      pdfoutput = pdfoutput+streamoutput;
      pdfoutput = pdfoutput+'endstream'  + '\n';
      pdfoutput = pdfoutput+'endobj' + '\n';

      return "";
    }

    function setupFonts() {

      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      fontCounter = fontCounter + 1;
      fontNumbersArry[fontCounter] = objCounter;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
      pdfoutput = pdfoutput+'<< /Type /Font' + '\n';
      pdfoutput = pdfoutput+'/BaseFont /Helvetica' + '\n';
      pdfoutput = pdfoutput+'/Subtype /Type1' + '\n';
      pdfoutput = pdfoutput+'/Encoding /WinAnsiEncoding' + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'endobj' + '\n';
      return "";

    }


    function setupXObject() {

      var xobjectRows = _numRows;
            
      xobjectNumbersArry = new Array(xobjectRows);
      var xobjectColumns = _numColumns;
      for (var y=0;y<xobjectRows;y++) {
        xobjectNumbersArry[y] = new Array(xobjectColumns);
            
        for (var x=0;x<xobjectColumns;x++) {
          objCounter=objCounter+1;
          byteArry[objCounter]=pdfoutput.length;
          xobjectNumbersArry[y][x] = objCounter;
          pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';
/*
          streamoutput= '';
          streamoutput = streamoutput + '0 0 m'+'\n';
          streamoutput = streamoutput + '0 '+_labelHeightPt+' l'+'\n';
          streamoutput = streamoutput + _labelWidthPt+' '+_labelHeightPt+' l'+'\n';
          streamoutput = streamoutput + _labelWidthPt+' 0 l'+'\n';
          streamoutput = streamoutput + '0 0 l'+'\n';
          streamoutput = streamoutput + 'S'+'\n';
  */				
          for (var v=0;v<_rectCounter;v++) {
            streamoutput = streamoutput + _rectXArry[v]+ ' ' + _rectYArry[v]+ ' ' + _rectWArry[v] + ' ' + _rectHArry[v] + ' re F' + '\n';
          }

          for (var z=0;z<_textCounter;z++) {
            streamoutput = streamoutput + 'BT /XF1 '+ _fontSizeArry[z] +' Tf ET'+'\n';
            streamoutput = streamoutput + 'BT '+_textXArry[z]+' '+_textYArry[z]+' Td ('+_textArry[z]+') Tj ET'+'\n';
          }
          
          pdfoutput = pdfoutput+'<< /Type /XObject'  + '\n';
          pdfoutput = pdfoutput+'/Subtype /Form'  + '\n';
          pdfoutput = pdfoutput+'/FormType 1'  + '\n';
          pdfoutput = pdfoutput+'/BBox [0 0 '+ _labelWidthPt + ' ' + _labelHeightPt + ']'  + '\n';
          pdfoutput = pdfoutput+'/Matrix [1 0 0 1 '+ (_marginLeftPt + x*_labelWidthPt + x*_horizontalSpacePt) + ' '+ (_paperHeightPt - _marginTopPt - ((y+1)*_labelHeightPt) - y*_verticalSpacePt) +']'  + '\n';
          pdfoutput = pdfoutput+'/Resources << /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]'  + '\n';
          
          pdfoutput = pdfoutput+'/Font <<' + '\n';
          for (var m=1;m<=numberOfFonts;m++) {		
            pdfoutput = pdfoutput+'/XF1 ' + fontNumbersArry[m] + ' 0 R' + '\n';		
          }
          pdfoutput = pdfoutput +'>>'+'\n';
          pdfoutput = pdfoutput +'>>'+'\n'; //resources
          
          pdfoutput = pdfoutput+'/Length ' + streamoutput.length + ' >>' + '\n';
          pdfoutput = pdfoutput+'stream'  + '\n';
          pdfoutput = pdfoutput+streamoutput;
          pdfoutput = pdfoutput+'endstream'  + '\n';
          pdfoutput = pdfoutput+'endobj' + '\n';
        }
      } 
            
    }

    function setupResources() {

      objCounter=objCounter+1;
      byteArry[objCounter]=pdfoutput.length;
      resourcesNumber = objCounter;
      pdfoutput = pdfoutput+objCounter+' 0 obj' + '\n';	
      pdfoutput = pdfoutput+'<<' + '\n';	
      pdfoutput = pdfoutput+'/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]' + '\n';
      pdfoutput = pdfoutput+'/Font <<' + '\n';
      for (var x=1;x<=numberOfFonts;x++) {		
        pdfoutput = pdfoutput+'/F1 ' + fontNumbersArry[x] + ' 0 R' + '\n';		
      }
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'/XObject <<' + '\n';
      for (var y=0;y<_numRows;y++) {		
        for (var x=0;x<_numColumns;x++) {		
          pdfoutput = pdfoutput+'/lm' + y + x + ' ' + xobjectNumbersArry[y][x] + ' 0 R' + '\n';
        }
      }	
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';	
  
      pdfoutput = pdfoutput+'endobj' + '\n';
      return "";
    }

    function setupTrailer() {
      var startxrefStr='';
      startxrefStr=startxrefStr+pdfoutput.length;
      pdfoutput = pdfoutput+'xref' + '\n';

      var objCounterStr='';
      objCounterStr=objCounterStr+(objCounter+1);
      pdfoutput = pdfoutput+'0 ' + objCounterStr + '\n';
      pdfoutput = pdfoutput+'0000000000 65535 f' + '\n';

      for (var x=1; x <= objCounter; x++) {
        pdfoutput = pdfoutput+sprintf('%010d 00000 n ', byteArry[x]) +'\n';
      }

      pdfoutput = pdfoutput+'trailer' + '\n';
      pdfoutput = pdfoutput+'<< /Size ' + objCounterStr + '\n';
      pdfoutput = pdfoutput+'/Root '+catalogNumber+' 0 R' + '\n';
      pdfoutput = pdfoutput+'>>' + '\n';
      pdfoutput = pdfoutput+'startxref' + '\n';
      pdfoutput = pdfoutput+startxrefStr + '\n';
      pdfoutput = pdfoutput+'%%EOF' + '\n';
      return "";

    }

        /*
    function DrawPDFLabel(units,
          paperWidth,
          paperHeight,
          marginLeft,
          marginTop,
          labelWidth,
          labelHeight,
          numRows,
          numColumns,
          horizontalSpace,
          verticalSpace)
    {	
      return "";
    }

    $.fn.DrawPDF.defaults = {
      units : "inches",
      paperWidth : 8.268,
      paperHeight : 11.693,	
      marginLeft : 0.3815,
      marginTop : 0.5965,
      labelWidth : 2.5,
      labelHeight : 1.5,
      numRows : 7,
      numColumns : 3,
      horizontalSpace : 0.0,
      verticalSpace : 0.0
    };
        */
  })(jQuery);
