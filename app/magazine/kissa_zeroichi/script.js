document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect for hero background
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        if (scrollPos < window.innerHeight) {
            heroBg.style.transform = `scale(1.1) translateY(${scrollPos * 0.4}px)`;
        }
    });

    // Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-fade').forEach(el => {
        observer.observe(el);
    });
});
