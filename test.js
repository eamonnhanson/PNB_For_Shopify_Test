document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('email-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('input--sections--21194190717258__footer--contactemail').value;
        const messageDiv = document.getElementById('message');
        const resultDiv = document.getElementById('result');
        const bedrijfName = document.getElementById('bedrijf-name');

        messageDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        messageDiv.innerHTML = 'Verifying email...';

        console.log(`Fetching data for email: ${email}`);

        fetch('https://zoho-calls-e0dc91dd8cf4.herokuapp.com/fetch-achternaam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => {
            console.log('Response received from Zoho CRM:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received from Zoho CRM:', data);
            messageDiv.style.display = 'none';

            if (data.data && data.data.length > 0) {
                const userRecord = data.data[0];
                const bedrijf = userRecord.Bedrijf || 'Bedrijf not found';
                bedrijfName.innerText = bedrijf;

                resultDiv.style.display = 'block';

                const payload = {
                    Voornaam: userRecord.Voornaam,
                    Achternaam: userRecord.Achternaam,
                    Email: userRecord.Email,
                    Teller: userRecord.Teller,
                    Bedrijf: userRecord.Bedrijf
                };

                console.log('Sending data to Zoho Flow proxy server:', payload);

                fetch('https://testtest-wpm-06c0781a39f1.herokuapp.com/proxy-zoho-flow', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    console.log('Response received from Zoho Flow proxy server:', response);
                    if (!response.ok) {
                        throw new Error('Error sending data to Zoho Creator: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Data sent to Zoho Creator successfully:', data);
                })
                .catch(error => {
                    console.error('Error sending data to Zoho Creator:', error);
                });
            } else {
                bedrijfName.innerText = 'No matching records found';
                resultDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching Bedrijf from Zoho CRM:', error);
            messageDiv.style.display = 'none';
            bedrijfName.innerText = 'De informatie kan niet opgehaald worden. Stuur een email naar info@planteenboom.nu om de fout te melden.';
            resultDiv.style.display = 'block';
        });
    });
});
