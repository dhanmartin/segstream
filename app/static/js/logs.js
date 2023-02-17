let current_page = 1;
function init() {
    set_active_menu("logs");
    loadList(current_page);
}

function loadList(page) {
    ajaxRequest("lists/"+page+"/", {}, "GET")
    .then(data => {
        current_page = page
        updateTableRows(data.records)
        updatePagination(data.pagination, "loadList")
    })
}

function updateTableRows(records) {
    let el = document.getElementById("list_body")
    let rows = []
    for (let record of records) {
        let tds = ["<tr>"]
        for (let i of ["index","action","data","date_time"]) {
            let val = record[i]
            if (i == "date_time") {
                val = new Date(val).toUTCString();
            }

            if (i=="data") {
                tds.push("<td class='text-start'><pre>"+ JSON.stringify(record[i], undefined, 1) +"</pre></td>")
            }
            else {
                tds.push("<td>"+ record[i] +"</td>")
            }
        }
        tds.push("</tr>")
        rows.push(tds.join(""))
    }
    el.innerHTML = rows.join("")
}

window.addEventListener("load", () => {
    init();
});
