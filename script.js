// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.querySelector('.submit-btn');
    
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        // 1. Collect all form data
        const surveyData = {
            personalDetails: {
                fullnames: document.getElementById('fullnames').value,
                email: document.getElementById('email').value,
                dob: document.getElementById('dob').value,
                contactNumber: document.getElementById('number').value
            },
            favoriteFood: {
                pizza: document.getElementById('pizza').checked,
                pasta: document.getElementById('pasta').checked,
                papwors: document.getElementById('papwors').checked,
                other: document.getElementById('other').checked
            },
            ratings: {
                movies: getRadioValue('movies'),
                radio: getRadioValue('radio'),
                eatOut: getRadioValue('food'),
                tv: getRadioValue('tv')
            },
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        // 2. Helper function to get radio button values
        function getRadioValue(name) {
            const selected = document.querySelector(`input[name="${name}"]:checked`);
            return selected ? selected.value : null;
        }

        // 3. Save to Firebase
        const database = firebase.database();
        database.ref('surveys').push(surveyData)
            .then(() => {
                alert('Survey submitted successfully!');
                // Optional: Clear the form
                document.querySelector('form').reset();
            })
            .catch(error => {
                console.error('Error saving survey:', error);
                alert('Error submitting survey. Please try again.');
            });
    });
});