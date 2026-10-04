// ARTIST DATA (7 Artists)
const artists = [
    { name: "KILOGRAM", img: "img/kilogram.png" },
    { name: "JENNY", img: "img/jenny.png" },
    { name: "POLAR", img: "img/Polar.png" },
    { name: "QUEEN PRIA", img: "img/queenpriaman.jpg" },
    { name: "DJ SKYROOT", img: "img/skyroot.jpg" },
    { name: "BELLA", img: "img/Bella.png" },
    { name: "EMBRYO", img: "img/Embryo.png" }
];

// SERVICE DATA
const gallery = [
    { title: "Music Production", desc: "World-class recording, mixing, and mastering at ChopVibe Studios.", name: "KILOGRAM", img: "kilogram.png" },
    { title: "Digital Agency", desc: "Expert web development and graphic design for modern brands.", name: "KILOGRAM", img: "kilogram.png" },
    { title: "Visuals", desc: "Cinematic music video shoots and professional editing services.", name: "KILOGRAM", img: "kilogram.png" },
    { title: "Rixxa Tickets", desc: "Seamless event ticketing and management powered by our custom tech.", name: "KILOGRAM", img: "kilogram.png" }
];

// Injecting Content
const artistGrid = document.getElementById('artistGrid');
const galleryGrid = document.getElementById('galleryGrid');

artists.forEach(a => {
    artistGrid.innerHTML += `
        <div class="artist-card">
            <img src="${a.img}" alt="${a.name}" onerror="this.src=''">
            <div class="artist-overlay"><h3>${a.name}</h3></div>
        </div>`;
});

gallery.forEach(s => {
    galleryGrid.innerHTML += `
        <div class="gallery-card">
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
        </div>`;
});



// Simple Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = '#000';
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.0)';
    } else {
        header.style.background = 'transparent';
    }
});



const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // This line stops the observer from watching this element again
            revealOnScroll.unobserve(entry.target); 
        }
        // The 'else' block is removed so 'show' is never taken away
    });
}, { threshold: 0.2 }); // Lowered threshold slightly for better UX

// Combine all selectors into one clean loop
const elementsToWatch = document.querySelectorAll('.artist-card, .service-card, .aboutimg, .cardtext, .cardimg');

elementsToWatch.forEach(el => {
    revealOnScroll.observe(el);
});










// Search Logic
const searchOpen = document.getElementById('searchOpen');
const searchClose = document.getElementById('searchClose');
const searchOverlay = document.getElementById('searchOverlay');

// Open Search Overlay
searchOpen.addEventListener('click', () => {
    searchOverlay.style.display = 'block';
    // Focus the input automatically for better UX
    searchOverlay.querySelector('input').focus();
});

// Close Search Overlay
searchClose.addEventListener('click', () => {
    searchOverlay.style.display = 'none';
});

// Close on 'Escape' key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchOverlay.style.display = 'none';
    }
});





// Grab Elements
const modal = document.getElementById('talentPortalModal');
const joinBtn = document.getElementById('join-roster');
const closeBtn = document.getElementById('closePortal');
const artistForm = document.getElementById('artistForm');

// Open Modal
joinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
});



// Handle Form Submission
artistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = artistForm.querySelector('.btn-submit');
    submitBtn.innerText = "Sending Vibe...";
    submitBtn.disabled = true;

    // Simulate API call to your Node.js backend
    setTimeout(() => {
        alert("Success! The streets have spoken. We'll listen to your demo soon.");
        artistForm.reset();
        submitBtn.innerText = "Submit Demo";
        submitBtn.disabled = false;
        closeModal();
    }, 2000);
});




window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    
    // If user scrolls more than 50px, add 'scrolled' class
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});




