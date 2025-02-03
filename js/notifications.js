document.addEventListener("DOMContentLoaded", () => {
    const jobsPerPage = 12;
    const notificationsContainer = document.querySelector(".notifications-container");

    // Extract notification data dynamically
    function getNotifications() {
        const dateSections = document.querySelectorAll(".date-section");
        let notifications = [];

        dateSections.forEach((section) => {
            const dateTitle = section.querySelector(".date-title").textContent.trim();
            const notificationCards = section.querySelectorAll(".notification-card");
            
            notificationCards.forEach((card) => {
                notifications.push({
                    date: parseDateTitle(dateTitle),
                    card: card.cloneNode(true) // Clone the card to avoid reusing original nodes
                });
            });
        });

        return notifications.sort((a, b) => b.date - a.date); // Sort by most recent date
    }

    // Parse date strings in "MM/DD/YY" or "DD-MM-YYYY" formats
    function parseDateTitle(dateTitle) {
        const dateFormats = [
            /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // "MM/DD/YY" or "MM/DD/YYYY"
            /(\d{1,2})-(\d{1,2})-(\d{4})/     // "DD-MM-YYYY"
        ];
        
        for (const format of dateFormats) {
            const match = dateTitle.match(format);
            if (match) {
                const [_, month, day, year] = match.map(Number);
                return new Date(year < 100 ? year + 2000 : year, month - 1, day);
            }
        }
        return new Date(); // Fallback to the current date if parsing fails
    }

    // Pagination setup
    let currentPage = 0;

    function renderNotifications(notifications, page) {
        // Clear the container
        notificationsContainer.innerHTML = `<div class="notifications-header">NOTIFICATIONS</div>`;
        
        const start = page * jobsPerPage;
        const end = Math.min(start + jobsPerPage, notifications.length);
        const paginatedNotifications = notifications.slice(start, end);

        if (paginatedNotifications.length === 0) {
            notificationsContainer.innerHTML += `<div>No more notifications available.</div>`;
            return;
        }

        // Group by date and render
        let currentRenderedDate = "";

        paginatedNotifications.forEach(({ date, card }) => {
            const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;

            if (dateString !== currentRenderedDate) {
                notificationsContainer.innerHTML += `<div class="date-title">${dateString}</div>`;
                currentRenderedDate = dateString;
            }

            notificationsContainer.appendChild(card);
        });

        // Add pagination controls
        renderPaginationControls(page, notifications);
    }

    function renderPaginationControls(page, notifications) {
        const paginationControls = `
            <div class="pagination-buttons">
                <button id="prev-page" ${page === 0 ? "disabled" : ""}>Previous</button>
                <button id="next-page" ${page * jobsPerPage + jobsPerPage >= notifications.length ? "disabled" : ""}>Next</button>
            </div>
        `;
        notificationsContainer.innerHTML += paginationControls;

        document.getElementById("prev-page").addEventListener("click", () => {
            if (currentPage > 0) {
                currentPage--;
                renderNotifications(notifications, currentPage);
            }
        });

        document.getElementById("next-page").addEventListener("click", () => {
            if (currentPage * jobsPerPage + jobsPerPage < notifications.length) {
                currentPage++;
                renderNotifications(notifications, currentPage);
            }
        });
    }

    // Initial render
    const notifications = getNotifications();
    renderNotifications(notifications, currentPage);
});
