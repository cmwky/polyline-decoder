let latLngs;

function decodePolyline(encodedPolyline) {            
    let polyline = encodedPolyline;
    if(document.getElementById('unescapeCheckbox').checked == true){
        let poly = `"${encodedPolyline}"`;
        polyline = JSON.parse(poly);
    }
    const path = google.maps.geometry.encoding.decodePath(polyline);

    latLngs = path.map(latlng => ({
        lat: latlng.lat(),
        lng: latlng.lng()
    }));

    return latLngs;
}

function generateTable(data) {
    let table = `<table><tr><th>Latitude</th><th>Longitude</th></tr>`;
    for(let latLng of data) {
        table += `<tr><td>${latLng.lat}</td><td>${latLng.lng}</td></tr>`;
    }
    table += `</table>`;
    return table;
}        

document.getElementById('decodeButton').onclick = function() {
    let encodedPolyline = document.getElementById('polylineInput').value;
    if (!encodedPolyline) {
        encodedPolyline = "cszwFfznbMJo@F_AQyAAyAFi@Nq@Dm@^_CF}AEo@AkAa@BIBg@";
        document.getElementById('polylineInput').value = encodedPolyline;
    }

    latLngs = decodePolyline(encodedPolyline);
    document.getElementById('resultsJson').innerText = JSON.stringify(latLngs, null, 2);
    document.getElementById('resultsText').innerText = latLngs.map(latLng => `${latLng.lat}, ${latLng.lng}`).join('\n');
    document.getElementById('resultsCSV').innerHTML = generateTable(latLngs);
    document.getElementById('copyButton').disabled = false;
    document.getElementById('saveButton').disabled = false;
}

document.getElementById('polylineInput').addEventListener('input', function(){
    if(document.getElementById('polylineInput').value.length > 0){document.getElementById('decodeButton').textContent = 'Decode Polyline';}
    else {document.getElementById('decodeButton').textContent = 'Decode (Sample) Polyline';}
});

document.getElementById('saveButton').onclick = function() {
    if (this.innerText === 'Save to File') {
        let activeTab = document.querySelector('.tabButton.active').id;

        if (activeTab === 'jsonTab') {
            document.getElementById('jsonCheckbox').checked = true;
        } else if (activeTab === 'textTab') {
            document.getElementById('textCheckbox').checked = true;
        } else if (activeTab === 'csvTab') {
            document.getElementById('csvCheckbox').checked = true;
        }
        document.getElementById('fileTypes').style.display = 'block';
        this.textContent = 'Save';
   }
     else {
        let fileTypes = {
            json: document.getElementById('jsonCheckbox').checked,
            text: document.getElementById('textCheckbox').checked,
            csv: document.getElementById('csvCheckbox').checked
        };

        for (let fileType in fileTypes) {
            if (fileTypes[fileType]) {
                let dataStr, fileTypeText, fileName;

                if (fileType === 'json') {
                    dataStr = JSON.stringify(latLngs, null, 2);
                    fileTypeText = 'application/json';
                    fileName = 'polyline-decoded.json';
                } else if (fileType === 'text') {
                    dataStr = latLngs.map(latLng => `${latLng.lat}, ${latLng.lng}`).join('\n');
                    fileTypeText = 'text/plain';
                    fileName = 'polyline-decoded.txt';
                } else if (fileType === 'csv') {
                    dataStr = latLngs.map(latLng => `${latLng.lat},${latLng.lng}`).join('\n');
                    fileTypeText = 'text/csv';
                    fileName = 'polyline-decoded.csv';
                }

                const data = new Blob([dataStr], {type: fileTypeText});
                const url = window.URL.createObjectURL(data);

                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;

                link.click();

                window.URL.revokeObjectURL(url);
            }
        }
        this.textContent = 'File(s) Saved!';

        setTimeout(() => {
            this.textContent = 'Save';
        }, 2000);
    }
}

document.getElementById('clearButton').onclick = function() {
    document.getElementById('polylineInput').value = '';
    document.getElementById('resultsJson').innerText = '';
    document.getElementById('resultsText').innerText = '';
    document.getElementById('resultsCSV').innerHTML = '';
    document.getElementById('saveButton').textContent = "Save to File";
    document.getElementById('saveButton').disabled = true;
    document.getElementById('copyButton').disabled = true;
    document.getElementById('fileTypes').style.display = 'none';

    document.getElementById('jsonCheckbox').checked = false;
    document.getElementById('textCheckbox').checked = false;
    document.getElementById('csvCheckbox').checked = false;
    document.getElementById('unescapeCheckbox').checked = true;
    document.getElementById('decodeButton').textContent = 'Decode (Sample) Polyline';
    
    let activeTab = document.querySelector('.tabButton.active').id;
    if (activeTab === 'jsonTab') {
        document.getElementById('jsonCheckbox').checked = true;
    } else if (activeTab === 'textTab') {
        document.getElementById('textCheckbox').checked = true;
    } else if (activeTab === 'csvTab') {
        document.getElementById('csvCheckbox').checked = true;
    }            
}

const tabs = document.getElementsByClassName('tab');
const tabButtons = document.getElementsByClassName('tabButton');
const resultsTabs = document.getElementById('tabButtonsSection');
resultsTabs.onclick = function(e) {
    const target = e.target;
    if (target.className.includes('tabButton')) {
        for (let i = 0; i < tabButtons.length; i++) {
            if (tabButtons[i] === target) {
                tabButtons[i].classList.add('active');
                tabs[i].style.display = 'block';
                // Check the corresponding checkbox
                if(tabButtons[i].id === 'jsonTab') {
                    document.getElementById('jsonCheckbox').checked = true;
                } else if(tabButtons[i].id === 'textTab') {
                    document.getElementById('textCheckbox').checked = true;
                } else if(tabButtons[i].id === 'csvTab') {
                    document.getElementById('csvCheckbox').checked = true;
                }
            } else {
                tabButtons[i].classList.remove('active');
                tabs[i].style.display = 'none';
                // Uncheck the corresponding checkbox
                if(tabButtons[i].id === 'jsonTab') {
                    document.getElementById('jsonCheckbox').checked = false;
                } else if(tabButtons[i].id === 'textTab') {
                    document.getElementById('textCheckbox').checked = false;
                } else if(tabButtons[i].id === 'csvTab') {
                    document.getElementById('csvCheckbox').checked = false;
                }
            }
        }
    }
};


document.getElementById('copyButton').onclick = function() {
    var copyText;
    if (document.getElementById('jsonTab').classList.contains('active')) {
        copyText = document.getElementById('resultsJson').innerText;
    } else if (document.getElementById('textTab').classList.contains('active')) {
        copyText = document.getElementById('resultsText').innerText;
    } else if (document.getElementById('csvTab').classList.contains('active')) {
        copyText = document.getElementById('resultsCSV').innerText;
    }

    var textArea = document.createElement('textarea');
    textArea.value = copyText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('Copy');
    textArea.remove();
    
    var copyButton = document.getElementById('copyButton');
    copyButton.innerText = "Copied!";
    copyButton.classList.add('copied');

    setTimeout(function() {
        copyButton.innerText = "Copy to Clipboard";
        copyButton.classList.remove('copied');
    }, 2000);
};