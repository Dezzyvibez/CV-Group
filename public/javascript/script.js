// ==========================================
// ARTIST DATA
// ==========================================

const artists = [
    { name: "KILOGRAM", img: "img/kilogram.png" },
    { name: "JENNY", img: "img/jenny.png" },
    { name: "POLAR", img: "img/Polar.png" },
    { name: "QUEEN PRIA", img: "img/queenpriaman.jpg" },
    { name: "DJ SKYROOT", img: "img/skyroot.jpg" },
    { name: "BELLA", img: "img/Bella.png" },
    { name: "EMBRYO", img: "img/Embryo.png" }
];


// ==========================================
// SERVICE / GALLERY DATA
// ==========================================

const gallery = [
    {
        title: "Music Production",
        desc: "World-class recording, mixing, and mastering at ChopVibe Studios.",
        name: "KILOGRAM",
        img: "kilogram.png"
    },
    {
        title: "Digital Agency",
        desc: "Expert web development and graphic design for modern brands.",
        name: "KILOGRAM",
        img: "kilogram.png"
    },
    {
        title: "Visuals",
        desc: "Cinematic music video shoots and professional editing services.",
        name: "KILOGRAM",
        img: "kilogram.png"
    },
    {
        title: "Rixxa Tickets",
        desc: "Seamless event ticketing and management powered by our custom tech.",
        name: "KILOGRAM",
        img: "kilogram.png"
    }
];


// ==========================================
// INJECT ARTISTS
// ==========================================

const artistGrid = document.getElementById("artistGrid");

if (artistGrid) {

    artists.forEach(a => {

        artistGrid.innerHTML += `
            <div class="artist-card">
                <img 
                    src="${a.img}" 
                    alt="${a.name}" 
                    onerror="this.style.display='none'"
                >

                <div class="artist-overlay">
                    <h3>${a.name}</h3>
                </div>
            </div>
        `;

    });

}


// ==========================================
// INJECT GALLERY
// ==========================================

const galleryGrid = document.getElementById("galleryGrid");

if (galleryGrid) {

    gallery.forEach(s => {

        galleryGrid.innerHTML += `
            <div class="gallery-card">

                <h3>${s.title}</h3>

                <p>${s.desc}</p>

            </div>
        `;

    });

}


// ==========================================
// HEADER SCROLL EFFECT
// ==========================================

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if (!header) return;

    if (window.scrollY > 50) {

        header.style.background = "#000";

        header.style.boxShadow =
            "0 5px 20px rgba(0,0,0,0.0)";

    } else {

        header.style.background = "transparent";

        header.style.boxShadow = "none";

    }

});


// ==========================================
// SCROLL REVEAL
// ==========================================

const revealOnScroll = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                revealOnScroll.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.2
    }
);


const elementsToWatch = document.querySelectorAll(
    ".artist-card, .service-card, .aboutimg, .cardtext, .cardimg"
);

elementsToWatch.forEach(el => {

    revealOnScroll.observe(el);

});


// ==========================================
// SEARCH LOGIC
// ==========================================

const searchOpen = document.getElementById("searchOpen");
const searchClose = document.getElementById("searchClose");
const searchOverlay = document.getElementById("searchOverlay");


// Open search

if (searchOpen && searchOverlay) {

    searchOpen.addEventListener("click", () => {

        searchOverlay.style.display = "block";

        const input = searchOverlay.querySelector("input");

        if (input) {
            input.focus();
        }

    });

}


// Close search

if (searchClose && searchOverlay) {

    searchClose.addEventListener("click", () => {

        searchOverlay.style.display = "none";

    });

}


// Close search with Escape

window.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && searchOverlay) {

        searchOverlay.style.display = "none";

    }

});


// ==========================================
// TALENT PORTAL / JOIN ROSTER
// ==========================================

const modal = document.getElementById("talentPortalModal");
const joinBtn = document.getElementById("join-roster");
const closeBtn = document.getElementById("closePortal");
const artistForm = document.getElementById("artistForm");


// Open modal

if (joinBtn && modal) {

    joinBtn.addEventListener("click", (e) => {

        e.preventDefault();

        modal.style.display = "flex";

        setTimeout(() => {

            modal.classList.add("active");

        }, 10);

    });

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    if (!modal) return;

    modal.classList.remove("active");

    setTimeout(() => {

        modal.style.display = "none";

    }, 300);

}


// Close button

if (closeBtn) {

    closeBtn.addEventListener("click", closeModal);

}


// ==========================================
// ARTIST FORM
// ==========================================

if (artistForm) {

    artistForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const submitBtn =
            artistForm.querySelector(".btn-submit");

        if (!submitBtn) return;

        submitBtn.innerText = "Sending Vibe...";

        submitBtn.disabled = true;


        // Simulated API call

        setTimeout(() => {

            alert(
                "Success! The streets have spoken. We'll listen to your demo soon."
            );

            artistForm.reset();

            submitBtn.innerText = "Submit Demo";

            submitBtn.disabled = false;

            closeModal();

        }, 2000);

    });

}


// ==========================================
// HEADER SCROLLED CLASS
// ==========================================

window.addEventListener("scroll", function () {

    const header = document.querySelector("header");

    if (!header) return;

    if (window.scrollY > 50) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});


// ==========================================
// MOBILE HAMBURGER MENU
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const hamburger =
        document.getElementById("hamburger");

    const navLinks =
        document.getElementById("navLinks");


    // Make sure both elements exist

    if (!hamburger || !navLinks) {

        console.warn(
            "Hamburger menu elements not found:",
            {
                hamburger,
                navLinks
            }
        );

        return;

    }


    // Open / close menu

    hamburger.addEventListener("click", function () {

        hamburger.classList.toggle("active");

        navLinks.classList.toggle("active");

    });


    // Close menu after clicking a link

    const navItems = navLinks.querySelectorAll("a");

    navItems.forEach(function (link) {

        link.addEventListener("click", function () {

            hamburger.classList.remove("active");

            navLinks.classList.remove("active");

        });

    });

});
