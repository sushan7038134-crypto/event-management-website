
"use strict";

const EVENT_KEY = "eventoraEvents";
const TICKET_KEY = "eventhubTickets";
const CURRENT_TICKET_KEY = "currentTicket";

let events = [];
let tickets = [];

function loadData() {
    try {
        events = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]");
        if (!Array.isArray(events)) events = [];
    } catch {
        events = [];
    }

    try {
        tickets = JSON.parse(localStorage.getItem(TICKET_KEY) || "[]");
        if (!Array.isArray(tickets)) tickets = [];
    } catch {
        tickets = [];
    }
}

function saveTickets() {
    localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));
}

function getTicketEventId(ticket) {
    return ticket.eventId ??
        ticket.event_id ??
        ticket.selectedEventId ??
        ticket.event?.id ??
        null;
}

function belongsToDeletedEvent(ticket, event) {
    const ticketEventId = getTicketEventId(ticket);

    if (ticketEventId !== null) {
        return String(ticketEventId) === String(event.id);
    }

    return String(ticket.eventName || "").trim().toLowerCase() ===
        String(event.title || "").trim().toLowerCase();
}

function removeTicketsForDeletedEvents() {
    const oldTickets = tickets.length;

    tickets = tickets.filter(ticket =>
        events.some(event => belongsToDeletedEvent(ticket, event))
    );

    if (tickets.length !== oldTickets) {
        saveTickets();
    }

    try {
        const currentTicket = JSON.parse(
            localStorage.getItem(CURRENT_TICKET_KEY) || "null"
        );

        if (currentTicket) {
            const stillExists = tickets.some(ticket =>
                ticket.bookingId === currentTicket.bookingId
            );

            if (!stillExists) {
                localStorage.removeItem(CURRENT_TICKET_KEY);
            }
        }
    } catch {
        localStorage.removeItem(CURRENT_TICKET_KEY);
    }
}

loadData();
removeTicketsForDeletedEvents();

try {
    const currentTicket = JSON.parse(
        localStorage.getItem(CURRENT_TICKET_KEY) || "null"
    );

    if (currentTicket && currentTicket.bookingId) {
        const eventStillExists = events.some(event =>
            belongsToDeletedEvent(currentTicket, event)
        );

        const alreadyExists = tickets.some(ticket =>
            ticket.bookingId === currentTicket.bookingId
        );

        if (eventStillExists && !alreadyExists) {
            tickets.push(currentTicket);
            saveTickets();
        }
    }
} catch (error) {
    console.error("Unable to restore current ticket:", error);
}

const homeContainer = document.getElementById("home-events-container");
const exploreContainer = document.getElementById("events-container");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

function formatPrice(amount) {
    return "Rs. " + Number(amount || 0).toLocaleString("en-IN");
}

function buildCard(event, index) {
    return `
        <div class="event-card">
            <img class="event-image"
                 src="${escapeHTML(event.image || "")}"
                 alt="Event Image">

            <div class="event-info">
                <h3>${escapeHTML(event.title || "Untitled Event")}</h3>

                <p class="event-description">
                    ${escapeHTML(event.description || "")}
                </p>

                <p class="event-detail">
                    Category: ${escapeHTML(event.category || "Event")}
                </p>

                <p class="event-detail">
                    Date: ${escapeHTML(event.date || "")}
                </p>

                <p class="event-detail">
                    Time: ${escapeHTML(event.time || "")}
                </p>

                <p class="event-detail">
                    Venue: ${escapeHTML(event.venue || "")}
                </p>

                <h4 class="event-price">
                    ${formatPrice(event.price)}
                </h4>

                <button class="book-btn"
                        type="button"
                        data-index="${index}">
                    Book Now
                </button>
            </div>
        </div>
    `;
}

function renderEventList(container, eventList) {
    if (!container) return;

    if (eventList.length === 0) {
        container.innerHTML = "<p>No matching events found.</p>";
        return;
    }

    container.innerHTML = eventList.map(function(event) {
        return buildCard(event, events.indexOf(event));
    }).join("");
}

