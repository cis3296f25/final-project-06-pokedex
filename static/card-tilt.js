document.addEventListener('DOMContentLoaded', () => {
    function activateCardTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.transition = 'transform 0.1s ease-out';
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

    document.querySelectorAll('.pokemon-card').forEach(activateCardTilt);

    const observer = new MutationObserver(() => {
        document.querySelectorAll('.pokemon-card').forEach(card => {
            if (!card.dataset.tiltEnabled) {
                activateCardTilt(card);
                card.dataset.tiltEnabled = 'true';
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});