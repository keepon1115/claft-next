document.addEventListener('DOMContentLoaded', () => {
    // 読了進捗バー (Scroll Progress Bar)
    const progressBar = document.getElementById('progressBar');
    
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    // ヒーロー背景のパララックスエフェクト (Parallax effect for hero background)
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        if (scrollPos < window.innerHeight && heroBg) {
            // 下方向にスクロールするにつれて背景画像を少し移動・拡大させる
            heroBg.style.transform = `scale(1.1) translateY(${scrollPos * 0.35}px)`;
        }
    });

    // スクロールフェードイン用 Intersection Observer (Intersection Observer for fade-in animations on scroll)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -5% 0px', // 画面下部に入る手前で検知
        threshold: 0.12 // 12%が見えたらアニメーション開始
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 一度フェードインしたら監視を解除してパフォーマンスを向上させる
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // フェードイン要素の監視開始
    document.querySelectorAll('.section-fade').forEach(el => {
        observer.observe(el);
    });

    // 会話吹き出しのアニメーション遅延を設定する
    // 同じセクション内で順次フェードインするように遅延を追加
    const interviewSections = document.querySelectorAll('.interview-section');
    interviewSections.forEach(section => {
        const dialogues = section.querySelectorAll('.dialogue');
        dialogues.forEach((dialogue, index) => {
            dialogue.style.transitionDelay = `${index * 0.15}s`;
        });
    });
});