function showEvents() {
    if (!homeContainer || !exploreContainer) return;

    if (events.length === 0) {
        homeContainer.innerHTML = "<p>No events available.</p>";
        exploreContainer.innerHTML = "<p>No events available.</p>";
        return;
    }

    homeContainer.innerHTML = events
        .slice(0, 3)
        .map((event, index) => buildCard(event, index))
        .join("");

    exploreContainer.innerHTML = events
        .map((event, index) => buildCard(event, index))
        .join("");
}

function bookEvent(index) {
    const selectedEvent = events[index];

    if (!selectedEvent) {
        alert("Event not found.");
        return;
    }

    localStorage.setItem("selectedEventId", selectedEvent.id);

    window.location.href =
        "seatselect.html?event_id=" +
        encodeURIComponent(selectedEvent.id);
}

function showTickets() {
    const ticketsPage = document.getElementById("tickets");

    if (!ticketsPage) return;

    if (tickets.length === 0) {
        ticketsPage.innerHTML = `
            <div class="page-heading">
                <p>YOUR EXPERIENCES</p>
                <h1>My Tickets</h1>
                <span>Keep track of your upcoming events and bookings.</span>
            </div>

            <div class="empty-state">
                <div class="empty-icon">♧</div>
                <h2>No tickets yet</h2>
                <p>Your booked tickets will appear here after payment.</p>
                <button class="hero-btn" data-goto="explore">
                    Discover Events
                </button>
            </div>
        `;
        return;
    }

    ticketsPage.innerHTML = `
        <div class="page-heading">
            <p>YOUR EXPERIENCES</p>
            <h1>My Tickets</h1>
            <span>You have ${tickets.length} saved ticket(s).</span>
        </div>

        <div class="eventhub-ticket-list">
            ${tickets.slice().reverse().map(function(ticket, index) {
                const originalIndex = tickets.length - 1 - index;

                return `
                    <div class="eventhub-ticket-card">
                        <div class="eventhub-ticket-image">
                            ${ticket.eventImage
                                ? `<img src="${escapeHTML(ticket.eventImage)}" alt="Event poster">`
                                : `<div class="eventhub-no-image">EVENTHUB</div>`
                            }
                        </div>

                        <div class="eventhub-ticket-info">
                            <span class="eventhub-ticket-status">DEMO PAID</span>
                            <h2>${escapeHTML(ticket.eventName || "Event")}</h2>

                            <p><strong>Booking ID:</strong> ${escapeHTML(ticket.bookingId || "")}</p>
                            <p><strong>Date:</strong> ${escapeHTML(ticket.eventDate || "")}</p>
                            <p><strong>Time:</strong> ${escapeHTML(ticket.eventTime || "")}</p>
                            <p><strong>Venue:</strong> ${escapeHTML(ticket.eventVenue || "")}</p>
                            <p><strong>Block:</strong> ${escapeHTML(ticket.block || "")}</p>
                            <p><strong>Seats:</strong> ${escapeHTML(
                                Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ""
                            )}</p>
                            <p><strong>Payment:</strong> ${escapeHTML(
                                String(ticket.paymentMethod || "").toUpperCase()
                            )}</p>

                            <div class="eventhub-ticket-bottom">
                                <strong>${formatPrice(ticket.total)}</strong>

                                <div class="eventhub-ticket-actions">
                                    <button class="eventhub-view-ticket"
                                            type="button"
                                            data-ticket-index="${originalIndex}">
                                        View Ticket →
                                    </button>

                                    <button class="eventhub-delete-ticket"
                                            type="button"
                                            data-delete-ticket="${originalIndex}">
                                        Delete Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function deleteTicket(index) {
    const ticket = tickets[index];

    if (!ticket) {
        alert("Ticket not found.");
        return;
    }

    if (!confirm("Are you sure you want to delete this ticket?")) return;

    const deletedBookingId = ticket.bookingId;

    tickets.splice(index, 1);
    saveTickets();

    try {
        const currentTicket = JSON.parse(
            localStorage.getItem(CURRENT_TICKET_KEY) || "null"
        );

        if (currentTicket &&
            currentTicket.bookingId === deletedBookingId) {
            localStorage.removeItem(CURRENT_TICKET_KEY);
        }
    } catch {
        localStorage.removeItem(CURRENT_TICKET_KEY);
    }

    showTickets();
    showPayments();
    alert("Ticket deleted successfully.");
}

function showPayments() {
    const paymentsPage = document.getElementById("payments");

    if (!paymentsPage) return;

    if (tickets.length === 0) {
        paymentsPage.innerHTML = `
            <div class="page-heading">
                <p>YOUR TRANSACTIONS</p>
                <h1>Payments</h1>
                <span>View your payment history and transaction details.</span>
            </div>

            <div class="empty-state">
                <div class="empty-icon">₨</div>
                <h2>No transactions yet</h2>
                <p>Your payment records will appear here.</p>
            </div>
        `;
        return;
    }

    paymentsPage.innerHTML = `
        <div class="page-heading">
            <p>YOUR TRANSACTIONS</p>
            <h1>Payments</h1>
            <span>Your saved booking payment records.</span>
        </div>

        <div class="eventhub-payment-list">
            ${tickets.slice().reverse().map(function(ticket) {
                return `
                    <div class="eventhub-payment-card">
                        <div>
                            <h3>${escapeHTML(ticket.eventName || "Event")}</h3>
                            <p>Booking ID: ${escapeHTML(ticket.bookingId || "")}</p>
                            <p>Method: ${escapeHTML(
                                String(ticket.paymentMethod || "").toUpperCase()
                            )}</p>
                            <span class="eventhub-ticket-status">DEMO PAID</span>
                        </div>

                        <strong>${formatPrice(ticket.total)}</strong>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function openTicket(index) {
    const ticket = tickets[index];

    if (!ticket) {
        alert("Ticket not found.");
        return;
    }

    localStorage.setItem(CURRENT_TICKET_KEY, JSON.stringify(ticket));
    window.location.href = "ticket.html";
}

function showPage(pageName, clickedNav) {
    document.querySelectorAll(".page").forEach(function(page) {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(function(nav) {
        nav.classList.remove("active");
    });

    const targetPage = document.getElementById(pageName);

    if (targetPage) targetPage.classList.add("active");

    if (clickedNav) clickedNav.classList.add("active");

    if (pageName === "tickets") showTickets();
    if (pageName === "payments") showPayments();

    if (pageName === "explore") {
        const exploreSearch = document.getElementById("explore-search");
        if (exploreSearch && !exploreSearch.value) {
            renderEventList(exploreContainer, events);
        }
    }
}

// SEARCH FUNCTIONALITY

function searchEvents(searchValue) {
    const searchTerm = String(searchValue || "").trim().toLowerCase();

    const filteredEvents = events.filter(function(event) {
        return [
            event.title,
            event.description,
            event.category,
            event.venue,
            event.performers
        ].some(function(value) {
            return String(value || "").toLowerCase().includes(searchTerm);
        });
    });

    renderEventList(exploreContainer, filteredEvents);
}

const searchInput = document.getElementById("search");
const exploreSearch = document.getElementById("explore-search");
const searchButton = document.getElementById("search-button");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        showPage("explore");
        if (exploreSearch) exploreSearch.value = searchInput.value;
        searchEvents(searchInput.value);
    });

    searchInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            showPage("explore");
            if (exploreSearch) exploreSearch.value = searchInput.value;
            searchEvents(searchInput.value);
        }
    });
}

