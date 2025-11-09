document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', () => {
            field.classList.add('dirty');
        });
    });
});
