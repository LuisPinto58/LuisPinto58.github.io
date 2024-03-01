

document.getElementById("button").addEventListener("click", () =>{
    let uc = document.getElementById("UC").value 
    let nota = document.getElementById("Nota").value
    let tr = document.createElement('tr')
    let td1 = document.createElement('td')
    let td2 = document.createElement('td')
    td1.innerHTML = uc
    td2.innerHTML = nota
    tr.appendChild(td1)
    tr.appendChild(td2)
    document.getElementById("table").appendChild(tr)
})
