document.addEventListener('DOMContentLoaded', function() {
    // 1. Show loading spinner
    const loadingElem = document.createElement('div');
    loadingElem.id = "loading-spinner";
    loadingElem.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text">Loading survey results...</div>
    `;
    document.body.appendChild(loadingElem);

    const database = firebase.database();
    const surveyRef = database.ref('surveys');

    surveyRef.once('value').then(snapshot => {
        // 2. Hide loading spinner
        loadingElem.style.display = 'none';

        const surveys = [];
        snapshot.forEach(child => {
            surveys.push(child.val());
        });

        if (surveys.length === 0) {
            document.getElementById('message-container').textContent = "No survey results found.";
            return;
        }

        // 1. Participation Overview
        document.getElementById('total-surveys').textContent = surveys.length;

        // Age calculations
        const ages = surveys.map(s => {
            if (!s.personalDetails || !s.personalDetails.dob) return null;
            return getAge(s.personalDetails.dob);
        }).filter(age => age !== null);

        if (ages.length > 0) {
            const avgAge = (ages.reduce((a,b) => a + b, 0) / ages.length).toFixed(1);
            document.getElementById('avg-age').textContent = `${avgAge} years`;
            document.getElementById('min-age').textContent = `${Math.min(...ages)} years`;
            document.getElementById('max-age').textContent = `${Math.max(...ages)} years`;
        }

        // 2. Food Preferences
        let pizzaCount = 0, pastaCount = 0, papWorsCount = 0, total = surveys.length;

        surveys.forEach(survey => {
            const foods = survey.favoriteFood || {};
            if (foods.pizza) pizzaCount++;
            if (foods.pasta) pastaCount++;
            if (foods.papwors) papWorsCount++;
        });

        const pizzaPercent = total ? ((pizzaCount / total) * 100).toFixed(1) : "0.0";
        const pastaPercent = total ? ((pastaCount / total) * 100).toFixed(1) : "0.0";
        const papWorsPercent = total ? ((papWorsCount / total) * 100).toFixed(1) : "0.0";

        document.getElementById('pizza_percent').textContent = `${pizzaPercent}%`;
        document.getElementById('pasta_percent').textContent = `${pastaPercent}%`;
        document.getElementById('pap_wors_percent').textContent = `${papWorsPercent}%`;

        // 3. Activity Ratings
        const ratingValues = {
            "strongly-agree": 1,
            "agree": 2,
            "neutral": 3,
            "disagree": 4,
            "strongly-disagree": 5
        };

        const activities = [
            { key: "movies", avgId: "movies_avg", starsId: "movies_stars" },
            { key: "radio", avgId: "radio_avg", starsId: "radio_stars" },
            { key: "eatOut", avgId: "eat_out_avg", starsId: "eat_out_stars" },
            { key: "tv", avgId: "tv_avg", starsId: "tv_stars" }
        ];

        activities.forEach(activity => {
            let sum = 0, count = 0;
            surveys.forEach(survey => {
                if (survey.ratings && survey.ratings[activity.key]) {
                    const val = ratingValues[survey.ratings[activity.key]];
                    if (val) {
                        sum += val;
                        count++;
                    }
                }
            });
            const avg = count ? (sum / count).toFixed(1) : "0.0";
            document.getElementById(activity.avgId).textContent = `${avg}/5`;
        });
    });

    function getAge(dob) {
        var birth = new Date(dob);
        var today = new Date();
        var age = today.getFullYear() - birth.getFullYear();
        var m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }

    function setBar(barElem, percent) {
        if (barElem) {
            barElem.style.width = (percent * 100) + "%";
            barElem.style.height = "10px";
            barElem.style.backgroundColor = "#222";
        }
    }

    function getStarsHTML(avg) {
        let rounded = Math.round(5 - avg + 1); // 1 is best, 5 is worst
        let stars = "";
        for (let i = 1; i <= 5; i++) {
            stars += `<span style="color:${i <= rounded ? '#ffd700' : '#ccc'}">&#9733;</span>`;
        }
        return stars;
    }
});