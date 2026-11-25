
document.addEventListener("DOMContentLoaded", function () {
    const booking = JSON.parse(localStorage.getItem("currentBooking") || "null");
    const bookingInfo = document.getElementById("booking-info");
    const payButton = document.getElementById("pay-button");
    const paymentOptions = document.querySelectorAll('input[name="payment"]');

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
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

    if (!booking) {
        bookingInfo.innerHTML = `
            <p class="loading">
                No booking found. Please select your event and seats first.
            </p>
        `;
        payButton.disabled = true;
        return;
    }

    const seats = Array.isArray(booking.seats) ? booking.seats : [];
    const quantity = Number(booking.quantity) || seats.length;
    const total = Number(booking.total ?? booking.totalAmount) || 0;

    bookingInfo.innerHTML = `
        <div class="booking-item">
            <strong>Event</strong>
            <span>${escapeHTML(booking.eventName)}</span>
        </div>
        <div class="booking-item">
            <strong>Date</strong>
            <span>${escapeHTML(booking.eventDate || booking.date)}</span>
        </div>
        <div class="booking-item">
            <strong>Time</strong>
            <span>${escapeHTML(booking.eventTime || booking.time)}</span>
        </div>
        <div class="booking-item">
            <strong>Venue</strong>
            <span>${escapeHTML(booking.eventVenue || booking.venue)}</span>
        </div>
        <div class="booking-item">
            <strong>Category</strong>
            <span>${escapeHTML(booking.eventCategory || "Event")}</span>
        </div>
        <div class="booking-item">
            <strong>Ticket Block</strong>
            <span>${escapeHTML(booking.block)}</span>
        </div>
        <div class="booking-item">
            <strong>Selected Seats</strong>
            <span>${seats.map(escapeHTML).join(", ") || "Not specified"}</span>
        </div>
        <div class="booking-item">
            <strong>Quantity</strong>
            <span>${quantity}</span>
        </div>
        <div class="booking-item">
            <strong>Price Per Ticket</strong>
            <span>${formatPrice(booking.pricePerTicket)}</span>
        </div>
        <div class="booking-item total">
            <strong>Total Amount</strong>
            <span>${formatPrice(total)}</span>
        </div>
    `;

    const demoNotice = document.createElement("p");
    demoNotice.textContent = "Demo mode: no real payment will be charged. A test ticket will be generated.";
    demoNotice.style.cssText = "font-size:13px;line-height:1.5;color:#b7791f;margin:14px 0;";
    const securityNote = document.querySelector(".security-note");

    if (securityNote) {
        securityNote.insertAdjacentElement("afterend", demoNotice);
    }

    paymentOptions.forEach(function (option) {
        option.addEventListener("change", function () {
            payButton.disabled = false;
            payButton.innerHTML = "Simulate Demo Payment <span>→</span>";
        });
    });

    payButton.addEventListener("click", function () {
        const selectedPayment = document.querySelector('input[name="payment"]:checked');

        if (!selectedPayment) {
            alert("Please select eSewa or Khalti.");
            return;
        }

        const paymentMethod = selectedPayment.value;

        const confirmed = confirm(
            "This is a DEMO payment only.\n\n" +
            "Payment method: " + paymentMethod.toUpperCase() + "\n" +
            "Amount: " + formatPrice(total) + "\n\n" +
            "No real money will be charged. Generate your demo ticket?"
        );

        if (!confirmed) return;

        payButton.disabled = true;
        payButton.textContent = "Generating Ticket...";

        const bookingId = "EH" + Date.now().toString(36).toUpperCase();

        const ticket = {
            bookingId: bookingId,
            eventId: booking.eventId || "",
            eventName: booking.eventName || "EVENTHUB Event",
            eventImage: booking.eventImage || "",
            eventDate: booking.eventDate || booking.date || "",
            eventTime: booking.eventTime || booking.time || "",
            eventVenue: booking.eventVenue || booking.venue || "",
            eventCategory: booking.eventCategory || "",
            block: booking.block || "",
            seats: seats,
            quantity: quantity,
            pricePerTicket: Number(booking.pricePerTicket) || 0,
            total: total,
            paymentMethod: paymentMethod,
            paymentStatus: "Demo Paid",
            bookingDate: new Date().toISOString()
        };

        booking.paymentMethod = paymentMethod;
        booking.paymentStatus = "Demo Paid";
        booking.bookingId = bookingId;

        let tickets = [];

        try {
            tickets = JSON.parse(localStorage.getItem("eventhubTickets") || "[]");
            if (!Array.isArray(tickets)) tickets = [];
        } catch (error) {
            tickets = [];
        }

        tickets.push(ticket);

        localStorage.setItem("currentBooking", JSON.stringify(booking));
        localStorage.setItem("currentTicket", JSON.stringify(ticket));
        localStorage.setItem("eventhubTickets", JSON.stringify(tickets));

        window.location.href = "ticket.html";
    });
});
