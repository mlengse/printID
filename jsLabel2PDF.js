
; (function ($) {
  let pdfoutput = '';
  let streamoutput = '';
  let objCounter = 0;
  const byteArry = new Array();
  let pageCounter = 0;
  const pageNumbersArry = new Array();
  let fontCounter = 0;
  const fontNumbersArry = new Array();
  let pagesNumber = 0;
  const numberOfFonts = 1;
  const numberOfPages = 1;
  let outlinesNumber = 0;
  let resourcesNumber = 0;
  let catalogNumber = 0;
  let xobjectNumbersArry = new Array();

  let _units = "inches";
  let _numRows = 7;
  let _numColumns = 3;


  let _paperWidthPt = 0;
  let _paperHeightPt = 0;
  let _marginLeftPt = 0;
  let _marginTopPt = 0;
  let _labelWidthPt = 0;
  let _labelHeightPt = 0;
  let _horizontalSpacePt = 0.0;
  let _verticalSpacePt = 0.0;
  const _rectXArry = new Array();
  const _rectYArry = new Array();
  const _rectWArry = new Array();
  const _rectHArry = new Array();
  const _textArry = new Array();
  const _textXArry = new Array();
  const _textYArry = new Array();
  const _fontSizeArry = new Array();
  let _textCounter = 0;
  let _rectCounter = 0;

  $.CreateTemplate = function (units, paperWidth, paperHeight, marginLeft, marginTop, labelWidth, labelHeight, numRows, numColumns, horizontalSpace, verticalSpace) {
    _units = units;
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

    if (_units === "inches") {
      _paperWidthPt = paperWidth * (72);
      _paperHeightPt = paperHeight * (72);
      _marginLeftPt = marginLeft * (72);
      _marginTopPt = marginTop * (72);
      _labelWidthPt = labelWidth * (72);
      _labelHeightPt = labelHeight * (72);
      _horizontalSpacePt = horizontalSpace * (72);
      _verticalSpacePt = verticalSpace * (72);
    } else if (_units === "mm") {
      _paperWidthPt = paperWidth * (72 / 25.4);
      _paperHeightPt = paperHeight * (72 / 25.4);
      _marginLeftPt = marginLeft * (72 / 25.4);
      _marginTopPt = marginTop * (72 / 25.4);
      _labelWidthPt = labelWidth * (72 / 25.4);
      _labelHeightPt = labelHeight * (72 / 25.4);
      _horizontalSpacePt = horizontalSpace * (72 / 25.4);
      _verticalSpacePt = verticalSpace * (72 / 25.4);
    }
  }

  $.CreateLabel = function () {

  }

  $.AddRect = function (x, y, w, h) {
    if (_units === "inches") {
      _rectXArry[_rectCounter] = x * 72;
      _rectYArry[_rectCounter] = y * 72;
      _rectWArry[_rectCounter] = w * 72;
      _rectHArry[_rectCounter] = h * 72;

    } else if (_units === "mm") {
      _rectXArry[_rectCounter] = x * (72 / 25.4);
      _rectYArry[_rectCounter] = y * (72 / 25.4);
      _rectWArry[_rectCounter] = w * (72 / 25.4);
      _rectHArry[_rectCounter] = h * (72 / 25.4);
    }
    _rectCounter = _rectCounter + 1;
  }

  $.AddText = function (x, y, str, fontSize) {
    if (_units === "inches") {
      _textXArry[_textCounter] = x * 72;
      _textYArry[_textCounter] = y * 72;

    }
    else if (_units === "mm") {
      _textXArry[_textCounter] = x * (72 / 25.4);
      _textYArry[_textCounter] = y * (72 / 25.4);
    }
    _textArry[_textCounter] = '';
    _textArry[_textCounter] = _textArry[_textCounter] + str;
    _fontSizeArry[_textCounter] = fontSize;
    _textCounter = _textCounter + 1;
  }

  $.DrawPDF = function (frame) {
    let url = ''


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
    window.open(url, frame);
    $(`iframe[name="${frame}"]`).attr("src", $(`iframe[name="${frame}"]`).attr("src"));
    $(`iframe[name="${frame}"]`).show()
  };

  function setupVersion() {
    pdfoutput = pdfoutput + '%PDF-1.4' + '\n';
    return "";
  }

  function setupCatalog() {
    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    catalogNumber = objCounter;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    pdfoutput = pdfoutput + '<< /Type /Catalog' + '\n';
    pdfoutput = pdfoutput + '/Outlines ' + outlinesNumber + ' 0 R' + '\n';
    pdfoutput = pdfoutput + '/Pages ' + pagesNumber + ' 0 R' + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + 'endobj' + '\n';
    return "";
  }

  function setupOutlines() {
    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    outlinesNumber = objCounter;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    pdfoutput = pdfoutput + '<< /Type Outlines' + '\n';
    pdfoutput = pdfoutput + '/Count 0' + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + 'endobj' + '\n';
    return "";
  }

  function setupPages() {
    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    pagesNumber = objCounter;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    pdfoutput = pdfoutput + '<< /Type /Pages' + '\n';
    pdfoutput = pdfoutput + '/Kids [' + '\n';
    for (let x = 1; x <= numberOfPages; x++) {
      pdfoutput = pdfoutput + pageNumbersArry[x] + ' 0 R' + '\n';
    }
    pdfoutput = pdfoutput + ']' + '\n';
    pdfoutput = pdfoutput + '/Count ' + numberOfPages + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + 'endobj' + '\n';
    return "";
  }

  function setupPage() {

    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    pageCounter = pageCounter + 1;
    pageNumbersArry[pageCounter] = objCounter;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    pdfoutput = pdfoutput + '<< /Type /Page' + '\n';
    pdfoutput = pdfoutput + '/Parent ' + (objCounter + 2 * numberOfPages) + ' 0 R' + '\n';
    pdfoutput = pdfoutput + '/MediaBox [0 0 ' + _paperWidthPt + ' ' + _paperHeightPt + ']' + '\n';
    pdfoutput = pdfoutput + '/Contents ' + (objCounter + 1) + ' 0 R' + '\n';
    pdfoutput = pdfoutput + '/Resources ' + resourcesNumber + ' 0 R' + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + 'endobj' + '\n';
    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    streamoutput = '';
    for (let y = 0; y < _numRows; y++) {
      for (let x = 0; x < _numColumns; x++) {
        streamoutput = streamoutput + '/lm' + y + x + ' Do' + '\n';
      }
    }
    pdfoutput = pdfoutput + '<< /Length ' + streamoutput.length + ' >>' + '\n';
    pdfoutput = pdfoutput + 'stream' + '\n';
    pdfoutput = pdfoutput + streamoutput;
    pdfoutput = pdfoutput + 'endstream' + '\n';
    pdfoutput = pdfoutput + 'endobj' + '\n';

    return "";
  }

  function setupFonts() {

    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    fontCounter = fontCounter + 1;
    fontNumbersArry[fontCounter] = objCounter;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    pdfoutput = pdfoutput + '<< /Type /Font' + '\n';
    pdfoutput = pdfoutput + '/BaseFont /Helvetica' + '\n';
    pdfoutput = pdfoutput + '/Subtype /Type1' + '\n';
    pdfoutput = pdfoutput + '/Encoding /WinAnsiEncoding' + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + 'endobj' + '\n';
    return "";

  }


  function setupXObject() {

    const xobjectRows = _numRows;

    xobjectNumbersArry = new Array(xobjectRows);
    const xobjectColumns = _numColumns;
    for (let y = 0; y < xobjectRows; y++) {
      xobjectNumbersArry[y] = new Array(xobjectColumns);

      for (let x = 0; x < xobjectColumns; x++) {
        objCounter = objCounter + 1;
        byteArry[objCounter] = pdfoutput.length;
        xobjectNumbersArry[y][x] = objCounter;
        pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
        for (let v = 0; v < _rectCounter; v++) {
          streamoutput = streamoutput + _rectXArry[v] + ' ' + _rectYArry[v] + ' ' + _rectWArry[v] + ' ' + _rectHArry[v] + ' re F' + '\n';
        }

        for (let z = 0; z < _textCounter; z++) {
          streamoutput = streamoutput + 'BT /XF1 ' + _fontSizeArry[z] + ' Tf ET' + '\n';
          streamoutput = streamoutput + 'BT ' + _textXArry[z] + ' ' + _textYArry[z] + ' Td (' + _textArry[z] + ') Tj ET' + '\n';
        }

        pdfoutput = pdfoutput + '<< /Type /XObject' + '\n';
        pdfoutput = pdfoutput + '/Subtype /Form' + '\n';
        pdfoutput = pdfoutput + '/FormType 1' + '\n';
        pdfoutput = pdfoutput + '/BBox [0 0 ' + _labelWidthPt + ' ' + _labelHeightPt + ']' + '\n';
        pdfoutput = pdfoutput + '/Matrix [1 0 0 1 ' + (_marginLeftPt + x * _labelWidthPt + x * _horizontalSpacePt) + ' ' + (_paperHeightPt - _marginTopPt - ((y + 1) * _labelHeightPt) - y * _verticalSpacePt) + ']' + '\n';
        pdfoutput = pdfoutput + '/Resources << /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]' + '\n';

        pdfoutput = pdfoutput + '/Font <<' + '\n';
        for (let m = 1; m <= numberOfFonts; m++) {
          pdfoutput = pdfoutput + '/XF1 ' + fontNumbersArry[m] + ' 0 R' + '\n';
        }
        pdfoutput = pdfoutput + '>>' + '\n';
        pdfoutput = pdfoutput + '>>' + '\n'; //resources

        pdfoutput = pdfoutput + '/Length ' + streamoutput.length + ' >>' + '\n';
        pdfoutput = pdfoutput + 'stream' + '\n';
        pdfoutput = pdfoutput + streamoutput;
        pdfoutput = pdfoutput + 'endstream' + '\n';
        pdfoutput = pdfoutput + 'endobj' + '\n';
      }
    }

  }

  function setupResources() {

    objCounter = objCounter + 1;
    byteArry[objCounter] = pdfoutput.length;
    resourcesNumber = objCounter;
    pdfoutput = pdfoutput + objCounter + ' 0 obj' + '\n';
    pdfoutput = pdfoutput + '<<' + '\n';
    pdfoutput = pdfoutput + '/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]' + '\n';
    pdfoutput = pdfoutput + '/Font <<' + '\n';
    for (let m = 1; m <= numberOfFonts; m++) {
      pdfoutput = pdfoutput + '/F1 ' + fontNumbersArry[m] + ' 0 R' + '\n';
    }
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + '/XObject <<' + '\n';
    for (let y = 0; y < _numRows; y++) {
      for (let xobj = 0; xobj < _numColumns; xobj++) {
        pdfoutput = pdfoutput + '/lm' + y + xobj + ' ' + xobjectNumbersArry[y][xobj] + ' 0 R' + '\n';
      }
    }
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';

    pdfoutput = pdfoutput + 'endobj' + '\n';
    return "";
  }

  function setupTrailer() {
    let startxrefStr = '';
    startxrefStr = startxrefStr + pdfoutput.length;
    pdfoutput = pdfoutput + 'xref' + '\n';

    let objCounterStr = '';
    objCounterStr = objCounterStr + (objCounter + 1);
    pdfoutput = pdfoutput + '0 ' + objCounterStr + '\n';
    pdfoutput = pdfoutput + '0000000000 65535 f' + '\n';

    for (let x = 1; x <= objCounter; x++) {
      pdfoutput = pdfoutput + sprintf('%010d 00000 n ', byteArry[x]) + '\n';
    }

    pdfoutput = pdfoutput + 'trailer' + '\n';
    pdfoutput = pdfoutput + '<< /Size ' + objCounterStr + '\n';
    pdfoutput = pdfoutput + '/Root ' + catalogNumber + ' 0 R' + '\n';
    pdfoutput = pdfoutput + '>>' + '\n';
    pdfoutput = pdfoutput + 'startxref' + '\n';
    pdfoutput = pdfoutput + startxrefStr + '\n';
    pdfoutput = pdfoutput + '%%EOF' + '\n';
    return "";

  }
})(jQuery);
