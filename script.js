document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('survey-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Collect form data
        const surveyData = {
            personalDetails: {
                fullnames: document.getElementById('fullnames').value.trim(),
                email: document.getElementById('email').value.trim(),
                dob: document.getElementById('dob').value,
                contactNumber: document.getElementById('number').value.trim()
            },
            favoriteFood: getSelectedFoods(),
            ratings: getRatings(),
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        // Submit to Firebase
        const database = firebase.database();
        database.ref('surveys').push(surveyData)
    .then(() => {
        showModal('<strong>Survey submitted successfully!</strong><br>Thank you for participating!');
        form.reset();
    })
    .catch(error => {
        console.error('Submission error:', error);
        showModal('<strong>Error submitting survey.</strong><br>Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SUBMIT';
    });
    });
    function showModal(message, logo = 'logo.png') {
        const modal = document.getElementById('custom-modal');
        document.querySelector('.modal-logo').src = logo;
        document.getElementById('modal-message').innerHTML = message;
        modal.style.display = 'flex';
    
        document.getElementById('close-modal-btn').onclick = () => {
            modal.style.display = 'none';
        };
    }

    function getSelectedFoods() {
        const foods = [];
        if (document.getElementById('pizza').checked) foods.push('pizza');
        if (document.getElementById('pasta').checked) foods.push('pasta');
        if (document.getElementById('papwors').checked) foods.push('pap and wors');
        if (document.getElementById('other').checked) foods.push('other');
        return foods;
    }

    function getRatings() {
        return {
            movies: getSelectedRadioValue('movies'),
            radio: getSelectedRadioValue('radio'),
            eatOut: getSelectedRadioValue('eatOut'),
            tv: getSelectedRadioValue('tv')
        };
    }

    function getSelectedRadioValue(name) {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : null;
    }
});