console.log("this is my page");

const makeTableCell = function(val) {
    const cell = document.createElement("td");
    cell.innerHTML = val;
    return cell
}

const makeLinkCell = function(url, text) {
    const cell = document.createElement("td");
    const lightOnLink = document.createElement('a');
    lightOnLink.setAttribute("href", url);
    lightOnLink.innerHTML = text;
    cell.appendChild(lightOnLink);
    return cell;
}

const makeClientTableHeader = function(clientTable) {
    const row = document.createElement('tr');
    row.appendChild(makeTableCell("Room"));
    row.appendChild(makeTableCell("Light On"));
    row.appendChild(makeTableCell("Light Off"));
    row.appendChild(makeTableCell("Power"));
    row.appendChild(makeTableCell("Mode"));
    row.appendChild(makeTableCell("Current"));
    row.appendChild(makeTableCell("Target"));
    row.appendChild(makeTableCell("Fan Speed"));
    clientTable.appendChild(row);
}

const makeClientRow = function(clientTable, tempHost) {
    const row = document.createElement('tr');

    row.appendChild(makeTableCell(tempHost.room));
    row.appendChild(makeLinkCell("http://localhost:3000/light/on/" + tempHost.host, "On"));
    row.appendChild(makeLinkCell("http://localhost:3000/light/off/" + tempHost.host, "Off"));
    row.appendChild(makeTableCell(tempHost.power));
    row.appendChild(makeTableCell(tempHost.mode));
    row.appendChild(makeTableCell(tempHost.currentTemperature));
    row.appendChild(makeTableCell(tempHost.temperature));
    row.appendChild(makeTableCell(tempHost.fanSpeed));
    clientTable.appendChild(row);
}

const loadClientTable = function(clientTable) {
    console.log(clientTable.firstElementChild);
    while(clientTable.firstElementChild) {
        clientTable.removeChild(clientTable.firstElementChild);
    }

    console.log("Draw clients");
    var url = "/hosts/";
    fetch(url).then((res) => {
        makeClientTableHeader(clientTable);
        res.json().then( (hosts) => {
            hosts.forEach( tempHost => makeClientRow(clientTable, tempHost));
        });
    });
}

window.addEventListener('load', function () {
    const clientTable = document.getElementById("tblCLients");
    loadClientTable(clientTable);
    document.getElementById("loadClients").addEventListener('click', function() {
        loadClientTable(clientTable);
    });

  });