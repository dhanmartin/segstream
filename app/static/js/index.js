var request_mode = "GET";
var current_page = 1;
var active_modal = undefined;

function init() {
    set_active_menu("home");
    loadList(current_page);
    setRequestMode(document.getElementById("get_button"))
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
        for (let i of ["index","id","username","first_name","last_name","email"]) {
            tds.push("<td>"+ record[i] +"</td>")
        }
        tds.push("</tr>")
        rows.push(tds.join(""))
    }
    el.innerHTML = rows.join("")
}

function setRequestMode(el) {
    request_mode = el.innerHTML.trim()
    Array.from(document.getElementsByClassName('btnOptions'))
    .forEach(function(elem) {
        elem.classList.remove("active")
    });
    el.classList.add("active")
    initializeRequestForms()
}

function initializeRequestForms() {
    resetForm()
    toggleInputs()
}

function resetForm() {
    Array.from(document.getElementsByClassName('form-input'))
    .forEach(elem => {
        elem.value = ""
    });
    Array.from(document.getElementsByClassName('request_forms'))
    .forEach(elem => {
        elem.classList.add("d-none")
    })
}

function toggleInputs() {
    let fields = getAvailableFields()
    Array.from(fields)
    .forEach(function(k) {
        document.getElementById(`form_${k}`).classList.remove("d-none")
    });
}

function getAvailableFields() {
    let fields = ["id","username","first_name","last_name","email"]
    if (request_mode == "GET" || request_mode == "DELETE") {
        fields = ["id"]
    }
    else if(request_mode == "POST") {
        fields.splice(fields.indexOf("id"), 1)
    }

    return fields
}

function pre_submit() {
    if (["DELETE","GET"].includes(request_mode)) {
        let el = document.getElementById(`input_id`)
        if (!el.value) {
            return;
        }
    }
    if (request_mode == "DELETE") {
        document.getElementById("remove_modal_label").innerHTML = "Remove user?"
        active_modal = new bootstrap.Modal(document.getElementById('remove_user_modal'))
        active_modal.show()
    }
    else {
        submit();
    }
}

function submit() {
    if (active_modal) {
        active_modal.hide()
        active_modal = undefined
    }

    let fields = getAvailableFields()
    data = {}
    Array.from(fields)
    .forEach(function(k) {
        let el = document.getElementById(`input_${k}`)
        data[k] = el.value
    });

    let url = `submit/${request_mode.toLocaleLowerCase()}/`
    let result = `${request_mode} RESULT\n`
    let has_error = false
    ajaxRequest(url, data, "POST")
    .then(data => {
        try{
            result = `${result}${JSON.stringify(data, undefined, 2)}`
        }
        catch {
            result = `${result}${data}`
        }
    })
    .catch(error => {
        result = `${result}${error}`
        has_error = true
    })
    .finally(() => {
        document.getElementById("response_section").textContent = result

        if (!has_error) {
            if (request_mode != "GET") {
                loadList(current_page)
            }

            if (["POST","DELETE"].includes(request_mode)) {
                initializeRequestForms()
            }
        }
    })
}

window.addEventListener("load", () => {
    init();
});
