(function () {

    function init() {
        loadData();
    }

    function loadData() {
        executeAjax("http://localhost:3001/list", "GET", (response) => {
            let tbody = "";
            if (response.results && response.results.length) {
                for (let i = 0; i < response.results.length; i++) {
                    let tr = `<tr>
                                <td>${response.results[i]._id}</td>
                                <td>${response.results[i].name}</td>
                                <td>${response.results[i].rollNo}</td>
                            </tr>`
                    tbody += tr;
                }
                document.getElementById("studentsListTableBody").innerHTML = tbody;
            }
        })
    }


    function executeAjax(url, method, cb) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                cb(JSON.parse(this.responseText))
            }
        };
        xhttp.open(method, url, true);
        xhttp.send();
    }

    document.addEventListener("DOMContentLoaded", (event) => {
        init();
    })
})()