if (searchButton) {
    searchButton.addEventListener("click", function() {
        showPage("explore");

        if (exploreSearch) {
            exploreSearch.value = searchInput ? searchInput.value : "";
        }

        searchEvents(searchInput ? searchInput.value : "");
    });
}

if (exploreSearch) {
    exploreSearch.addEventListener("input", function() {
        searchEvents(exploreSearch.value);
    });
}

// BUTTONS AND NAVIGATION

document.addEventListener("click", function(e) {
    const bookButton = e.target.closest(".book-btn");

    if (bookButton) {
        e.preventDefault();
        bookEvent(Number(bookButton.dataset.index));
        return;
    }

    const deleteButton = e.target.closest("[data-delete-ticket]");

    if (deleteButton) {
        deleteTicket(Number(deleteButton.dataset.deleteTicket));
        return;
    }

    const ticketButton = e.target.closest(".eventhub-view-ticket");

    if (ticketButton) {
        openTicket(Number(ticketButton.dataset.ticketIndex));
        return;
    }

    const navItem = e.target.closest(".nav-item[data-page]");

    if (navItem) {
        showPage(navItem.dataset.page, navItem);
        return;
    }

    const gotoButton = e.target.closest("[data-goto]");

    if (gotoButton) {
        showPage(gotoButton.dataset.goto);
    }
});

