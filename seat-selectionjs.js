
"use strict";

const params = new URLSearchParams(window.location.search);

const eventId =
    params.get("event_id") ||
    localStorage.getItem("selectedEventId");

let events = [];

try {
    events = JSON.parse(localStorage.getItem("eventoraEvents") || "[]");
} catch (error) {
    events = [];
}

const selectedEvent = events.find(function(event) {
    return String(event.id) === String(eventId);
});

let selectedBlock = "";
let selectedSeats = [];
let ticketPrice = 0;

const seatGrid = document.getElementById("seat-grid");
const individualSection = document.getElementById("individual-section");
const continueButton = document.getElementById("continue-btn");

function getPrice(value) {
    const price = Number(String(value || "0").replace(/[^0-9.]/g, ""));
    return Number.isFinite(price) ? price : 0;
}

function formatPrice(value) {
    return "Rs. " + Number(value).toLocaleString("en-IN");
}

function getBlockPrices() {
    const basePrice = getPrice(selectedEvent.price);

    return {
        VIP: getPrice(selectedEvent.vipPrice) || basePrice * 3,
        Premium: getPrice(selectedEvent.premiumPrice) || basePrice * 2,
        Regular: getPrice(selectedEvent.regularPrice) || basePrice
    };
}

function loadEventDetails() {
    const event = selectedEvent;

    document.getElementById("event-name").textContent =
        event.title || "Untitled Event";

    document.getElementById("event-description").textContent =
        event.description || "Choose your perfect spot and enjoy the experience.";

    document.getElementById("event-category").textContent =
        event.category || "EVENT BOOKING";

    document.getElementById("event-date").textContent =
        "📅 " + (event.date || "Date not available");

    document.getElementById("event-time").textContent =
        "🕕 " + (event.time || "Time not available");

    document.getElementById("event-location").textContent =
        "📍 " + (event.venue || "Venue not available");

    document.getElementById("summary-event-name").textContent =
        event.title || "Your Event";

    document.getElementById("summary-event-date").textContent =
        event.date || "Event date";

    document.getElementById("venue-title").textContent =
        event.venue ? event.venue.toUpperCase() : "EVENT AREA";

    document.getElementById("venue-subtitle").textContent =
        event.title ? event.title.toUpperCase() : "YOUR EVENT EXPERIENCE";

    const poster = document.getElementById("event-poster");
    const posterContainer = document.getElementById("event-poster-container");

    if (event.image) {
        poster.src = event.image;
        posterContainer.style.display = "block";

        poster.onerror = function() {
            posterContainer.style.display = "none";
        };
    }

    const prices = getBlockPrices();

    document.getElementById("vip-price").textContent =
        formatPrice(prices.VIP);

    document.getElementById("premium-price").textContent =
        formatPrice(prices.Premium);

    document.getElementById("regular-price").textContent =
        formatPrice(prices.Regular);
}

if (selectedEvent) {
    loadEventDetails();
} else {
    document.getElementById("event-name").textContent = "Event Not Found";
    document.getElementById("event-description").textContent =
        "Please return to the User Dashboard and select an event again.";
}

document.querySelectorAll(".seat-block").forEach(function(block) {
    block.addEventListener("click", function() {
        if (!selectedEvent) return;

        document.querySelectorAll(".seat-block").forEach(function(item) {
            item.classList.remove("active");
        });

        block.classList.add("active");

        selectedBlock = block.dataset.block;

        const prices = getBlockPrices();
        ticketPrice = prices[selectedBlock];

        selectedSeats = [];

        document.getElementById("selected-block-name").textContent =
            selectedBlock + " Seats";

        individualSection.classList.add("show");

        createSeats();
        updateSummary();

        individualSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

function createSeats() {
    seatGrid.innerHTML = "";

    const rows = ["A", "B", "C", "D", "E", "F"];

    rows.forEach(function(row) {
        const rowElement = document.createElement("div");
        rowElement.className = "seat-row";

        const rowLabel = document.createElement("span");
        rowLabel.className = "row-label";
        rowLabel.textContent = row;

        rowElement.appendChild(rowLabel);

        for (let number = 1; number <= 10; number++) {
            const seat = document.createElement("button");

            seat.type = "button";
            seat.className = "seat";
            seat.textContent = number;
            seat.dataset.seat = row + number;

            seat.addEventListener("click", function() {
                toggleSeat(seat);
            });

            rowElement.appendChild(seat);
        }

        seatGrid.appendChild(rowElement);
    });
}

function toggleSeat(seat) {
    const seatName = seat.dataset.seat;

    if (seat.classList.contains("selected")) {
        seat.classList.remove("selected");

        selectedSeats = selectedSeats.filter(function(item) {
            return item !== seatName;
        });
    } else {
        if (selectedSeats.length >= 6) {
            alert("You can select a maximum of 6 seats.");
            return;
        }

        seat.classList.add("selected");
        selectedSeats.push(seatName);
    }

    updateSummary();
}

function updateSummary() {
    const quantity = selectedSeats.length;
    const total = quantity * ticketPrice;

    document.getElementById("summary-block").textContent =
        selectedBlock || "None";

    document.getElementById("summary-seats").textContent =
        selectedSeats.length ? selectedSeats.join(", ") : "None";

    document.getElementById("summary-quantity").textContent =
        quantity;

    document.getElementById("summary-price").textContent =
        formatPrice(ticketPrice);

    document.getElementById("total-price").textContent =
        formatPrice(total);

    document.getElementById("seat-count").textContent =
        quantity + " / 6 seats selected";

    continueButton.disabled = quantity === 0;
}

continueButton.addEventListener("click", function() {
    if (!selectedEvent || !selectedBlock || selectedSeats.length === 0) {
        alert("Please select your block and seats first.");
        return;
    }

    const total = selectedSeats.length * ticketPrice;

    const booking = {
        eventId: selectedEvent.id,
        eventName: selectedEvent.title || "Untitled Event",
        eventImage: selectedEvent.image || "",
        eventDate: selectedEvent.date || "",
        eventTime: selectedEvent.time || "",
        eventVenue: selectedEvent.venue || "",
        eventCategory: selectedEvent.category || "",
        date: selectedEvent.date || "",
        time: selectedEvent.time || "",
        venue: selectedEvent.venue || "",
        block: selectedBlock,
        seats: selectedSeats,
        quantity: selectedSeats.length,
        pricePerTicket: ticketPrice,
        total: total,
        totalAmount: total
    };

    localStorage.setItem("currentBooking", JSON.stringify(booking));

    window.location.href = "payment.html";
});
