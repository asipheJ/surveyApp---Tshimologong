document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const database = firebase.database();
    const surveysRef = database.ref('surveys');
    
    // Show loading state
    document.body.classList.add('loading');
    
    // Fetch all survey data
    surveysRef.once('value').then(function(snapshot) {
        const surveys = snapshot.val();
        
        if (!surveys) {
            showNoDataMessage();
            return;
        }
        
        // Convert the surveys object to an array
        const surveyList = Object.keys(surveys).map(key => {
            return {
                id: key,
                ...surveys[key]
            };
        });
        
        const stats = calculateStatistics(surveyList);
        updateResultsPage(stats);
        
    }).catch(error => {
        console.error("Error fetching surveys:", error);
        showErrorMessage();
    }).finally(() => {
        document.body.classList.remove('loading');
    });
});

function calculateStatistics(surveys) {
    // 1. Basic counts
    const totalSurveys = surveys.length;
    
    // 2. Age calculations - using direct age field if available
    const ages = surveys
        .map(s => parseInt(s.age))
        .filter(age => !isNaN(age) && age > 0);
    
    const ageStats = {
        avg: ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 'N/A',
        max: ages.length ? Math.max(...ages) : 'N/A',
        min: ages.length ? Math.min(...ages) : 'N/A'
    };
    
    // 3. Food preferences (percentage)
    const foodCounts = {
        pizza: surveys.filter(s => s.favoriteFoods && s.favoriteFoods.includes('pizza')).length,
        pasta: surveys.filter(s => s.favoriteFoods && s.favoriteFoods.includes('pasta')).length,
        papwors: surveys.filter(s => s.favoriteFoods && s.favoriteFoods.includes('papwors')).length
    };
    
    // 4. Rating averages (1-5 scale)
    const ratingAverages = {
        movies: calculateRatingAverage(surveys, 'movies'),
        radio: calculateRatingAverage(surveys, 'radio'),
        eatOut: calculateRatingAverage(surveys, 'food'),  // Note: matches your form's radio name
        tv: calculateRatingAverage(surveys, 'tv')
    };
    
    return {
        totalSurveys,
        avgAge: ageStats.avg,
        maxAge: ageStats.max,
        minAge: ageStats.min,
        pizzaPercent: totalSurveys ? ((foodCounts.pizza / totalSurveys) * 100).toFixed(1) : '0',
        pastaPercent: totalSurveys ? ((foodCounts.pasta / totalSurveys) * 100).toFixed(1) : '0',
        papWorsPercent: totalSurveys ? ((foodCounts.papwors / totalSurveys) * 100).toFixed(1) : '0',
        moviesAvg: ratingAverages.movies,
        radioAvg: ratingAverages.radio,
        eatOutAvg: ratingAverages.eatOut,
        tvAvg: ratingAverages.tv
    };
}

// Helper functions
function calculateRatingAverage(surveys, ratingName) {
    const validRatings = surveys
        .map(s => ratingToNumber(s.ratings?.[ratingName]))
        .filter(r => !isNaN(r));
    
    if (validRatings.length === 0) return '0';
    
    const sum = validRatings.reduce((a, b) => a + b, 0);
    return (sum / validRatings.length).toFixed(1);
}

function ratingToNumber(rating) {
    const ratingMap = {
        'strongly-agree': 1,
        'agree': 2,
        'neutral': 3,
        'disagree': 4,
        'strongly-disagree': 5
    };
    return ratingMap[String(rating).toLowerCase()] || NaN;
}

function updateResultsPage(stats) {
    // Update all statistics
    document.getElementById('total-surveys').textContent = stats.totalSurveys;
    document.getElementById('avg-age').textContent = stats.avgAge;
    document.getElementById('max-age').textContent = stats.maxAge;
    document.getElementById('min-age').textContent = stats.minAge;
    
    document.getElementById('pizza_percent').textContent = `${stats.pizzaPercent}%`;
    document.getElementById('pasta_percent').textContent = `${stats.pastaPercent}%`;
    document.getElementById('pap_wors_percent').textContent = `${stats.papWorsPercent}%`;
    
    document.getElementById('movies_avg').textContent = stats.moviesAvg;
    document.getElementById('radio_avg').textContent = stats.radioAvg;
    document.getElementById('eat_out_avg').textContent = stats.eatOutAvg;
    document.getElementById('tv_avg').textContent = stats.tvAvg;
}

function showNoDataMessage() {
    const container = document.createElement('div');
    container.className = 'no-data';
    container.innerHTML = `
        <h2>No Survey Data Available</h2>
        <p>Submit surveys through the form to see results.</p>
        <a href="index.html">Go to Survey Form</a>
    `;
    document.body.appendChild(container);
}

function showErrorMessage() {
    const container = document.createElement('div');
    container.className = 'error-message';
    container.textContent = 'Failed to load survey data. Please try again later.';
    document.body.appendChild(container);
}