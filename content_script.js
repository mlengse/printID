console.log('di dalam content');
var url = chrome.runtime.getURL('print_16x16.png'); 
var al;
var empt;
if($('#label2PDF').length == 0 ){
	if($('button.cancel').length){
		$('button.cancel').after('<button id=label2PDF onclick="return false;" style="padding: 4px 5px 5px 30px; background: url(' + url + ') white no-repeat 5px 6px; border: 1px solid #B2B2B2;  -webkit-border-radius : 4px; -moz-border-radius : 4px; border-radius: 4px; position: relative; top: 2px; margin: 0 0 0 2px;">Cetak Label</button><iframe name="dinda"></iframe>');
	} else if($('#tgllahir').length) {
		$('a.back').after('<button id=label2PDF onclick="return false;" style="margin : 10px 0 0 10px; padding : 5px 5px 5px 30px; border : 1px solid #ddd; -webkit-border-radius : 4px; background : url(' + url + ') no-repeat center left; font: 11px/14px verdana, geneva, sans-serif;">Cetak Label</button><iframe name="dinda"></iframe>');
	}
	
}

$("#label2PDF").bind('click', function(){
	if($('#sex').val().length){
		pasienTglLahir = $('#tgllahir').val();
		pasienUmur = pasienUm();
		if (pasienUmur == "error" ){
			if(al == undefined){
				alert("tanggal lahir salah");
				al++;
			}
			$('#tgllahir').focus();
		} else {
			noRM = $('#patient_id').val().toUpperCase();
			svg = drawBarcode("svg", noRM, {
				type: 'Code 128'
			});
			noRM = noRM.substr(0,6);
			pasienSex = $('#sex').val();
			pasienJK = $('#jk > option[value="' + pasienSex + '"]').text();

			alamat = $('#alamat').val();
			jamKode = $('#typepatient').val();
			jaminan = $('#jenispasien > option[value="' + jamKode + '"]').text();

			pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;
			pusk = pusk();

			$.CreateTemplate("inches",2.91339,1.29921,0.0787402,0.0787402,2.3622,1.1811,1,1,0.2,0.05);
			
			if($('#VisitNama').length){
				pasienNama = $('#VisitNama').val();
				pasienKK = $('#VisitNamaKk').val();

			}else{
				pasienNama = $('#namapasien').val();
				pasienKK = $('#nama_kk').val();
			}	
			$(svg).find('rect').map(function(){ 
				$x = $(this).attr('x');
				strX = 0.2 + ($x*0.004481);
				strY = 0.85;
				$width = $(this).attr('width');
				strW = ($width*0.004481);
				strH = 0.45;
				$.AddRect(strX, strY, strW, strH);
			});
			$.AddText(1.55,0.05,noRM,16);
			$.AddText(0.2,0.7,pasienNama,10);
			$.AddText(0.2,0.55,pasien,8);
			$.AddText(0.2,0.4,pasienKK,8);
			$.AddText(0.2,0.25,alamat,8);
			$.AddText(0.2,0.1,pusk,8);
			$.DrawPDF();
		}
		function pusk(){
			if(jaminan){
				pusk = "PKM Jayengan " + jaminan;
			}else{
				pusk = "PKM Jayengan";
			}
			return pusk;
		}

		function pasienUm() {
			tanggalSplit = $('#tgllahir').val().split('-');
			dateBirth = new Date(tanggalSplit[2]+ "-" + tanggalSplit[1] + "-" + tanggalSplit[0]);
			dateNow = new Date();
			pasienThn = -1;
			while ( dateNow > dateBirth ) {
			  dateNow = new Date( dateNow.setFullYear( dateNow.getFullYear() - 1 ) );
			  pasienThn++;
			}
			dateNow = new Date( dateNow.setFullYear( dateNow.getFullYear() + 1 ) );
			pasienBln = -1;
			while ( dateNow > dateBirth ) {
			  dateNow = new Date( dateNow.setMonth( dateNow.getMonth() - 1 ) );
			  pasienBln++;
			}
			dateNow = new Date( dateNow.setMonth( dateNow.getMonth() + 1 ) );
			pasienHr = -1;
			while ( dateNow > dateBirth ) {
			  dateNow = new Date( dateNow.setDate( dateNow.getDate() - 1 ) );
			  pasienHr++;
			}
				
			if (pasienThn > 0){
				return pasienThn + " thn.";
			} else if (pasienBln > 0){
				return pasienBln + " bln.";
			} else if (pasienHr > 0) {
				return pasienHr + " hr.";
			} else {
				return "error";
			}
		};
	} else if(empt == undefined){
		$('#patient_id').focus();
		alert('data register masih kosong');
		empt++;
	} else {
		$('#patient_id').focus();
	}
});