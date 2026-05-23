// How long you want the animation to take, in ms
const animationDuration = 1000;
// How long each frame should last (60 fps)
const frameDuration = 1000 / 60;
// How many frames total
const totalFrames = Math.round(animationDuration / frameDuration);

// Ease-out function
const easeOutQuad = t => t * (2 - t);

// Animate a single element
const animateCountUp = el => {
  let frame = 0;
  const countTo = parseInt(el.innerHTML, 10);

  const counter = setInterval(() => {
    frame++;
    const progress = easeOutQuad(frame / totalFrames);
    const currentCount = Math.round(countTo * progress);

    if (parseInt(el.innerHTML, 10) !== currentCount) {
      el.innerHTML = currentCount;
    }

    if (frame === totalFrames) {
      clearInterval(counter);
    }
  }, frameDuration);
};

// Run on all .countup elements
const runAnimations = () => {
  const countupEls = document.querySelectorAll('.countup');
  countupEls.forEach(animateCountUp);
};

// Automatically start when the page has loaded
document.addEventListener('DOMContentLoaded', runAnimations);
