console.log("this is my page");

const fetchLinkTarget = function(e) {
    fetch(e.target.href);
    e.preventDefault();
    return false;
}

const makeTableCell = function(val) {
    const cell = document.createElement("td");
    cell.innerHTML = val;
    return cell
}

const makeLinkCell = function(url, text) {
    const cell = document.createElement("td");
    const lightOnLink = document.createElement('a');
    lightOnLink.setAttribute("href", url);
    lightOnLink.setAttribute("class", "no-nav");
    lightOnLink.innerHTML = text;
    cell.appendChild(lightOnLink);
    return cell;
}

const makeFanLink = function(tempHost) {
    const cell = makeLinkCell("http://localhost:4000/fan/" + tempHost.host, "Fan");
    return cell;
};

const makeCoolLink = function(tempHost) {
    const cell = makeLinkCell("http://localhost:4000/cool/" + tempHost.host, "Cool");
    return cell;
};

const makeHeatLink = function(tempHost) {
    const cell = makeLinkCell("http://localhost:4000/heat/" + tempHost.host, "Heat");
    return cell;
};

const makeLightOnLink = function(tempHost) {
    const cell = makeLinkCell("http://localhost:4000/light/on/" + tempHost.host, "On");
    return cell;
};

const makeLightOffLink = function(tempHost) {
    const cell = makeLinkCell("http://localhost:4000/light/off/" + tempHost.host, "Off");
    return cell;
};

const makeClientTableHeader = function(clientTable) {
    const row = document.createElement('tr');
    row.appendChild(makeTableCell("Room"));
    row.appendChild(makeTableCell("Light On"));
    row.appendChild(makeTableCell("Light Off"));
    row.appendChild(makeTableCell("Fan"));
    row.appendChild(makeTableCell("Cool"));
    row.appendChild(makeTableCell("Heat"));
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
    row.appendChild(makeLightOnLink(tempHost));
    row.appendChild(makeLightOffLink(tempHost));
    row.appendChild(makeFanLink(tempHost));
    row.appendChild(makeCoolLink(tempHost));
    row.appendChild(makeHeatLink(tempHost));
    row.appendChild(makeTableCell(tempHost.power));
    row.appendChild(makeTableCell(tempHost.mode));
    row.appendChild(makeTableCell(tempHost.currentTemperature));
    row.appendChild(makeTableCell(tempHost.temperature));
    row.appendChild(makeTableCell(tempHost.fanSpeed));
    clientTable.appendChild(row);
}

const loadClientTable = function(clientTable) {
    while(clientTable.firstElementChild) {
        clientTable.removeChild(clientTable.firstElementChild);
    }

    console.log("Draw clients");
    var url = "/hosts/";
    fetch(url).then((res) => {
        makeClientTableHeader(clientTable);
        res.json().then( (hosts) => {
            hosts.forEach( tempHost => makeClientRow(clientTable, tempHost));
        }).then( () => {
            const elements = document.getElementsByClassName('no-nav');
            for (let i = 0; i < elements.length; i++) {
                elements[i].addEventListener('click', fetchLinkTarget);
            }
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