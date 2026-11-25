
document.addEventListener("DOMContentLoaded", function () {
    let ticket = null;

    try {
        ticket = JSON.parse(localStorage.getItem("currentTicket") || "null");
    } catch (error) {
        ticket = null;
    }

    if (!ticket) {
        document.querySelector(".ticket-page").innerHTML = `
            <div class="success-heading">
                <h1>No Ticket Found</h1>
                <p>Please complete your booking first.</p>
                <a href="user.html">Return to Dashboard</a>
            </div>
        `;
        return;
    }

    function setText(id, value) {
        document.getElementById(id).textContent = value || "Not provided";
    }

    function formatPrice(amount) {
        return "Rs. " + Number(amount || 0).toLocaleString("en-IN");
    }

    setText("ticket-category", ticket.eventCategory || "EVENT");
    setText("ticket-event-name", ticket.eventName);
    setText("ticket-date", "Date: " + (ticket.eventDate || "Not provided"));
    setText("ticket-time", "Time: " + (ticket.eventTime || "Not provided"));
    setText("ticket-venue", "Venue: " + (ticket.eventVenue || "Not provided"));
    setText("ticket-booking-id", ticket.bookingId);
    setText("ticket-block", ticket.block);
    setText("ticket-seats", Array.isArray(ticket.seats) ? ticket.seats.join(", ") : "Not provided");
    setText("ticket-quantity", ticket.quantity);
    setText("ticket-payment", String(ticket.paymentMethod || "").toUpperCase());
    setText("ticket-total", formatPrice(ticket.total));

    const poster = document.getElementById("ticket-image");

    if (ticket.eventImage) {
        poster.src = ticket.eventImage;
        poster.onerror = function () {
            poster.style.display = "none";
        };
    } else {
        poster.style.display = "none";
    }

    const qrData = JSON.stringify({
        bookingId: ticket.bookingId,
        event: ticket.eventName,
        seats: ticket.seats,
        status: ticket.paymentStatus
    });

    document.getElementById("ticket-qr").src =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(qrData);

    document.getElementById("print-ticket").addEventListener("click", function () {
        window.print();
    });
});
