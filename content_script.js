if($('#label2PDF').length == 0 ){
  let al;
  let empt;
  // let jaminan;
  let el;
   
  if($('#obat2').length){
    el = 'obat2'
  } else if($('#add_drug').length) {
    el = 'add_drug'
  }

  function getPusk(jaminan){
    if(jaminan){
      return "PKM Jayengan " + jaminan;
    }
    return "PKM Jayengan";
  }

  function pasienUm() {
    let tanggalSplit = $('#tgllahir').val().split('-');
    let dateBirth = new Date(tanggalSplit[2]+ "-" + tanggalSplit[1] + "-" + tanggalSplit[0]);
    let dateNow = new Date();
    let pasienThn = -1;
    while ( dateNow > dateBirth ) {
      dateNow = new Date( dateNow.setFullYear( dateNow.getFullYear() - 1 ) );
      pasienThn++;
    }
    dateNow = new Date( dateNow.setFullYear( dateNow.getFullYear() + 1 ) );
    let pasienBln = -1;
    while ( dateNow > dateBirth ) {
      dateNow = new Date( dateNow.setMonth( dateNow.getMonth() - 1 ) );
      pasienBln++;
    }
    dateNow = new Date( dateNow.setMonth( dateNow.getMonth() + 1 ) );
    let pasienHr = -1;
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

  if($('button.cancel').length){
    $('button.cancel').after('<button id=label2PDF onclick="return false;" style="padding: 4px 5px 5px 30px; background: url(' + chrome.runtime.getURL('print_16x16.png') + ') white no-repeat 5px 6px; border: 1px solid #B2B2B2;  -webkit-border-radius : 4px; -moz-border-radius : 4px; border-radius: 4px; position: relative; top: 2px; margin: 0 0 0 2px;">Cetak Label</button><iframe name="labelframe" style="display: none;" width="400" height="300"></iframe>');
  } else if($('#idSimpan').length){
    $('#idSimpan').after('<button id=label2PDF onclick="return false;" style="padding: 4px 5px 5px 30px; background: url(' + chrome.runtime.getURL('print_16x16.png') + ') white no-repeat 5px 6px; border: 1px solid #B2B2B2;  -webkit-border-radius : 4px; -moz-border-radius : 4px; border-radius: 4px; position: relative; top: 2px; margin: 0 0 0 2px;">Cetak Label</button><iframe name="labelframe" style="display: none;" width="400" height="300"></iframe>');
  } else if($('a.back').length) {
    $('a.back').after('<button id=label2PDF onclick="return false;" style="margin : 10px 0 0 10px; padding : 5px 5px 5px 30px; border : 1px solid #ddd; -webkit-border-radius : 4px; background : url(' + chrome.runtime.getURL('print_16x16.png') + ') no-repeat center left; font: 11px/14px verdana, geneva, sans-serif;">Cetak Label</button><iframe name="labelframe" style="display: none;" width="400" height="300"></iframe>');
  }

  $("#label2PDF").bind('click', function(){
    // if($('#'))

    let dataPasienArr = []
    let dataPasien = {}
    let pasienTglLahir, nik, pasienUmur, noRM, pasienSex, pasienJK, alamat, jamKode, jaminan, pasien, pusk, pasienNama, pasienKK, svg, noA;

    if(!!document.querySelector('#content > div.divkiri > fieldset.fd150 > div.divkiri')){
      dataPasienArr = [...document.querySelector('#content > div.divkiri > fieldset.fd150 > div.divkiri').querySelectorAll('div')]
      dataPasien = {
        rm: dataPasienArr[0].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[1].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[2].querySelector('b').textContent.trim(),
        nama: dataPasienArr[3].querySelector('b').textContent.trim(),
        kk: dataPasienArr[4].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[5].querySelector('b').textContent.trim(),
        jk: dataPasienArr[6].querySelector('b').textContent.trim(),
        desa: dataPasienArr[7].querySelector('b').textContent.trim(),
        tglLahir: dataPasienArr[8].querySelector('b').textContent.trim(),
        umur: dataPasienArr[9].querySelector('b').textContent.trim(),
        jp: 'PKM Jayengan ' + dataPasienArr[10].querySelector('b').textContent.trim(),
      }




      // dataPasien.rm = dataPasien.rm.substring(0,7);
      // console.log(dataPasien.rm)

      pasienTglLahir = dataPasien.tglLahir
      nik = dataPasien.nik
      noA = dataPasien.rm.substr(7,2)
      noRM = dataPasien.rm.substring(0,7)
      // console.log(noRM)
      pasienJK = dataPasien.jk
      alamat = dataPasien.alamat
      jaminan = dataPasien.jp
      pasienUmur = dataPasien.umur
      pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;
      pasienNama = dataPasien.nama
      pasienKK = dataPasien.kk
      pusk = dataPasien.jp
      empt = true

      // console.log(dataPasien)
    }

    let pasienEl = '#content > div.divkiri > fieldset.fd150'
    if(el === 'obat2'){
      pasienEl = pasienEl + ' > div.divkiri'
    }

    dataPasienArr = [...document.querySelector(pasienEl).querySelectorAll('div')]

    if(el === 'obat2'){
      dataPasien = {
        rm: dataPasienArr[0].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[1].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[2].querySelector('b').textContent.trim(),
        nama: dataPasienArr[3].querySelector('b').textContent.trim(),
        kk: dataPasienArr[4].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[5].querySelector('b').textContent.trim(),
        jk: dataPasienArr[6].querySelector('b').textContent.trim(),
        desa: dataPasienArr[7].querySelector('b').textContent.trim(),
        tglLahir: dataPasienArr[8].querySelector('b').textContent.trim(),
        umur: dataPasienArr[9].querySelector('b').textContent.trim(),
        jp: 'PKM Jayengan ' + dataPasienArr[10].querySelector('b').textContent.trim(),
      }
      pasienTglLahir = dataPasien.tglLahir
      nik = dataPasien.nik
      noA = dataPasien.rm.substr(7,2)
      noRM = dataPasien.rm.substring(0,7)
      // console.log(noRM)
      pasienJK = dataPasien.jk
      alamat = dataPasien.alamat
      jaminan = dataPasien.jp
      pasienUmur = dataPasien.umur
      pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;
      pasienNama = dataPasien.nama
      pasienKK = dataPasien.kk
      pusk = dataPasien.jp
      empt = true
  
    } else if(el === 'add_drug'){
      dataPasien = {
        rm: dataPasienArr[5].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[6].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[7].querySelector('b').textContent.trim(),
        nama: dataPasienArr[8].querySelector('b').textContent.trim(),
        kk: dataPasienArr[9].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[10].querySelector('b').textContent.trim(),
        jk: dataPasienArr[13].querySelector('b').textContent.trim(),
        desa: '',
        tglLahir: dataPasienArr[14].querySelector('b').textContent.trim().split('/')[0],
        umur: dataPasienArr[14].querySelector('b').textContent.trim().split('/')[1],
        bb: dataPasienArr[15].querySelector('b').textContent.trim(),
        jp: 'PKM Jayengan ' + dataPasienArr[12].querySelector('b').textContent.trim(),
      }
      pasienTglLahir = dataPasien.tglLahir
      nik = dataPasien.nik
      noA = dataPasien.rm.substr(7,2)
      noRM = dataPasien.rm.substring(0,7)
      // console.log(noRM)
      pasienJK = dataPasien.jk
      alamat = dataPasien.alamat
      jaminan = dataPasien.jp
      pasienUmur = dataPasien.umur
      pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;
      pasienNama = dataPasien.nama
      pasienKK = dataPasien.kk
      pusk = dataPasien.jp
      console.log(dataPasien)
      empt = true

    } else {
      dataPasien = {
        rm: dataPasienArr[4].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[5].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[6].querySelector('b').textContent.trim(),
        nama: dataPasienArr[7].querySelector('b').textContent.trim(),
        kk: dataPasienArr[8].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[9].querySelector('b').textContent.trim(),
        jk: dataPasienArr[12].querySelector('b').textContent.trim(),
        desa: '',
        tglLahir: dataPasienArr[13].querySelector('b').textContent.trim().split('/')[0],
        umur: dataPasienArr[13].querySelector('b').textContent.trim().split('/')[1],
        jp: 'PKM Jayengan ' + dataPasienArr[11].querySelector('b').textContent.trim(),
      }
      pasienTglLahir = dataPasien.tglLahir
      nik = dataPasien.nik
      noA = dataPasien.rm.substr(7,2)
      noRM = dataPasien.rm.substring(0,7)
      // console.log(noRM)
      pasienJK = dataPasien.jk
      alamat = dataPasien.alamat
      jaminan = dataPasien.jp
      pasienUmur = dataPasien.umur
      pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;
      pasienNama = dataPasien.nama
      pasienKK = dataPasien.kk
      pusk = dataPasien.jp
      console.log(dataPasien)
      empt = true

    }

    // console.log(dataPasien)

    while(pasienNama.length > 30){
      pasienNama = pasienNama.trim().split(' ')
      pasienNama.pop()
      pasienNama = pasienNama.join(' ').trim()
    }


    if(!pasienUmur.length) {
      alert('mohon cek tgl lahir dan umur')
    } else {
      let pasienThn = Number(pasienUmur.split('thn')[0].trim())
      let pasienBln = Number(pasienUmur.split('thn')[1].split('bln')[0].trim())
      let pasienHr = Number(pasienUmur.split('thn')[1].split('bln')[1].split('hr')[0].trim())
        
      if (pasienThn > 0){
        pasienUmur = pasienThn + " thn.";
      } else if (pasienBln > 0){
        pasienUmur = pasienBln + " bln.";
      } else if (pasienHr > 0) {
        pasienUmur = pasienHr + " hr.";
      } else {
        alert('usia tidak dapat dihitung')
      }
    }

    pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;

    svg = drawBarcode("svg", noRM, {
      type: 'Code 128'
    });


    if($('#sex').length && $('#sex').val().length){
      pasienTglLahir = $('#tgllahir').val();
      nik = $('#nik').val();
      pasienUmur = pasienUm();
      if (pasienUmur == "error" ){
        if(al == undefined){
          alert("tanggal lahir salah");
          // al++;
        }
        $('#tgllahir').focus();
      } else {
        noRM = $('#patient_id').val().toUpperCase();
        svg = drawBarcode("svg", noRM, {
          type: 'Code 128'
        });
        noA = noRM.substr(7,2);
        noRM = noRM.substr(0,7);
        pasienSex = $('#sex').val();
        pasienJK = $('#jk > option[value="' + pasienSex + '"]').text();
  
        alamat = $('#alamat').val();
        jamKode = $('#typepatient').val();
        jaminan = $('#jenispasien > option[value="' + jamKode + '"]').text();
  
        pasien = pasienJK + ", " + pasienTglLahir + ", " + pasienUmur;
        pusk = getPusk(jaminan);
  
      }

      if($('#VisitNama').length){
        pasienNama = $('#VisitNama').val();
        pasienKK = $('#VisitNamaKk').val();

      }else{
        pasienNama = $('#namapasien').val();
        pasienKK = $('#nama_kk').val();
      }	

      empt = true

    } else if(empt == undefined){
      // $('#patient_id').focus();
      alert('data register masih kosong');
      // empt++;
    } else if($('#patient_id')){
      $('#patient_id').focus();
    }

    // console.log(empt)

    if(empt){
      $.CreateTemplate("inches",2.3622,1.5748,0.0787402,0.0787402,2.3622,1.5,1,1,0.2,0.05);

      // console.log(pasienNama)
      // let alamat = `${dataPasien.desa ? `${dataPasien.desa} ` : ''}${dataPasien.alamat}`
      // if(alamat.length > 30){
        // alamat = dataPasien.alamat
      // }
      while(alamat.length > 30){
        alamat = alamat.trim().split(' ')
        alamat.pop()
        alamat = alamat.join(' ').trim()
      }

      $(svg).find('rect').map(function(){ 
        let $x = $(this).attr('x');
        let strX = 0 + ($x*0.004481);
        let strY = 1.05;
        let $width = $(this).attr('width');
        let strW = ($width*0.004481);
        let strH = 0.35;
        $.AddRect(strX, strY, strW, strH);
      });
      $.AddText(0.1,0.12,noRM,14);
      $.AddText(0.87,0.12,noA,10);
      $.AddText(0.1,0.9,pasienNama,10);
      $.AddText(0.1,0.75,nik,10);
      $.AddText(0.1,0.6,pasien,10);
      $.AddText(0.1,0.45,alamat,8);
      $.AddText(0.1,0.3,pusk,10);
      $.DrawPDF('labelframe');

    }
  });	
}

if($('#drug2PDF').length == 0 ){

  let obats, el;
   
  if($('#obat2').length){
    el = 'obat2'
  } else if($('#add_drug').length) {
    el = 'add_drug'
  }

  // console.log(el)
  
  if($(`#${el} > table.nested-table > tbody > tr`).length > 1){
    $(`#${el}`).append('<iframe  id="drug2PDF" name="obatframe" style="display: none;" width="400" height="300"></iframe>')
    obats = [...document.getElementById(el).querySelectorAll('tr')].map( row => {
      let tabs = [...row.querySelectorAll('td')]
      if(!tabs){
        return {}
      }
      if( !tabs[1]) {
        return {}
      }
      return {
        kode: tabs[0].textContent,
        nama: tabs[1].textContent,
        dosis: tabs[2].textContent,
        jml: tabs[3].textContent,
        puyer: tabs[4].textContent,
        pmt: tabs[5].textContent,
      }
    })
    if(obats[1] && obats[1].kode){
      $(`#${el} > table.nested-table > tbody > tr:nth-child(1)`).append("<th width='20'>Label</th>")
    }
    for(let [id, obat] of Object.entries(obats)) if(Number(id) > 0 && obat.kode){
      let labelID = `${id}.${obat.kode}`
      let child = Number(id)+1
      // console.log(labelID, child)
      $(`#${el} > table.nested-table > tbody > tr:nth-child(${child})`).append(`<td align="center" valign="top"><a href="" id="${labelID}" onclick="return false;"><img src="${chrome.runtime.getURL('drug_16x16.png')}" alt="Print" title="Print"></a></td>`)

      document.getElementById(`${labelID}`).addEventListener("click", clickLabel)
    }
  }

  function clickLabel(a) {
    let obat = Object.assign({}, obats[a.currentTarget.id.split('.')[0]])
    obat.ket = ''
    obat.ket2 = ''
    obat.nama = obat.nama.replace(/[()]/g, " ")
    
    let tanggal = document.querySelector('.tanggal').textContent.split(',')[1].trim().split('-')[0].trim()
    let jam = document.querySelector('.tanggal').textContent.split(',')[1].trim().split('-')[1].trim()

    // console.log(tanggal)
    // console.log(obat)

    while(obat.nama.length > 30){
      obat.nama = obat.nama.trim().split(' ')
      obat.ket = `${obat.nama.pop()} ${obat.ket}`
      obat.nama = obat.nama.join(' ').trim()
    }
    
    while(obat.dosis.length > 25){
      obat.dosis = obat.dosis.split(' ')
      obat.ket2 = `${obat.dosis.pop()} ${obat.ket2}`
      obat.dosis = obat.dosis.join(' ').trim()
    }
    let pasienEl = '#content > div.divkiri > fieldset.fd150'
    if(el === 'obat2'){
      pasienEl = pasienEl + ' > div.divkiri'
    }

    // console.log(pasienEl)
    let dataPasienArr = [...document.querySelector(pasienEl).querySelectorAll('div')]

    let dataPasien

    if(el === 'obat2'){
      dataPasien = {
        rm: dataPasienArr[0].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[1].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[2].querySelector('b').textContent.trim(),
        nama: dataPasienArr[3].querySelector('b').textContent.trim(),
        kk: dataPasienArr[4].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[5].querySelector('b').textContent.trim(),
        jk: dataPasienArr[6].querySelector('b').textContent.trim(),
        desa: dataPasienArr[7].querySelector('b').textContent.trim(),
        tglLahir: dataPasienArr[8].querySelector('b').textContent.trim(),
        umur: dataPasienArr[9].querySelector('b').textContent.trim(),
        jp: 'PKM Jayengan ' + dataPasienArr[10].querySelector('b').textContent.trim(),
      }
  
    } else if(el === 'add_drug'){
      dataPasien = {
        rm: dataPasienArr[5].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[6].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[7].querySelector('b').textContent.trim(),
        nama: dataPasienArr[8].querySelector('b').textContent.trim(),
        kk: dataPasienArr[9].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[10].querySelector('b').textContent.trim(),
        jk: dataPasienArr[13].querySelector('b').textContent.trim(),
        desa: '',
        tglLahir: dataPasienArr[14].querySelector('b').textContent.trim().split('/')[0],
        umur: dataPasienArr[14].querySelector('b').textContent.trim().split('/')[1],
        bb: dataPasienArr[15].querySelector('b').textContent.trim(),
        jp: 'PKM Jayengan ' + dataPasienArr[12].querySelector('b').textContent.trim(),
      }

      // tanggal = dataPasienArr[0].querySelector('b').textContent.trim()

    } else {
      dataPasien = {
        rm: dataPasienArr[4].querySelector('b').textContent.trim().toUpperCase(),
        nik: dataPasienArr[5].querySelector('b').textContent.trim(),
        noKartu: dataPasienArr[6].querySelector('b').textContent.trim(),
        nama: dataPasienArr[7].querySelector('b').textContent.trim(),
        kk: dataPasienArr[8].querySelector('b').textContent.trim(),
        alamat: dataPasienArr[9].querySelector('b').textContent.trim(),
        jk: dataPasienArr[12].querySelector('b').textContent.trim(),
        desa: '',
        tglLahir: dataPasienArr[13].querySelector('b').textContent.trim().split('/')[0],
        umur: dataPasienArr[13].querySelector('b').textContent.trim().split('/')[1],
        jp: 'PKM Jayengan ' + dataPasienArr[11].querySelector('b').textContent.trim(),
      }

    }

    // console.log(el, dataPasien)



    while(dataPasien.nama.length > 28){
      dataPasien.nama = dataPasien.nama.trim().split(' ')
      dataPasien.nama.pop()
      dataPasien.nama = dataPasien.nama.join(' ').trim()
    }

    if(!dataPasien.umur.length) {
      alert('mohon cek tgl lahir dan umur')
    } else {
      // console.log(dataPasien)
      let pasienThn = Number(dataPasien.umur.split('thn')[0].trim())
      let pasienBln = Number(dataPasien.umur.split('thn')[1].split('bln')[0].trim())
      let pasienHr = Number(dataPasien.umur.split('thn')[1].split('bln')[1].split('hr')[0].trim())
        
      if (pasienThn > 0){
        dataPasien.umur = pasienThn + " thn.";
      } else if (pasienBln > 0){
        dataPasien.umur = pasienBln + " bln.";
      } else if (pasienHr > 0) {
        dataPasien.umur = pasienHr + " hr.";
      } else {
        alert('usia tidak dapat dihitung')
      }
    }

    let svg = drawBarcode("svg", dataPasien.rm, {
      type: 'Code 128'
    });
    dataPasien.rm = dataPasien.rm.substring(0,7);

    // console.log(dataPasien)

    pdfoutput = ''

    $.CreateTemplate("inches",2.75591,1.9685,0.0787402,0.0787402,2.6,1.8,1,1,0.2,0.05);
    let wid = 0
    $(svg).find('rect').map(function(){ 
      let $x = $(this).attr('x');
      let strX = 0 + ($x*0.004481);
      let strY = 1.4;
      let $width = $(this).attr('width');
      let strW = ($width*0.004481);
      let strH = 0.45;
      $.AddRect(strX, strY, strW, strH);
      if(strX > wid){
        wid = strX
      }
    });
    let alamat = `${dataPasien.desa ? `${dataPasien.desa} ` : ''}${dataPasien.alamat}`
    if(alamat.length > 30){
      alamat = dataPasien.alamat
    }
    while(alamat.length > 30){
      alamat = alamat.trim().split(' ')
      alamat.pop()
      alamat = alamat.join(' ').trim()
    }
    $.AddText(wid + 0.05,1.4,dataPasien.rm,16);
    $.AddText(wid + 0.05,1.7,`${tanggal}`,7);
    $.AddText(wid + 0.05,1.6,`${jam}`,7);
    $.AddText(0.1,1.25,dataPasien.nama,10);
    $.AddText(0.1,1.13,`${dataPasien.jp}`,8);
    $.AddText(0.1,1,`${dataPasien.jk} ${dataPasien.tglLahir.length ? `[${dataPasien.tglLahir}] ` : ''}${dataPasien.umur}${dataPasien.bb ? ` ${dataPasien.bb}`: ''}`,8);
    $.AddText(0.1,0.85,`${alamat}`,8);
    $.AddRect(0.01,0.8,70,0.01);
    $.AddText(0.1,0.65,obat.nama,11);
    let jmlH = 0.25
    if(obat.ket.length){
      obat.ket3 = ''
      while(obat.ket.length > 40){
        obat.ket = obat.ket.split(' ')
        obat.ket3 = `${obat.ket.pop()} ${obat.ket3}`
        obat.ket = obat.ket.join(' ')
      }
      $.AddText(0.2,0.52,obat.ket,8);
      obat.ket3 = obat.ket3.trim()
      if(obat.ket3.length){
        $.AddText(0.2,0.43,obat.ket3,8);
        jmlH = 0
      } else {
        jmlH = 0.12
      }
    }
    $.AddText(2.25,0.45,`[${obat.jml}]`,16);
    $.AddText(0.1,0.2+jmlH,obat.dosis,12);
    if(obat.ket2.length){
      $.AddText(0.2,0.1+jmlH-0.01,obat.ket2,8);
    }

    $.DrawPDF('obatframe');
  
  }
  
}