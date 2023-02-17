var request_mode = "GET";
var current_page = 1;
var active_modal;

function init() {
    loadList(current_page);
    setRequestMode(document.getElementById("get_button"))
}

function loadList(page) {
    executeRequest("lists/"+page+"/", {}, "GET")
    .then(data => {
        current_page = page
        updateTableRows(data.records)
        updatePagination(data.pagination)
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

function updatePagination(pagination) {
    let el = document.getElementById("pagination")
    let buttons = []
    buttons.push(buildPaginationButton(pagination.current, "Previous", pagination.current-1, !pagination.has_previous))
    for (let page of pagination.page_ranges) {
        buttons.push(buildPaginationButton(pagination.current, page, page))
    }
    buttons.push(buildPaginationButton(pagination.current, "Next", pagination.current+1, !pagination.has_next))
    el.innerHTML = buttons.join("")
}

function buildPaginationButton(current, label, page, disabled) {
    let active = current == page ? 'active' : '';
    let disabled_button = disabled ? 'disabled' : '';
    let onclick = !active ? `onclick="loadList(${page})"` : ''
    let tmpl = `<li class="page-item ${disabled_button} ${active}">
        <button class="page-link" ${onclick}>${label}</button>
    </li>`;
    return tmpl
}

function executeRequest(url, data, method="POST") {
    setup = {
        "method": method,
        "credentials": 'same-origin',
        "headers": {
            'Accept': 'application/json',
            'X-CSRFToken': this.getCookie('csrftoken'),
        },
    }
    if (method == "POST") {
        setup["body"] = JSON.stringify(data)
    }

    return fetch(url, setup).then(async response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text)
            })
        }

        try{
            data = await response.clone().json()
        }
        catch(err) {
            data = await response.clone().text()
        }

        return data
    })
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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
    active_modal.hide()

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
    executeRequest(url, data, "POST")
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
