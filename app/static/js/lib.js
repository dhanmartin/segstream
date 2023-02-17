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

function ajaxRequest(url, data, method="POST") {
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

function updatePagination(pagination, method) {
    let el = document.getElementById("pagination")
    let buttons = []
    buttons.push(buildPaginationButton(pagination.current, "Previous", pagination.current-1, !pagination.has_previous, method))
    for (let page of pagination.page_ranges) {
        buttons.push(buildPaginationButton(pagination.current, page, page, false, method))
    }
    buttons.push(buildPaginationButton(pagination.current, "Next", pagination.current+1, !pagination.has_next, method))
    el.innerHTML = buttons.join("")
}

function buildPaginationButton(current, label, page, disabled, method) {
    let active = current == page ? 'active' : '';
    let disabled_button = disabled ? 'disabled' : '';
    let onclick = !active ? `onclick="${method}(${page})"` : ''
    let tmpl = `<li class="page-item ${disabled_button} ${active}">
        <button class="page-link" ${onclick}>${label}</button>
    </li>`;
    return tmpl
}

function set_active_menu(menu) {
    Array.from(document.getElementsByClassName('header_menus'))
    .forEach(function(elem) {
        elem.classList.remove("active")

        if (elem.id == `headermenu-${menu}`) {
            elem.classList.add("active")
        }
    });
}
