
// =========================
// SIDEBAR
// =========================

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("active");
}


// =========================
// LOAD EVENTS
// =========================

var events = JSON.parse(localStorage.getItem("events")) || [];

var eventsContainer = document.getElementById("events");
var searchInput = document.getElementById("search");


// =========================
// FORMAT DATE
// =========================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Date TBA";
    }

    var date = new Date(dateValue + "T00:00:00");

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// =========================
// UPCOMING EVENTS
// =========================

function isUpcoming(event) {

    if (!event.date) {
        return true;
    }

    var eventDate = new Date(event.date + "T00:00:00");

    if (isNaN(eventDate.getTime())) {
        return true;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    return eventDate >= today;
}


// =========================
// DISPLAY EVENTS
// =========================

function showEvents(eventList) {

    eventsContainer.innerHTML = "";

    if (eventList.length === 0) {

        var message = document.createElement("p");
        message.className = "no-events";
        message.textContent = "No upcoming events found.";

        eventsContainer.appendChild(message);
        return;
    }

    eventList.forEach(function(event) {

        var card = document.createElement("div");
        card.className = "event-card";

        // Image section
        var imageSection = document.createElement("div");
        imageSection.className = "event-image";

        var img = document.createElement("img");
        img.src = event.image || "";
        img.alt = event.title || "Event image";

        var category = document.createElement("span");
        category.className = "event-category";
        category.textContent = event.category || "Event";

        var date = document.createElement("span");
        date.className = "event-date";
        date.textContent = formatDate(event.date);

        imageSection.appendChild(img);
        imageSection.appendChild(category);
        imageSection.appendChild(date);

        // Event information
        var info = document.createElement("div");
        info.className = "event-info";

        var title = document.createElement("h3");
        title.textContent = event.title || "Untitled Event";

        var venue = document.createElement("p");
        venue.textContent = "📍 " + (event.venue || "Venue not available");

        var time = document.createElement("p");
        time.textContent = "🕒 " + (event.time || "Time TBA");

        info.appendChild(title);
        info.appendChild(venue);
        info.appendChild(time);

        if (event.performers) {

            var performers = document.createElement("p");
            performers.className = "performers";
            performers.textContent = "✦ " + event.performers;

            info.appendChild(performers);
        }

        var price = document.createElement("p");
        price.className = "price";
        price.textContent = "Rs. " + event.price + " / seat";

        info.appendChild(price);

        // BOOK TICKETS BUTTON
        var button = document.createElement("button");
        button.className = "book-btn";
        button.textContent = "Book Tickets →";

        button.addEventListener("click", function() {

            // Save selected event ID
            localStorage.setItem(
                "selectedEventId",
                String(event.id)
            );

            // Redirect to seat selection
            window.location.href = "seat.html";

        });

        info.appendChild(button);

        card.appendChild(imageSection);
        card.appendChild(info);

        eventsContainer.appendChild(card);

    });
}


// =========================
// SEARCH EVENTS
// =========================

function searchEvents() {

    var searchValue = searchInput.value.toLowerCase().trim();

    var upcomingEvents = events.filter(isUpcoming);

    var filteredEvents = upcomingEvents.filter(function(event) {

        var title = (event.title || "").toLowerCase();
        var category = (event.category || "").toLowerCase();
        var venue = (event.venue || "").toLowerCase();
        var performers = (event.performers || "").toLowerCase();

        return (
            title.includes(searchValue) ||
            category.includes(searchValue) ||
            venue.includes(searchValue) ||
            performers.includes(searchValue)
        );

    });

    showEvents(filteredEvents);
}


// =========================
// INITIAL DISPLAY
// =========================

searchInput.addEventListener("input", searchEvents);

searchEvents();
