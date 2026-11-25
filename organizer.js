
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("event-form");
    const eventList = document.getElementById("event-list");
    const imageInput = document.getElementById("image");
    const preview = document.getElementById("preview");
    const errorMessage = document.getElementById("error");

    const totalEvents = document.getElementById("total-events");
    const upcomingEvents = document.getElementById("upcoming-events");
    const totalSeats = document.getElementById("total-seats");

    const menuButtons = document.querySelectorAll(".menu[data-page]");
    const pages = document.querySelectorAll(".page");

    const STORAGE_KEY = "eventoraEvents";
    const TICKET_KEY = "eventhubTickets";

    let events = [];

    try {
        events = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (!Array.isArray(events)) events = [];
    } catch {
        events = [];
    }

    let selectedImage = "";

    function saveEvents() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }

    function showPage(pageId) {

        pages.forEach(page => {
            page.classList.toggle("hidden", page.id !== pageId);
        });

        menuButtons.forEach(button => {
            button.classList.toggle("active", button.dataset.page === pageId);
        });

        if (pageId === "my-events") displayEvents();
        if (pageId === "overview") updateStats();
    }

    menuButtons.forEach(button => {
        button.addEventListener("click", function () {
            showPage(button.dataset.page);
        });
    });

    imageInput.addEventListener("change", function () {

        const file = imageInput.files[0];

        selectedImage = "";
        preview.src = "";
        preview.classList.add("hidden");
        errorMessage.textContent = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            errorMessage.textContent = "Please select a valid image.";
            imageInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            errorMessage.textContent = "Image must be smaller than 2 MB.";
            imageInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function () {
            selectedImage = reader.result;
            preview.src = selectedImage;
            preview.classList.remove("hidden");
        };

        reader.onerror = function () {
            errorMessage.textContent = "Unable to load image.";
        };

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", function (event) {

        event.preventDefault();
        errorMessage.textContent = "";

        const title = document.getElementById("title").value.trim();
        const category = document.getElementById("category").value;
        const performers = document.getElementById("performers").value.trim();
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const venue = document.getElementById("venue").value.trim();
        const price = Number(document.getElementById("price").value);
        const seats = Number(document.getElementById("seats").value);
        const description = document.getElementById("description").value.trim();

        if (!title || !category || !date || !time || !venue || !description) {
            errorMessage.textContent = "Please fill in all required fields.";
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(date + "T00:00:00");

        if (selectedDate < today) {
            errorMessage.textContent = "Please select today or a future date.";
            return;
        }

        if (!Number.isFinite(price) || price < 0) {
            errorMessage.textContent = "Enter a valid ticket price.";
            return;
        }

        if (!Number.isInteger(seats) || seats < 1) {
            errorMessage.textContent = "Enter a valid number of seats.";
            return;
        }

        const newEvent = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            title,
            category,
            performers,
            date,
            time,
            venue,
            price,
            seats,
            description,
            image: selectedImage
        };

        events.push(newEvent);

        try {
            saveEvents();
        } catch (error) {
            events.pop();
            errorMessage.textContent = "Unable to save. Please use a smaller image.";
            return;
        }

        form.reset();
        selectedImage = "";
        preview.src = "";
        preview.classList.add("hidden");

        updateStats();
        displayEvents();
        showPage("my-events");
    });

    function updateStats() {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        totalEvents.textContent = events.length;

        const upcoming = events.filter(event => {
            return new Date(event.date + "T00:00:00") >= today;
        });

        upcomingEvents.textContent = upcoming.length;

        const seats = events.reduce((sum, event) => {
            return sum + Number(event.seats || 0);
        }, 0);

        totalSeats.textContent = seats;
    }

    function displayEvents() {

        eventList.replaceChildren();

        if (events.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-message";
            message.textContent = "No events created yet. Click Create Event to add an event.";
            eventList.appendChild(message);
            return;
        }

        events.forEach(function (event) {

            const card = document.createElement("article");
            card.className = "event-card";

            if (event.image) {
                const image = document.createElement("img");
                image.src = event.image;
                image.alt = event.title;
                card.appendChild(image);
            }

            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = event.category;
            card.appendChild(tag);

            const heading = document.createElement("h3");
            heading.textContent = event.title;
            card.appendChild(heading);

            const details = [
                "Date: " + event.date,
                "Time: " + event.time,
                "Venue: " + event.venue,
                "Performers: " + (event.performers || "Not specified"),
                "Ticket Price: Rs. " + event.price,
                "Available Seats: " + event.seats
            ];

            details.forEach(function (detail) {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            const description = document.createElement("p");
            description.textContent = event.description;
            card.appendChild(description);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete Event";

            deleteButton.addEventListener("click", function () {
                deleteEvent(event.id);
            });

            card.appendChild(deleteButton);
            eventList.appendChild(card);
        });
    }

    function deleteEvent(id) {

        if (!confirm("Are you sure you want to delete this event and its related tickets?")) {
            return;
        }

        const oldEvents = events;
        let oldTickets = null;

        try {

            // Read existing tickets
            oldTickets = localStorage.getItem(TICKET_KEY);

            // Remove selected event
            events = events.filter(event => String(event.id) !== String(id));

            // Save updated event list
            saveEvents();

            // Remove tickets belonging to deleted event
            let tickets = JSON.parse(oldTickets || "[]");

            if (!Array.isArray(tickets)) {
                tickets = [];
            }

            tickets = tickets.filter(ticket => {

                const ticketEventId =
                    ticket.eventId ??
                    ticket.event_id ??
                    ticket.event?.id ??
                    ticket.selectedEventId;

                return String(ticketEventId) !== String(id);
            });

            localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));

        } catch (error) {

            events = oldEvents;

            try {
                saveEvents();

                if (oldTickets !== null) {
                    localStorage.setItem(TICKET_KEY, oldTickets);
                }
            } catch (restoreError) {
                console.error("Unable to restore saved data:", restoreError);
            }

            alert("Unable to delete event and tickets. Please try again.");
            return;
        }

        displayEvents();
        updateStats();

        alert("Event and related tickets deleted successfully.");
    }

    document.getElementById("logout-btn").addEventListener("click", function () {
        alert("Logout will work after login functionality is connected.");
    });

    window.addEventListener("storage", function (event) {

        if (event.key === STORAGE_KEY) {

            try {
                events = JSON.parse(event.newValue) || [];
                if (!Array.isArray(events)) events = [];
            } catch {
                events = [];
            }

            displayEvents();
            updateStats();
        }
    });

    updateStats();
    displayEvents();
    showPage("overview");

});