// LIVE UPDATES FROM ORGANIZER DASHBOARD

window.addEventListener("storage", function(event) {
    if (event.key === EVENT_KEY) {
        loadData();
        removeTicketsForDeletedEvents();
        showEvents();
        showTickets();
        showPayments();

        if (exploreSearch && exploreSearch.value) {
            searchEvents(exploreSearch.value);
        }
    }

    if (event.key === TICKET_KEY) {
        try {
            tickets = JSON.parse(event.newValue || "[]");
            if (!Array.isArray(tickets)) tickets = [];
        } catch {
            tickets = [];
        }

        showTickets();
        showPayments();
    }
});

// TICKET STYLING

const style = document.createElement("style");

style.textContent = `
    .eventhub-ticket-list,
    .eventhub-payment-list {
        display: grid;
        gap: 22px;
        margin-top: 30px;
    }

    .eventhub-ticket-card {
        display: flex;
        gap: 22px;
        padding: 20px;
        border: 1px solid rgba(180, 150, 100, 0.2);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.035);
        overflow: hidden;
    }

    .eventhub-ticket-image {
        width: 165px;
        min-width: 165px;
        min-height: 190px;
        border-radius: 9px;
        overflow: hidden;
        background: #171717;
    }

    .eventhub-ticket-image img {
        width: 100%;
        height: 100%;
        min-height: 190px;
        object-fit: cover;
    }

    .eventhub-no-image {
        height: 190px;
        display: grid;
        place-items: center;
        color: #d9ad62;
        font-weight: 800;
    }

    .eventhub-ticket-info {
        flex: 1;
        min-width: 0;
    }

    .eventhub-ticket-info h2 {
        margin: 10px 0;
    }

    .eventhub-ticket-info p,
    .eventhub-payment-card p {
        margin: 7px 0;
        overflow-wrap: anywhere;
    }

    .eventhub-ticket-status {
        display: inline-block;
        padding: 6px 9px;
        border-radius: 5px;
        background: rgba(35, 150, 90, 0.13);
        color: #39b978;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;
    }

    .eventhub-ticket-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
    }

    .eventhub-ticket-bottom > strong,
    .eventhub-payment-card > strong {
        color: #d9ad62;
        font-size: 19px;
    }

    .eventhub-ticket-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .eventhub-view-ticket,
    .eventhub-delete-ticket {
        padding: 11px 16px;
        border: 0;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
    }

    .eventhub-view-ticket {
        background: #d9ad62;
        color: #111;
    }

    .eventhub-delete-ticket {
        background: #a83232;
        color: white;
    }

    .eventhub-payment-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 22px;
        border: 1px solid rgba(180, 150, 100, 0.2);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.035);
    }

    @media (max-width: 600px) {
        .eventhub-ticket-card {
            flex-direction: column;
        }

        .eventhub-ticket-image {
            width: 100%;
            height: 190px;
        }

        .eventhub-payment-card {
            align-items: flex-start;
            flex-direction: column;
        }
    }
`;

document.head.appendChild(style);

showEvents();
showTickets();
showPayments();
