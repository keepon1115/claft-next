document.addEventListener('DOMContentLoaded', () => {

    // ─── スクロール進捗バー ───
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / total) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }, { passive: true });
    }

    // ─── ヒーロー背景のパララックス ───
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                const offset = window.scrollY * 0.3;
                heroBg.style.transform = `translateY(${offset}px)`;
            }
        }, { passive: true });
    }

    // ─── スクロールフェードイン（IntersectionObserver） ───
    const fadeOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, fadeOptions);

    document.querySelectorAll('.section-fade').forEach(el => {
        fadeObserver.observe(el);
    });

    // ─── NARUTOセクション：背景漢字の微細な揺らぎ ───
    const bgKanji = document.querySelector('.naruto-bg-kanji');
    if (bgKanji) {
        let tick = 0;
        const animate = () => {
            tick += 0.008;
            const scale = 1 + Math.sin(tick) * 0.012;
            const opacity = 0.04 + Math.sin(tick * 0.7) * 0.01;
            bgKanji.style.transform = `scale(${scale})`;
            bgKanji.style.color = `rgba(180, 146, 42, ${opacity})`;
            requestAnimationFrame(animate);
        };
        animate();
    }

    // ─── ダイアログ吹き出し：ストール付きフェードイン ───
    const dialogues = document.querySelectorAll('.dialogue');
    dialogues.forEach((dialogue, index) => {
        dialogue.style.transitionDelay = `${(index % 3) * 0.08}s`;
    });

});
