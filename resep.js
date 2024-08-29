function waitForElm(elm) {
  return new Promise( resolve => {
    var checkExist = setInterval(function() {
      if ($(elm).length) {
        // console.log(`${elm} Exists!`);
        clearInterval(checkExist);
        resolve(document.querySelector(elm))
      }
    }, 10); // check every 100ms
  })
}
window.sudah = false
$(document).ready(() => {
  let submitId = document.querySelector('input[update="view_pemakaian_obat"]').getAttribute('id')
  // console.log(submitId)
  // let timeStamp = 0
  $(`#${submitId}`).on('click', async function(evt) {
    if(!window.sudah){
      // console.log(window.sudah)
      window.sudah = true

      let ada = $('table.nested-table').length
      if(ada){
        // console.log('loading')
        // console.log('ada')
        // await waitForElm('#loading[display="inline"]')
        await waitForElm('#loading[style="margin: 0px 0px 10px 10px; display: none;"]')
      }
      await waitForElm('#view_pemakaian_obat')
      let table = await waitForElm('table.nested-table')
      if(table){
        let rows = table.querySelectorAll('tr')
        for (let i = 0; i < rows.length; i++) {
          let row = rows[i]
          let orgCol = document.getElementById(`org${i}`)
          if(!orgCol){
            orgCol = row.insertCell(4)
            orgCol.setAttribute('id', `org${i}`)
            orgCol.setAttribute('width', '100')
            orgCol.style.color = '#003399'
            orgCol.style.textAlign = 'center'
            orgCol.style.verticalAlign = 'inherit'
          }
          let ratCol = document.getElementById(`rat${i}`)
          if(!ratCol){
            ratCol = row.insertCell(5)
            ratCol.setAttribute('id', `rat${i}`)
            ratCol.setAttribute('width', '100')
            ratCol.style.color = '#003399'
            ratCol.style.textAlign = 'center'
            ratCol.style.verticalAlign = 'inherit'
          }
  
          let links = row.querySelectorAll('a')
          if(!links.length ){
            if(!orgCol.textContent.length){
              let text = document.createTextNode('Orang')
              orgCol.appendChild(text)
              let textr = document.createTextNode('Rata2')
              ratCol.appendChild(textr)
            }
          } else {
  
            // console.log('table is ready');
  
  
            for(let link of links){
              // console.log(link.textContent);
              let href = link.getAttribute('href')
              if( href && href.includes('pasien')){
                $.ajax(href).done( res => {
                  // console.log()
                  if(!orgCol.textContent.length && res){
                    let temp = document.createElement('div')
                    temp.innerHTML = res
                    let rows = temp.querySelectorAll('tr')
                    // console.log(rows.length)
                    let text = document.createTextNode(`${rows.length-1}`)
                    orgCol.appendChild(text)
                    let jmls = row.querySelectorAll('td')
                    let jml = Number(jmls[3].textContent.split('.').join(''))
                    // console.log(jml)
                    let textr = document.createTextNode(`${Math.ceil(jml/(rows.length-1))}`)
                    ratCol.appendChild(textr)
      
                  }
                })
              }
            }
  
            window.sudah = false
      
          }
    
  
        }
    
      }
  
    }

    return false;//Returning false prevents the event from continuing up the chain
  });
})
